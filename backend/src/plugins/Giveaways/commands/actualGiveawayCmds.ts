import moment from "moment-timezone";
import { GuildPluginData } from "vety";
import { GenericCommandSource } from "../../../pluginUtils.js";
import { convertDelayStringToMS } from "../../../utils.js";
import { GiveawaysPluginType } from "../types.js";
import {
  buildEnterRow,
  buildGiveawayEmbed,
  drawWinners,
  endGiveaway,
} from "../functions/giveawayHelpers.js";

export async function actualStartCmd(
  pluginData: GuildPluginData<GiveawaysPluginType>,
  context: GenericCommandSource,
  hostId: string,
  channelId: string,
  prize: string,
  durationStr: string,
  winnerCount: number,
  requiredRoleIds: string[],
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.enabled) {
    await pluginData.state.common.sendErrorMessage(context, "Giveaways are disabled.");
    return;
  }

  const ms = convertDelayStringToMS(durationStr);
  if (ms == null || ms < 10_000) {
    await pluginData.state.common.sendErrorMessage(context, "Provide a valid duration (e.g. `1h`, `30m`, `2d`).");
    return;
  }

  if (winnerCount < 1 || winnerCount > 20) {
    await pluginData.state.common.sendErrorMessage(context, "Winners must be between 1 and 20.");
    return;
  }

  const channel = pluginData.guild.channels.cache.get(channelId);
  if (!channel?.isTextBased() || channel.isDMBased()) {
    await pluginData.state.common.sendErrorMessage(context, "Provide a text channel.");
    return;
  }

  const endsAt = moment.utc().add(ms, "ms").format("YYYY-MM-DD HH:mm:ss");
  const msg = await channel.send({
    embeds: [buildGiveawayEmbed(prize, endsAt, winnerCount, 0)],
    components: [buildEnterRow()],
  });

  await pluginData.state.giveaways.create({
    channel_id: channel.id,
    message_id: msg.id,
    host_id: hostId,
    prize,
    winner_count: winnerCount,
    ends_at: endsAt,
    required_role_ids: requiredRoleIds,
    created_at: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
  });

  await pluginData.state.common.sendSuccessMessage(context, `Giveaway started in <#${channel.id}>.`);
}

export async function actualEndCmd(
  pluginData: GuildPluginData<GiveawaysPluginType>,
  context: GenericCommandSource,
  messageId: string,
): Promise<void> {
  const row = await pluginData.state.giveaways.findByMessageId(messageId);
  if (!row) {
    await pluginData.state.common.sendErrorMessage(context, "Giveaway not found.");
    return;
  }
  if (row.status !== "active") {
    await pluginData.state.common.sendErrorMessage(context, "Giveaway already ended.");
    return;
  }

  const winners = await endGiveaway(pluginData, row);
  await pluginData.state.common.sendSuccessMessage(
    context,
    winners.length ? `Ended. Winners: ${winners.map((id) => `<@${id}>`).join(", ")}` : "Ended with no winners.",
  );
}

export async function actualRerollCmd(
  pluginData: GuildPluginData<GiveawaysPluginType>,
  context: GenericCommandSource,
  messageId: string,
  count: number | null,
): Promise<void> {
  const row = await pluginData.state.giveaways.findByMessageId(messageId);
  if (!row) {
    await pluginData.state.common.sendErrorMessage(context, "Giveaway not found.");
    return;
  }
  if (row.status !== "ended") {
    await pluginData.state.common.sendErrorMessage(context, "Only ended giveaways can be rerolled.");
    return;
  }

  const entrants = pluginData.state.giveaways.getEntrants(row);
  const previous = pluginData.state.giveaways.getWinners(row);
  const drawCount = count ?? row.winner_count;
  const winners = drawWinners(entrants, drawCount, previous);
  if (winners.length === 0) {
    await pluginData.state.common.sendErrorMessage(context, "No remaining entrants to reroll.");
    return;
  }

  await pluginData.state.giveaways.setWinners(messageId, [...previous, ...winners]);
  const channel = pluginData.guild.channels.cache.get(row.channel_id);
  if (channel?.isTextBased()) {
    await channel.send(`Reroll for **${row.prize}**: ${winners.map((id) => `<@${id}>`).join(", ")}`);
  }
  await pluginData.state.common.sendSuccessMessage(
    context,
    `New winners: ${winners.map((id) => `<@${id}>`).join(", ")}`,
  );
}

export async function actualListCmd(
  pluginData: GuildPluginData<GiveawaysPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  const active = await pluginData.state.giveaways.findActive();
  if (active.length === 0) {
    await pluginData.state.common.sendSuccessMessage(context, "No active giveaways.");
    return;
  }
  const lines = active.map(
    (g) => `• **${g.prize}** in <#${g.channel_id}> — ends \`${g.ends_at}\` — msg \`${g.message_id}\``,
  );
  await pluginData.state.common.sendSuccessMessage(context, lines.join("\n"));
}
