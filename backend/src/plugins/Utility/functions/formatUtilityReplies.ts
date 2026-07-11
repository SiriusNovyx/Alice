import { APIEmbed, ImageFormat, User } from "discord.js";
import { renderUsername } from "../../../utils.js";

export function formatLevelReply(memberDisplay: string, level: number): string {
  return `The permission level of ${memberDisplay} is **${level}**`;
}

export function formatAvatarEmbed(user: { displayAvatarURL: User["displayAvatarURL"] } & object): APIEmbed {
  return {
    image: {
      url: user.displayAvatarURL({ extension: ImageFormat.PNG, size: 2048 }),
    },
    title: `Avatar of ${renderUsername(user as any)}:`,
  };
}

export function formatPingSlashReply(roundtripMs: number, shardLatencyMs: number): string {
  return `**Ping:**\nRoundtrip: **${roundtripMs}ms**\nShard latency: **${shardLatencyMs}ms**`;
}
