import { GuildMember } from "discord.js";
import { parseCustomId } from "../../../utils/parseCustomId.js";
import { giveawaysEvt } from "../types.js";
import { buildEnterRow, buildGiveawayEmbed } from "../functions/giveawayHelpers.js";

export const GiveawayInteractionEvt = giveawaysEvt({
  event: "interactionCreate",
  async listener({ pluginData, args: { interaction } }) {
    if (!interaction.isButton()) return;

    const { namespace, data } = parseCustomId(interaction.customId);
    if (namespace !== "giveaways" || data?.action !== "enter") return;

    const member = interaction.member as GuildMember | null;
    if (!member) {
      await interaction.reply({ ephemeral: true, content: "Could not resolve member." });
      return;
    }

    const config = await pluginData.config.getForMember(member);
    if (!config.enabled || !config.can_enter) {
      await interaction.reply({ ephemeral: true, content: "Giveaway entry is disabled." });
      return;
    }

    const row = await pluginData.state.giveaways.findByMessageId(interaction.message.id);
    if (!row || row.status !== "active") {
      await interaction.reply({ ephemeral: true, content: "This giveaway has ended." });
      return;
    }

    const required = pluginData.state.giveaways.getRequiredRoles(row);
    if (required.length && !required.every((id) => member.roles.cache.has(id))) {
      await interaction.reply({
        ephemeral: true,
        content: `You need all of these roles to enter: ${required.map((id) => `<@&${id}>`).join(", ")}`,
      });
      return;
    }

    const entrants = pluginData.state.giveaways.getEntrants(row);
    if (entrants.includes(member.id)) {
      await pluginData.state.giveaways.removeEntrant(row.message_id, member.id);
      const updated = await pluginData.state.giveaways.findByMessageId(row.message_id);
      const count = updated ? pluginData.state.giveaways.getEntrants(updated).length : entrants.length - 1;
      await interaction.message
        .edit({
          embeds: [buildGiveawayEmbed(row.prize, row.ends_at, row.winner_count, count)],
          components: [buildEnterRow()],
        })
        .catch(() => null);
      await interaction.reply({ ephemeral: true, content: "You left the giveaway." });
      return;
    }

    await pluginData.state.giveaways.addEntrant(row.message_id, member.id);
    await interaction.message
      .edit({
        embeds: [buildGiveawayEmbed(row.prize, row.ends_at, row.winner_count, entrants.length + 1)],
        components: [buildEnterRow()],
      })
      .catch(() => null);
    await interaction.reply({ ephemeral: true, content: "You entered the giveaway!" });
  },
});
