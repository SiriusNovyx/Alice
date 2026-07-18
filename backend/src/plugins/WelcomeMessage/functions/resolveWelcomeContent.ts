import { APIEmbed } from "discord.js";
import { MessageContent, StrictMessageContent } from "../../../utils.js";
import { WelcomeMessageConfig } from "../types.js";

function parseEmbedColor(raw: string | null | undefined): number | undefined {
  if (!raw) return undefined;
  const hex = raw.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return undefined;
  return Number.parseInt(hex, 16);
}

function hasStructuredTemplate(config: WelcomeMessageConfig): boolean {
  return (
    config.content != null ||
    config.embed_title != null ||
    config.embed_description != null ||
    config.embed_color != null ||
    config.embed_thumbnail != null ||
    config.embed_image != null
  );
}

/**
 * Prefer additive embed template fields when any are set; otherwise use `message`
 * (string or embed object) for backward compatibility.
 */
export function resolveWelcomeContent(config: WelcomeMessageConfig): MessageContent | null {
  if (hasStructuredTemplate(config)) {
    const embed: APIEmbed = {};
    if (config.embed_title != null) embed.title = config.embed_title;
    if (config.embed_description != null) embed.description = config.embed_description;
    const color = parseEmbedColor(config.embed_color);
    if (color != null) embed.color = color;
    if (config.embed_thumbnail != null) embed.thumbnail = { url: config.embed_thumbnail };
    if (config.embed_image != null) embed.image = { url: config.embed_image };

    const result: StrictMessageContent = {};
    if (config.content != null) result.content = config.content;
    if (Object.keys(embed).length > 0) result.embeds = [embed];
    if (!result.content && !result.embeds?.length) return null;
    return result;
  }

  return config.message;
}

/** Richer starter embed template applied by `!greet setup` when no message is configured. */
export const DEFAULT_EMBED_WELCOME = {
  content: "{member.mention}",
  embed_title: "Welcome!",
  embed_description:
    "Hey {member.mention}, welcome to **{guild.name}**!\nYou are member **#{memberCount}**. Enjoy your stay.",
  embed_color: "#5865F2",
  embed_thumbnail: "{member.avatarURL}",
} as const;
