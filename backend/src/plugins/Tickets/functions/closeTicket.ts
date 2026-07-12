import { TextChannel, User } from "discord.js";
import moment from "moment-timezone";
import { GuildPluginData } from "vety";
import { getBaseUrl } from "../../../pluginUtils.js";
import { TicketsPluginType } from "../types.js";
import { fetchChannelMessages, messagesToSaved } from "./messagesToSaved.js";

export async function closeTicket(
  pluginData: GuildPluginData<TicketsPluginType>,
  channel: TextChannel,
  closer: User,
  reason: string | null,
): Promise<{ archiveUrl: string | null } | { error: string }> {
  const ticket = await pluginData.state.tickets.findByChannelId(channel.id);
  if (!ticket || ticket.status !== "open") {
    return { error: "This channel is not an open ticket." };
  }

  let archiveUrl: string | null = null;
  try {
    const messages = await fetchChannelMessages(channel, 500);
    const saved = messagesToSaved(messages);
    if (saved.length > 0) {
      const archiveId = await pluginData.state.archives.createFromSavedMessages(saved, pluginData.guild);
      archiveUrl = pluginData.state.archives.getUrl(getBaseUrl(pluginData), archiveId);
    }
  } catch (err) {
    console.error(`[Tickets] Failed to archive #${channel.id}:`, err);
  }

  await pluginData.state.tickets.close(channel.id, moment.utc().format("YYYY-MM-DD HH:mm:ss"), reason);

  const config = pluginData.config.get();
  if (config.log_channel_id) {
    const logChannel = pluginData.guild.channels.cache.get(config.log_channel_id);
    if (logChannel?.isTextBased()) {
      await logChannel
        .send({
          embeds: [
            {
              title: "Ticket closed",
              color: 0xed4245,
              fields: [
                { name: "Channel", value: `#${channel.name}`, inline: true },
                { name: "Opener", value: `<@${ticket.opener_id}>`, inline: true },
                { name: "Closed by", value: `${closer}`, inline: true },
                { name: "Category", value: ticket.category_key, inline: true },
                { name: "Reason", value: reason || "No reason provided", inline: false },
                ...(archiveUrl ? [{ name: "Transcript", value: archiveUrl, inline: false }] : []),
              ],
            },
          ],
        })
        .catch(() => null);
    }
  }

  await channel.send({
    content: `Ticket closed by ${closer}.${archiveUrl ? ` Transcript: ${archiveUrl}` : ""} Deleting in 5 seconds…`,
  });

  setTimeout(() => {
    channel.delete(`Ticket closed by ${closer.tag}`).catch(() => null);
  }, 5000);

  return { archiveUrl };
}
