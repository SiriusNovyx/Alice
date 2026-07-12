import { GuildMember } from "discord.js";
import { antiNukeEvt } from "../types.js";
import { AUDIT_ACTION_MAP, handleViolation, isWhitelisted, trackAndExceeds } from "../functions/antiNukeHelpers.js";

/**
 * Only reacts to mass channel/role/ban/kick audit events.
 * Skips while panic is already active (avoids feedback loops from our own role edits).
 * Does not inspect messages — Automod owns that surface.
 */
export const AuditLogEvt = antiNukeEvt({
  event: "guildAuditLogEntryCreate",
  async listener({ pluginData, args: { auditLogEntry } }) {
    const config = pluginData.config.get();
    if (!config.enabled) return;
    if (pluginData.state.panic) return;

    const executorId = auditLogEntry.executorId ?? auditLogEntry.executor?.id;
    if (!executorId) return;

    // Ignore the bot's own audit actions (e.g. quarantine role sets)
    if (executorId === pluginData.client.user?.id) return;

    const mapped = AUDIT_ACTION_MAP[auditLogEntry.action as keyof typeof AUDIT_ACTION_MAP];
    if (!mapped) return;

    const member = await pluginData.guild.members.fetch(executorId).catch(() => null);
    if (!member || isWhitelisted(pluginData, member as GuildMember)) return;

    const limit = config[mapped.limitKey];
    const exceeded = trackAndExceeds(pluginData, executorId, mapped.key, limit, config.window_seconds);
    if (!exceeded) return;

    await handleViolation(
      pluginData,
      member as GuildMember,
      `Rate limit exceeded: ${mapped.key} (${limit}/${config.window_seconds}s)`,
    );
  },
});
