import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { BotProfileConfig } from "../../../data/entities/BotProfileConfig.js";
import { buildCustomId } from "../../../utils/buildCustomId.js";
import { infoPanel, PanelMessageOptions } from "../../../utils/xeonStylePanels.js";

const NS = "bot_profile";

function trunc(value: string | null | undefined, max = 60): string {
  if (!value) return "*(not set)*";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export function buildCustomBotPanel(
  cfg: BotProfileConfig | null,
  authorId: string,
  premiumTier: number,
): PanelMessageOptions {
  const nick = trunc(cfg?.nick, 32);
  const avatar = trunc(cfg?.avatar);
  const banner = trunc(cfg?.banner);
  const bio = trunc(cfg?.bio, 80);
  const bannerNote =
    premiumTier >= 2
      ? "Banner: available (Boost Level 2+)."
      : "Banner: requires Discord Boost Level 2 on this server.";

  const body =
    `Customize the bot’s appearance for **this server**. Available to all servers.\n\n` +
    `**Nickname:** \`${nick}\`\n` +
    `**Avatar:** \`${avatar}\`\n` +
    `**Banner:** \`${banner}\`\n` +
    `**Bio:** \`${bio}\`\n\n` +
    `${bannerNote}`;

  const row1 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId(NS, { action: "nick", a: authorId }))
      .setLabel("Nickname")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(buildCustomId(NS, { action: "avatar", a: authorId }))
      .setLabel("Avatar")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(buildCustomId(NS, { action: "banner", a: authorId }))
      .setLabel("Banner")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(buildCustomId(NS, { action: "bio", a: authorId }))
      .setLabel("Bio")
      .setStyle(ButtonStyle.Primary),
  );

  const row2 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId(NS, { action: "reset", a: authorId }))
      .setLabel("Reset All")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(buildCustomId(NS, { action: "close", a: authorId }))
      .setLabel("Close")
      .setStyle(ButtonStyle.Secondary),
  );

  return infoPanel({
    title: "CustomBot Settings",
    body,
    footer: "Tip: Use direct image links (PNG / JPG / GIF / WEBP). Available to all servers.",
    components: [row1, row2],
  });
}

export function buildProfileModal(
  action: "nick" | "avatar" | "banner" | "bio",
  authorId: string,
): ModalBuilder {
  const titles: Record<typeof action, string> = {
    nick: "Set nickname",
    avatar: "Set avatar URL",
    banner: "Set banner URL",
    bio: "Set bio",
  };
  const labels: Record<typeof action, string> = {
    nick: "Nickname (max 32)",
    avatar: "Image URL",
    banner: "Image URL",
    bio: "Bio (max 190)",
  };
  const placeholders: Record<typeof action, string> = {
    nick: "Server nickname for the bot",
    avatar: "https://example.com/avatar.png",
    banner: "https://example.com/banner.png",
    bio: "Short about-me text",
  };
  const maxLens: Record<typeof action, number> = {
    nick: 32,
    avatar: 500,
    banner: 500,
    bio: 190,
  };

  const modal = new ModalBuilder()
    .setCustomId(buildCustomId(NS, { action: `modal_${action}`, a: authorId }))
    .setTitle(titles[action]);

  const input = new TextInputBuilder()
    .setCustomId("value")
    .setLabel(labels[action])
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(maxLens[action])
    .setPlaceholder(placeholders[action]);

  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
  return modal;
}

export { NS as BOT_PROFILE_NS };
