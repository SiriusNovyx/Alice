import { GuildMember } from "discord.js";
import { parseCustomId } from "../../../utils/parseCustomId.js";
import { openTicket } from "../functions/openTicket.js";
import { ticketsEvt } from "../types.js";

export const TicketInteractionEvt = ticketsEvt({
  event: "interactionCreate",
  async listener({ pluginData, args: { interaction } }) {
    if (!interaction.isStringSelectMenu()) return;

    const { namespace, data } = parseCustomId(interaction.customId);
    if (namespace !== "tickets" || data?.action !== "open") return;

    const member = interaction.member as GuildMember | null;
    if (!member) {
      await interaction.reply({ ephemeral: true, content: "Could not resolve member." });
      return;
    }

    const config = await pluginData.config.getForMember(member);
    if (!config.enabled) {
      await interaction.reply({ ephemeral: true, content: "Tickets are currently disabled." });
      return;
    }
    if (!config.can_use) {
      await interaction.reply({ ephemeral: true, content: "You do not have permission to open tickets." });
      return;
    }

    const panel = await pluginData.state.panels.findByMessageId(interaction.message.id);
    if (!panel) {
      await interaction.reply({ ephemeral: true, content: "This ticket panel is no longer valid." });
      return;
    }

    const categoryKey = interaction.values[0];
    const category = config.categories[categoryKey];
    if (!category) {
      await interaction.reply({ ephemeral: true, content: "Unknown ticket category." });
      return;
    }

    if (pluginData.state.opening.has(member.id)) {
      await interaction.reply({ ephemeral: true, content: "Already opening a ticket…" });
      return;
    }

    pluginData.state.opening.add(member.id);
    await interaction.deferReply({ ephemeral: true });

    try {
      const result = await openTicket(pluginData, member, categoryKey, category);
      if ("error" in result) {
        await interaction.editReply({ content: result.error });
        return;
      }
      await interaction.editReply({ content: `Ticket created: ${result.channel}` });
    } catch (err) {
      console.error("[Tickets] open failed:", err);
      await interaction.editReply({ content: "Failed to open ticket. Check bot permissions." });
    } finally {
      pluginData.state.opening.delete(member.id);
    }
  },
});
