import { Message } from "discord.js";
import moment from "moment-timezone";
import { SavedMessage } from "../../../data/entities/SavedMessage.js";

/** Convert live Discord messages into SavedMessage-shaped objects for archive/transcript APIs. */
export function messagesToSaved(messages: Message[]): SavedMessage[] {
  return messages
    .slice()
    .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
    .map((msg) => {
      const saved = new SavedMessage();
      saved.id = msg.id;
      saved.guild_id = msg.guildId ?? "";
      saved.channel_id = msg.channelId;
      saved.user_id = msg.author.id;
      saved.is_bot = msg.author.bot;
      saved.posted_at = moment.utc(msg.createdTimestamp).format("YYYY-MM-DD HH:mm:ss");
      saved.deleted_at = null as any;
      saved.is_permanent = false;
      saved.data = {
        author: {
          username: msg.author.username,
          discriminator: msg.author.discriminator,
        },
        content: msg.content,
        timestamp: msg.createdTimestamp,
        attachments: msg.attachments.size
          ? Array.from(msg.attachments.values()).map((att) => ({
              id: att.id,
              contentType: att.contentType,
              name: att.name,
              proxyURL: att.proxyURL,
              size: att.size,
              spoiler: att.spoiler,
              url: att.url,
              width: att.width,
            }))
          : undefined,
      };
      return saved;
    });
}

export async function fetchChannelMessages(channel: {
  messages: { fetch: (opts: { limit: number; before?: string }) => Promise<Map<string, Message>> };
}, max = 500): Promise<Message[]> {
  const collected: Message[] = [];
  let before: string | undefined;

  while (collected.length < max) {
    const batch = await channel.messages.fetch({ limit: 100, before });
    if (batch.size === 0) break;
    const arr = Array.from(batch.values());
    collected.push(...arr);
    before = arr[arr.length - 1]?.id;
    if (batch.size < 100) break;
  }

  return collected;
}
