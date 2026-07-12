import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import moment from "moment-timezone";
import { GuildPluginData } from "vety";
import { Giveaway } from "../../../data/entities/Giveaway.js";
import { buildCustomId } from "../../../utils/buildCustomId.js";
import { GiveawaysPluginType } from "../types.js";

export function drawWinners(entrants: string[], count: number, exclude: string[] = []): string[] {
  const pool = entrants.filter((id) => !exclude.includes(id));
  const winners: string[] = [];
  const working = [...pool];
  while (winners.length < count && working.length > 0) {
    const idx = Math.floor(Math.random() * working.length);
    winners.push(working.splice(idx, 1)[0]!);
  }
  return winners;
}

export function buildGiveawayEmbed(prize: string, endsAt: string, winnerCount: number, entrantCount: number, ended = false) {
  const endsUnix = Math.floor(moment.utc(endsAt, "YYYY-MM-DD HH:mm:ss").valueOf() / 1000);
  return new EmbedBuilder()
    .setTitle(ended ? "Giveaway ended" : "Giveaway")
    .setDescription(
      [
        `**Prize:** ${prize}`,
        `**Winners:** ${winnerCount}`,
        ended ? `**Ended:** <t:${endsUnix}:R>` : `**Ends:** <t:${endsUnix}:R> (<t:${endsUnix}:f>)`,
        `**Entries:** ${entrantCount}`,
      ].join("\n"),
    )
    .setColor(ended ? 0xed4245 : 0x57f287);
}

export function buildEnterRow(disabled = false) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId("giveaways", { action: "enter" }))
      .setLabel(disabled ? "Ended" : "Enter")
      .setStyle(disabled ? ButtonStyle.Secondary : ButtonStyle.Success)
      .setDisabled(disabled),
  );
}

export async function endGiveaway(
  pluginData: GuildPluginData<GiveawaysPluginType>,
  row: Giveaway,
): Promise<string[]> {
  const inflight = pluginData.state.ending.get(row.message_id);
  if (inflight) {
    return inflight;
  }

  const promise = (async (): Promise<string[]> => {
    const fresh = await pluginData.state.giveaways.findByMessageId(row.message_id);
    if (!fresh || fresh.status !== "active") {
      return fresh ? pluginData.state.giveaways.getWinners(fresh) : [];
    }

    const entrants = pluginData.state.giveaways.getEntrants(fresh);
    const winners = drawWinners(entrants, fresh.winner_count);
    await pluginData.state.giveaways.markEnded(fresh.message_id, winners);

    const channel = pluginData.guild.channels.cache.get(fresh.channel_id) as TextChannel | undefined;
    if (channel?.isTextBased()) {
      const msg = await channel.messages.fetch(fresh.message_id).catch(() => null);
      if (msg) {
        await msg.edit({
          embeds: [buildGiveawayEmbed(fresh.prize, fresh.ends_at, fresh.winner_count, entrants.length, true)],
          components: [buildEnterRow(true)],
        });
      }
      const winnerMentions = winners.length ? winners.map((id) => `<@${id}>`).join(", ") : "No valid entrants";
      await channel.send({
        content: `Giveaway ended for **${fresh.prize}**! Winners: ${winnerMentions}`,
        reply: msg ? { messageReference: msg.id, failIfNotExists: false } : undefined,
      });
    }

    return winners;
  })();

  pluginData.state.ending.set(row.message_id, promise);
  try {
    return await promise;
  } finally {
    pluginData.state.ending.delete(row.message_id);
  }
}
