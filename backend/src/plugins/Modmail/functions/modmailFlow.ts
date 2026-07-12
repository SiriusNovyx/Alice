import {
  ChannelType,
  Message,
  PermissionFlagsBits,
  TextChannel,
  User,
} from "discord.js";
import moment from "moment-timezone";
import { GuildPluginData } from "vety";
import { getBaseUrl } from "../../../pluginUtils.js";
import {
  fetchChannelMessages,
  messagesToSaved,
} from "../../Tickets/functions/messagesToSaved.js";
import { ModmailPluginType } from "../types.js";

export async function openOrGetThread(
  pluginData: GuildPluginData<ModmailPluginType>,
  user: User,
): Promise<{ channel: TextChannel; created: boolean } | null> {
  const existing = await pluginData.state.threads.findOpenByUser(user.id);
  if (existing) {
    const ch = pluginData.guild.channels.cache.get(existing.channel_id);
    if (ch?.isTextBased() && !ch.isDMBased()) return { channel: ch as TextChannel, created: false };
    // Stale DB row (channel deleted) — close and recreate
    await pluginData.state.threads.close(existing.channel_id, moment.utc().format("YYYY-MM-DD HH:mm:ss"));
  }

  const config = pluginData.config.get();
  if (!config.category_id) return null;

  const staffRoleIds = config.staff_role_ids;
  const safeName = `mail-${user.username}`.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 100);

  const channel = await pluginData.guild.channels.create({
    name: safeName || `mail-${user.id}`,
    type: ChannelType.GuildText,
    parent: config.category_id,
    topic: `Modmail with ${user.tag} (${user.id})`,
    permissionOverwrites: [
      { id: pluginData.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      {
        id: pluginData.client.user!.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks,
        ],
      },
      ...staffRoleIds.map((id) => ({
        id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks,
        ],
      })),
    ],
  });

  await pluginData.state.threads.create(channel.id, user.id, moment.utc().format("YYYY-MM-DD HH:mm:ss"));
  await channel.send({
    content: staffRoleIds.map((id) => `<@&${id}>`).join(" ") || undefined,
    embeds: [
      {
        title: "New modmail thread",
        description: `From ${user} (\`${user.id}\`)`,
        color: 0x5865f2,
        thumbnail: { url: user.displayAvatarURL() },
      },
    ],
  });
  return { channel, created: true };
}

export async function relayUserMessage(
  pluginData: GuildPluginData<ModmailPluginType>,
  message: Message,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.enabled) return;
  if (await pluginData.state.blacklist.isBlacklisted(message.author.id)) return;

  const member = await pluginData.guild.members.fetch(message.author.id).catch(() => null);
  if (!member) return;

  const opened = await openOrGetThread(pluginData, message.author);
  if (!opened) {
    await message.author
      .send("Modmail is not fully configured on that server (missing category).")
      .catch(() => null);
    return;
  }

  const attachmentUrls = [...message.attachments.values()].map((a) => a.url);
  await opened.channel.send({
    embeds: [
      {
        author: { name: message.author.tag, icon_url: message.author.displayAvatarURL() },
        description: message.content || (attachmentUrls.length ? "*Attachment*" : "*No text*"),
        color: 0x57f287,
        footer: { text: `User • ${message.author.id}` },
        image: attachmentUrls[0] ? { url: attachmentUrls[0] } : undefined,
      },
    ],
    files: attachmentUrls.slice(1).slice(0, 9),
  });

  if (opened.created) {
    await message.author.send({ content: config.greeting }).catch(() => null);
  } else {
    await message.react("✅").catch(() => null);
  }
}

export async function replyToUser(
  pluginData: GuildPluginData<ModmailPluginType>,
  channelId: string,
  staff: User,
  content: string,
  anonymous: boolean,
  snippetName?: string,
): Promise<{ error?: string }> {
  const thread = await pluginData.state.threads.findByChannelId(channelId);
  if (!thread || thread.status !== "open") return { error: "Not an open modmail thread." };

  const user = await pluginData.client.users.fetch(thread.user_id).catch(() => null);
  if (!user) return { error: "Could not resolve user." };

  const dm = await user
    .send({
      embeds: [
        {
          author: anonymous
            ? { name: `${pluginData.guild.name} Staff` }
            : { name: staff.tag, icon_url: staff.displayAvatarURL() },
          description: content,
          color: 0x5865f2,
          footer: { text: pluginData.guild.name },
        },
      ],
    })
    .catch(() => null);

  if (!dm) return { error: "Could not DM the user (DMs closed?)." };

  const channel = pluginData.guild.channels.cache.get(channelId);
  if (channel?.isTextBased()) {
    const authorLabel = snippetName
      ? `${anonymous ? `${staff.tag} (anonymous)` : staff.tag} [snippet: ${snippetName}]`
      : anonymous
        ? `${staff.tag} (anonymous)`
        : staff.tag;
    await channel.send({
      embeds: [
        {
          author: {
            name: authorLabel,
            icon_url: staff.displayAvatarURL(),
          },
          description: content,
          color: 0xfee75c,
          footer: { text: `Staff reply • ${staff.id}` },
        },
      ],
    });
  }
  return {};
}

export async function closeModmail(
  pluginData: GuildPluginData<ModmailPluginType>,
  channel: TextChannel,
  closer: User,
): Promise<{ archiveUrl: string | null } | { error: string }> {
  const thread = await pluginData.state.threads.findByChannelId(channel.id);
  if (!thread || thread.status !== "open") return { error: "Not an open modmail thread." };

  let archiveUrl: string | null = null;
  try {
    const messages = await fetchChannelMessages(channel, 500);
    const saved = messagesToSaved(messages);
    if (saved.length) {
      const archiveId = await pluginData.state.archives.createFromSavedMessages(saved, pluginData.guild);
      archiveUrl = pluginData.state.archives.getUrl(getBaseUrl(pluginData), archiveId);
    }
  } catch (err) {
    console.error("[Modmail] archive failed:", err);
  }

  await pluginData.state.threads.close(channel.id, moment.utc().format("YYYY-MM-DD HH:mm:ss"));

  const user = await pluginData.client.users.fetch(thread.user_id).catch(() => null);
  await user
    ?.send({
      content: `Your modmail thread in **${pluginData.guild.name}** has been closed by staff.`,
    })
    .catch(() => null);

  const config = pluginData.config.get();
  if (config.log_channel_id) {
    const log = pluginData.guild.channels.cache.get(config.log_channel_id);
    if (log?.isTextBased()) {
      await log
        .send({
          embeds: [
            {
              title: "Modmail closed",
              color: 0xed4245,
              fields: [
                { name: "User", value: `<@${thread.user_id}>`, inline: true },
                { name: "Closed by", value: `${closer}`, inline: true },
                ...(archiveUrl ? [{ name: "Transcript", value: archiveUrl, inline: false }] : []),
              ],
            },
          ],
        })
        .catch(() => null);
    }
  }

  await channel
    .send({
      content: `Thread closed by ${closer}.${archiveUrl ? ` Transcript: ${archiveUrl}` : ""} Deleting in 5 seconds…`,
    })
    .catch(() => null);

  setTimeout(() => channel.delete(`Modmail closed by ${closer.tag}`).catch(() => null), 5000);
  return { archiveUrl };
}
