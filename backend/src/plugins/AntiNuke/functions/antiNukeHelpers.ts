import {
  AuditLogEvent,
  ChannelType,
  GuildMember,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import { GuildPluginData } from "vety";
import { AntiNukePluginType } from "../types.js";

/** Permissions stripped during panic — server-structure / mass-harm only (not message automod). */
export const DANGEROUS_PERMS = [
  PermissionFlagsBits.Administrator,
  PermissionFlagsBits.ManageGuild,
  PermissionFlagsBits.ManageRoles,
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.ManageWebhooks,
  PermissionFlagsBits.BanMembers,
  PermissionFlagsBits.KickMembers,
  PermissionFlagsBits.MentionEveryone,
  PermissionFlagsBits.ModerateMembers,
] as const;

export function isWhitelisted(pluginData: GuildPluginData<AntiNukePluginType>, member: GuildMember): boolean {
  const config = pluginData.config.get();
  if (config.whitelist_user_ids.includes(member.id)) return true;
  if (config.whitelist_role_ids.some((id) => member.roles.cache.has(id))) return true;
  if (member.id === pluginData.guild.ownerId) return true;
  if (member.id === pluginData.client.user?.id) return true;
  return false;
}

export function trackAndExceeds(
  pluginData: GuildPluginData<AntiNukePluginType>,
  userId: string,
  action: string,
  limit: number,
  windowSeconds: number,
): boolean {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const prev = (pluginData.state.actionLog.get(key) ?? []).filter((t) => now - t < windowMs);
  prev.push(now);
  pluginData.state.actionLog.set(key, prev);
  return prev.length >= limit;
}

export async function quarantineMember(
  pluginData: GuildPluginData<AntiNukePluginType>,
  member: GuildMember,
  reason: string,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.quarantine_role_id) return;

  const rolesToRemove = member.roles.cache
    .filter((r) => r.id !== pluginData.guild.id && r.id !== config.quarantine_role_id)
    .map((r) => r.id);

  await member.roles.set([config.quarantine_role_id], reason).catch(async () => {
    await member.roles.add(config.quarantine_role_id!, reason).catch(() => null);
    for (const roleId of rolesToRemove) {
      await member.roles.remove(roleId, reason).catch(() => null);
    }
  });

  await logAntiNuke(pluginData, "AntiNuke quarantine", `${member} (\`${member.id}\`)\n${reason}`);
}

async function logAntiNuke(
  pluginData: GuildPluginData<AntiNukePluginType>,
  title: string,
  description: string,
  color = 0xed4245,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.log_channel_id) return;
  const log = pluginData.guild.channels.cache.get(config.log_channel_id);
  if (!log?.isTextBased()) return;
  await log
    .send({
      embeds: [{ title, color, description }],
    })
    .catch(() => null);
}

/**
 * Panic: deny @everyone send in channels + strip dangerous perms from editable roles.
 * Previous role bitfields are stored for restore. Does not touch Automod / message filters.
 */
export async function triggerPanicMode(
  pluginData: GuildPluginData<AntiNukePluginType>,
  reason: string,
  triggeredBy: string,
): Promise<void> {
  if (pluginData.state.panic) return;
  pluginData.state.panic = true;
  pluginData.state.panicRolePerms.clear();
  pluginData.state.panicLockedChannels.clear();

  const me = pluginData.guild.members.me;
  const highest = me?.roles.highest.position ?? 0;

  // Lock sends on text-like channels
  const lockJobs: Promise<unknown>[] = [];
  for (const channel of pluginData.guild.channels.cache.values()) {
    if (channel.type === ChannelType.GuildCategory) continue;
    if (!("permissionOverwrites" in channel)) continue;
    lockJobs.push(
      channel.permissionOverwrites
        .edit(pluginData.guild.id, {
          SendMessages: false,
          AddReactions: false,
          CreatePublicThreads: false,
          CreatePrivateThreads: false,
          SendMessagesInThreads: false,
        })
        .then(() => {
          pluginData.state.panicLockedChannels.add(channel.id);
        })
        .catch(() => null),
    );
  }
  await Promise.allSettled(lockJobs);

  // Strip dangerous permissions from roles the bot can edit
  for (const role of pluginData.guild.roles.cache.values()) {
    if (role.managed || role.id === pluginData.guild.id) continue;
    if (role.position >= highest) continue;
    const removed = role.permissions.remove(...DANGEROUS_PERMS);
    if (removed.bitfield === role.permissions.bitfield) continue;
    pluginData.state.panicRolePerms.set(role.id, role.permissions.bitfield.toString());
    await role.setPermissions(removed, `AntiNuke panic: ${reason}`).catch(() => {
      pluginData.state.panicRolePerms.delete(role.id);
    });
  }

  const config = pluginData.config.get();
  const pings = config.panic_ping_role_ids.map((id) => `<@&${id}>`).join(" ");
  if (config.log_channel_id) {
    const log = pluginData.guild.channels.cache.get(config.log_channel_id);
    if (log?.isTextBased()) {
      await log
        .send({
          content: pings || undefined,
          embeds: [
            {
              title: "🚨 Panic mode activated",
              color: 0xed4245,
              description: [
                "Channels locked (send denied for @everyone).",
                "Dangerous permissions stripped from editable roles.",
                "",
                `**Reason:** ${reason}`,
                `**Triggered by:** ${triggeredBy === "AUTO" ? "AntiNuke (auto)" : `<@${triggeredBy}>`}`,
                "",
                "Use `/antinuke panic` or `!an-panic off` to end panic and restore role permissions.",
              ].join("\n"),
            },
          ],
        })
        .catch(() => null);
    }
  }
}

export async function endPanicMode(
  pluginData: GuildPluginData<AntiNukePluginType>,
  endedBy: string,
): Promise<void> {
  if (!pluginData.state.panic && !pluginData.config.get().panic_mode) {
    pluginData.state.panic = false;
    return;
  }

  // Unlock channels we locked
  const unlockJobs: Promise<unknown>[] = [];
  for (const channelId of pluginData.state.panicLockedChannels) {
    const channel = pluginData.guild.channels.cache.get(channelId);
    if (!channel || !("permissionOverwrites" in channel)) continue;
    unlockJobs.push(
      channel.permissionOverwrites
        .edit(pluginData.guild.id, {
          SendMessages: null,
          AddReactions: null,
          CreatePublicThreads: null,
          CreatePrivateThreads: null,
          SendMessagesInThreads: null,
        })
        .catch(() => null),
    );
  }
  await Promise.allSettled(unlockJobs);
  pluginData.state.panicLockedChannels.clear();

  // Restore role permissions
  for (const [roleId, bitfield] of pluginData.state.panicRolePerms) {
    const role = pluginData.guild.roles.cache.get(roleId);
    if (!role) continue;
    await role
      .setPermissions(new PermissionsBitField(BigInt(bitfield)), `AntiNuke panic ended by ${endedBy}`)
      .catch(() => null);
  }
  pluginData.state.panicRolePerms.clear();
  pluginData.state.panic = false;

  await logAntiNuke(
    pluginData,
    "Panic mode ended",
    `Channels unlocked and role permissions restored where possible.\nEnded by: <@${endedBy}>`,
    0x57f287,
  );
}

export async function handleViolation(
  pluginData: GuildPluginData<AntiNukePluginType>,
  member: GuildMember,
  reason: string,
): Promise<void> {
  await quarantineMember(pluginData, member, reason);

  const config = pluginData.config.get();
  if (config.auto_panic_on_violation || pluginData.state.panic || config.panic_mode) {
    if (!pluginData.state.panic) {
      await triggerPanicMode(pluginData, reason, "AUTO");
    } else {
      await logAntiNuke(pluginData, "AntiNuke violation (panic active)", `${member}: ${reason}`);
    }
  }
}

export const AUDIT_ACTION_MAP: Partial<
  Record<AuditLogEvent, { key: string; limitKey: "channel_limit" | "role_limit" | "ban_limit" | "kick_limit" }>
> = {
  [AuditLogEvent.ChannelCreate]: { key: "channel", limitKey: "channel_limit" },
  [AuditLogEvent.ChannelDelete]: { key: "channel", limitKey: "channel_limit" },
  [AuditLogEvent.RoleCreate]: { key: "role", limitKey: "role_limit" },
  [AuditLogEvent.RoleDelete]: { key: "role", limitKey: "role_limit" },
  [AuditLogEvent.MemberBanAdd]: { key: "ban", limitKey: "ban_limit" },
  [AuditLogEvent.MemberKick]: { key: "kick", limitKey: "kick_limit" },
};
