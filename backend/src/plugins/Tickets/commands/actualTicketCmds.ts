import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextChannel,
} from "discord.js";
import moment from "moment-timezone";
import { GuildPluginData } from "vety";
import { GenericCommandSource } from "../../../pluginUtils.js";
import { buildCustomId } from "../../../utils/buildCustomId.js";
import { TicketsPluginType } from "../types.js";

export async function actualPanelCmd(
  pluginData: GuildPluginData<TicketsPluginType>,
  context: GenericCommandSource,
  channel: TextChannel,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.enabled) {
    await pluginData.state.common.sendErrorMessage(context, "Enable the tickets plugin first (`enabled: true`).");
    return;
  }

  const entries = Object.entries(config.categories);
  if (entries.length === 0) {
    await pluginData.state.common.sendErrorMessage(
      context,
      "Configure at least one category under `tickets.config.categories` in YAML.",
    );
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(config.panel_title)
    .setDescription(config.panel_description)
    .setColor(0x5865f2)
    .setFooter({ text: pluginData.guild.name });

  const select = new StringSelectMenuBuilder()
    .setCustomId(buildCustomId("tickets", { action: "open" }))
    .setPlaceholder("Select a category to open a ticket…")
    .addOptions(
      entries.slice(0, 25).map(([key, cat]) => {
        const opt = new StringSelectMenuOptionBuilder()
          .setLabel(cat.name.slice(0, 100))
          .setDescription((cat.description || key).slice(0, 100))
          .setValue(key.slice(0, 100));
        if (cat.emoji) {
          try {
            opt.setEmoji(cat.emoji);
          } catch {
            // Invalid emoji — skip
          }
        }
        return opt;
      }),
    );

  const msg = await channel.send({
    embeds: [embed],
    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)],
  });

  await pluginData.state.panels.create(channel.id, msg.id, moment.utc().format("YYYY-MM-DD HH:mm:ss"));
  await pluginData.state.common.sendSuccessMessage(context, `Ticket panel sent to <#${channel.id}>.`);
}

export async function actualCloseCmd(
  pluginData: GuildPluginData<TicketsPluginType>,
  context: GenericCommandSource,
  channelId: string,
  closerId: string,
  reason: string | null,
  canManage: boolean,
): Promise<void> {
  const { closeTicket } = await import("../functions/closeTicket.js");
  const channel = pluginData.guild.channels.cache.get(channelId);
  if (!channel?.isTextBased() || channel.isDMBased()) {
    await pluginData.state.common.sendErrorMessage(context, "Run this in a ticket channel.");
    return;
  }

  const ticket = await pluginData.state.tickets.findByChannelId(channelId);
  if (!ticket || ticket.status !== "open") {
    await pluginData.state.common.sendErrorMessage(context, "This channel is not an open ticket.");
    return;
  }

  if (!canManage && ticket.opener_id !== closerId) {
    await pluginData.state.common.sendErrorMessage(context, "Only the opener or staff can close this ticket.");
    return;
  }

  const closer = await pluginData.client.users.fetch(closerId).catch(() => null);
  if (!closer) {
    await pluginData.state.common.sendErrorMessage(context, "Could not resolve closer.");
    return;
  }

  const result = await closeTicket(pluginData, channel as any, closer, reason);
  if ("error" in result) {
    await pluginData.state.common.sendErrorMessage(context, result.error);
    return;
  }

  await pluginData.state.common.sendSuccessMessage(
    context,
    result.archiveUrl ? `Ticket closed. Transcript: ${result.archiveUrl}` : "Ticket closed.",
  );
}

export async function actualClaimCmd(
  pluginData: GuildPluginData<TicketsPluginType>,
  context: GenericCommandSource,
  channelId: string,
  staffId: string,
): Promise<void> {
  const ticket = await pluginData.state.tickets.findByChannelId(channelId);
  if (!ticket || ticket.status !== "open") {
    await pluginData.state.common.sendErrorMessage(context, "This channel is not an open ticket.");
    return;
  }

  if (ticket.claimed_by && ticket.claimed_by !== staffId) {
    await pluginData.state.common.sendErrorMessage(
      context,
      `This ticket is already claimed by <@${ticket.claimed_by}>.`,
    );
    return;
  }

  if (ticket.claimed_by === staffId) {
    await pluginData.state.common.sendErrorMessage(context, "You already claimed this ticket.");
    return;
  }

  await pluginData.state.tickets.claim(channelId, staffId);
  const channel = pluginData.guild.channels.cache.get(channelId);
  if (channel?.isTextBased()) {
    await channel.send(`Ticket claimed by <@${staffId}>.`);
  }
  await pluginData.state.common.sendSuccessMessage(context, "Ticket claimed.");
}

export async function actualAddCmd(
  pluginData: GuildPluginData<TicketsPluginType>,
  context: GenericCommandSource,
  channelId: string,
  userId: string,
): Promise<void> {
  const ticket = await pluginData.state.tickets.findByChannelId(channelId);
  if (!ticket || ticket.status !== "open") {
    await pluginData.state.common.sendErrorMessage(context, "This channel is not an open ticket.");
    return;
  }

  const channel = pluginData.guild.channels.cache.get(channelId);
  if (!channel || !channel.isTextBased() || channel.isDMBased() || !("permissionOverwrites" in channel)) {
    await pluginData.state.common.sendErrorMessage(context, "Invalid ticket channel.");
    return;
  }

  await channel.permissionOverwrites.edit(userId, {
    ViewChannel: true,
    SendMessages: true,
    AttachFiles: true,
    ReadMessageHistory: true,
  });
  await pluginData.state.common.sendSuccessMessage(context, `Added <@${userId}> to the ticket.`);
}

export async function actualRemoveCmd(
  pluginData: GuildPluginData<TicketsPluginType>,
  context: GenericCommandSource,
  channelId: string,
  userId: string,
): Promise<void> {
  const ticket = await pluginData.state.tickets.findByChannelId(channelId);
  if (!ticket || ticket.status !== "open") {
    await pluginData.state.common.sendErrorMessage(context, "This channel is not an open ticket.");
    return;
  }

  if (ticket.opener_id === userId) {
    await pluginData.state.common.sendErrorMessage(context, "Cannot remove the ticket opener.");
    return;
  }

  const channel = pluginData.guild.channels.cache.get(channelId);
  if (!channel || !channel.isTextBased() || channel.isDMBased() || !("permissionOverwrites" in channel)) {
    await pluginData.state.common.sendErrorMessage(context, "Invalid ticket channel.");
    return;
  }

  await channel.permissionOverwrites.delete(userId);
  await pluginData.state.common.sendSuccessMessage(context, `Removed <@${userId}> from the ticket.`);
}
