import { ChatInputCommandInteraction, GuildTextBasedChannel, Message, Snowflake } from "discord.js";
import moment from "moment-timezone";
import { GuildPluginData } from "vety";
import { isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { SECONDS, confirm, noop, renderUsername } from "../../../utils.js";
import { TimeAndDatePlugin } from "../../TimeAndDate/TimeAndDatePlugin.js";
import { rehostAttachment } from "../rehostAttachment.js";
import { ChannelArchiverPluginType } from "../types.js";

const MAX_ARCHIVED_MESSAGES = 5000;
const MAX_MESSAGES_PER_FETCH = 100;
const PROGRESS_UPDATE_INTERVAL = 5 * SECONDS;

export async function actualArchiveChannelCmd(
  pluginData: GuildPluginData<ChannelArchiverPluginType>,
  context: Message | ChatInputCommandInteraction,
  authorId: string,
  channel: GuildTextBasedChannel,
  attachmentChannel: GuildTextBasedChannel | null,
  messagesLimit: number | null,
) {
  if (!attachmentChannel) {
    const confirmed = await confirm(context, authorId, {
      content:
        "No attachment channel specified. Continue? Attachments will not be available in the log if their message is deleted.",
    });
    if (!confirmed) {
      await pluginData.state.common.sendErrorMessage(context, "Canceled");
      return;
    }
  }

  const maxMessagesToArchive = messagesLimit
    ? Math.min(messagesLimit, MAX_ARCHIVED_MESSAGES)
    : MAX_ARCHIVED_MESSAGES;
  if (maxMessagesToArchive <= 0) return;

  const archiveLines: string[] = [];
  let archivedMessages = 0;
  let previousId: string | undefined;

  const startTime = Date.now();
  const contextIsInteraction = isContextInteraction(context);
  const progressMsg = await sendContextResponse(context, "Creating archive...", true);

  const progressUpdateInterval = setInterval(() => {
    const secondsSinceStart = Math.round((Date.now() - startTime) / 1000);
    progressMsg
      .edit(`Creating archive...\n**Status:** ${archivedMessages} messages archived in ${secondsSinceStart} seconds`)
      .catch(() => clearInterval(progressUpdateInterval));
  }, PROGRESS_UPDATE_INTERVAL);

  while (archivedMessages < maxMessagesToArchive) {
    const messagesToFetch = Math.min(MAX_MESSAGES_PER_FETCH, maxMessagesToArchive - archivedMessages);
    const messages = await channel.messages.fetch({
      limit: messagesToFetch,
      before: previousId as Snowflake,
    });
    if (messages.size === 0) break;

    for (const message of messages.values()) {
      const ts = moment.utc(message.createdTimestamp).format("YYYY-MM-DD HH:mm:ss");
      let content = `[${ts}] [${message.author.id}] [${renderUsername(message.author)}]: ${
        message.content || "<no text content>"
      }`;

      if (message.attachments.size) {
        const attachment = message.attachments.first()!;
        if (attachmentChannel) {
          const rehostedAttachmentUrl = await rehostAttachment(attachment, attachmentChannel);
          content += `\n-- Attachment: ${rehostedAttachmentUrl}`;
        } else {
          content += `\n-- Attachment: ${attachment.url}`;
        }
      }

      if (message.reactions.cache.size > 0) {
        const reactionCounts: string[] = [];
        for (const [emoji, info] of message.reactions.cache) {
          reactionCounts.push(`${info.count}x ${emoji}`);
        }
        content += `\n-- Reactions: ${reactionCounts.join(", ")}`;
      }

      archiveLines.push(content);
      previousId = message.id;
      archivedMessages++;
    }
  }

  clearInterval(progressUpdateInterval);

  archiveLines.reverse();

  const timeAndDate = pluginData.getPlugin(TimeAndDatePlugin);
  const nowTs = timeAndDate.inGuildTz().format(timeAndDate.getDateFormat("pretty_datetime"));
  const channelName = channel.name;

  let result = `Archived ${archiveLines.length} messages from #${channelName} at ${nowTs}`;
  result += `\n\n${archiveLines.join("\n")}\n`;

  const archiveFile = {
    attachment: Buffer.from(result),
    name: `archive-${channelName}-${moment.utc().format("YYYY-MM-DD-HH-mm-ss")}.txt`,
  };

  if (contextIsInteraction) {
    await progressMsg.edit({
      content: "Archive created!",
      files: [archiveFile],
      components: [],
    });
  } else {
    progressMsg.delete().catch(noop);
    const msgChannel = (context as Message).channel;
    if (msgChannel.isSendable()) {
      await msgChannel.send({
        content: "Archive created!",
        files: [archiveFile],
      });
    }
  }
}
