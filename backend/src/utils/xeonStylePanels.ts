/**
 * XEON-inspired panels using embed + ActionRow (no Components V2 builders).
 *
 * Hierarchy mirrors XEON ui.py intent: title → status/body → actions → footer tip.
 * Call sites should use these helpers (or `renderPanel`) so a future CV2 renderer
 * can swap in without rewriting consumers.
 */
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
  MessageCreateOptions,
} from "discord.js";
import { GenericCommandSource } from "../pluginUtils.js";
import { waitForButtonConfirm, WaitForOptions } from "./waitForInteraction.js";

export const PANEL_COLORS = {
  info: 0x5865f2,
  success: 0x57f287,
  error: 0xed4245,
} as const;

export type PanelKind = keyof typeof PANEL_COLORS;

/** Stable content shape — safe for a later Components V2 backend to consume. */
export interface PanelDescriptor {
  kind: PanelKind;
  title: string;
  /** Main status / body block */
  body: string;
  footer?: string;
  thumbnailUrl?: string;
}

export interface PanelOptions {
  title: string;
  body: string;
  footer?: string;
  thumbnailUrl?: string;
  /** Extra rows (e.g. `linkRow`) appended to the message */
  components?: ActionRowBuilder<MessageActionRowComponentBuilder>[];
}

/**
 * Panel payloads use only fields shared by channel sends and interaction
 * replies/edits, so they assign cleanly without `flags` / MessageCreate-only conflicts.
 */
export type PanelMessageOptions = Pick<MessageCreateOptions, "content" | "embeds" | "components">;

const DEFAULT_FOOTERS: Record<PanelKind, string> = {
  info: "Tip: Use the buttons below when available.",
  success: "Done.",
  error: "If this keeps happening, check bot permissions and try again.",
};

function buildEmbed(descriptor: PanelDescriptor): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(PANEL_COLORS[descriptor.kind])
    .setTitle(descriptor.title)
    .setDescription(descriptor.body)
    .setFooter({ text: descriptor.footer ?? DEFAULT_FOOTERS[descriptor.kind] });

  if (descriptor.thumbnailUrl) {
    embed.setThumbnail(descriptor.thumbnailUrl);
  }

  return embed;
}

/**
 * Render a panel descriptor to MessageCreateOptions.
 * Currently embed-backed; replace the body of this function for CV2 later.
 */
export function renderPanel(
  descriptor: PanelDescriptor,
  components?: ActionRowBuilder<MessageActionRowComponentBuilder>[],
): PanelMessageOptions {
  const options: PanelMessageOptions = {
    embeds: [buildEmbed(descriptor)],
  };
  if (components?.length) {
    options.components = components;
  }
  return options;
}

export function infoPanel(opts: PanelOptions): PanelMessageOptions {
  return renderPanel(
    {
      kind: "info",
      title: opts.title,
      body: opts.body,
      footer: opts.footer,
      thumbnailUrl: opts.thumbnailUrl,
    },
    opts.components,
  );
}

export function successPanel(opts: PanelOptions): PanelMessageOptions {
  return renderPanel(
    {
      kind: "success",
      title: opts.title,
      body: opts.body,
      footer: opts.footer,
      thumbnailUrl: opts.thumbnailUrl,
    },
    opts.components,
  );
}

export function errorPanel(opts: PanelOptions): PanelMessageOptions {
  return renderPanel(
    {
      kind: "error",
      title: opts.title,
      body: opts.body,
      footer: opts.footer,
      thumbnailUrl: opts.thumbnailUrl,
    },
    opts.components,
  );
}

/** ActionRow of Invite + Support link buttons (XEON-style control strip). */
export function linkRow(
  inviteUrl: string,
  supportUrl: string,
): ActionRowBuilder<MessageActionRowComponentBuilder> {
  return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Invite").setURL(inviteUrl),
    new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Support").setURL(supportUrl),
  );
}

/**
 * Author-gated confirm: only `authorId` may press Confirm/Cancel
 * (same habit as `confirm()` / `waitForButtonConfirm` with `restrictToId`).
 */
export async function authorGatedConfirm(
  context: GenericCommandSource,
  authorId: string,
  content: PanelMessageOptions,
  options?: Omit<WaitForOptions, "restrictToId">,
): Promise<boolean> {
  return waitForButtonConfirm(context, content as MessageCreateOptions, {
    ...options,
    restrictToId: authorId,
  });
}
