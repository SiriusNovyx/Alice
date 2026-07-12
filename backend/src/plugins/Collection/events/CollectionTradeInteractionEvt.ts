import { parseCustomId } from "../../../utils/parseCustomId.js";
import { executeAcceptedTrade } from "../commands/actualCollectionCmds.js";
import { collectionEvt } from "../types.js";

export const CollectionTradeInteractionEvt = collectionEvt({
  event: "interactionCreate",
  async listener({ pluginData, args: { interaction } }) {
    if (!interaction.isButton()) return;

    const { namespace, data } = parseCustomId(interaction.customId);
    if (namespace !== "collection") return;
    if (data?.action !== "trade_accept" && data?.action !== "trade_decline") return;

    const offerId = String(data.offerId ?? "");
    const offer = pluginData.state.pendingTrades.get(offerId);
    if (!offer) {
      await interaction.reply({ ephemeral: true, content: "This trade offer is no longer available." });
      return;
    }

    if (interaction.user.id !== offer.toId) {
      await interaction.reply({
        ephemeral: true,
        content: "Only the invited trade partner can respond to this offer.",
      });
      return;
    }

    if (data.action === "trade_decline") {
      pluginData.state.pendingTrades.delete(offerId);
      await interaction.update({
        content: `<@${offer.toId}> declined the trade with <@${offer.fromId}>.`,
        components: [],
      });
      return;
    }

    const result = await executeAcceptedTrade(pluginData, offerId);
    if (!result.ok) {
      await interaction.update({ content: result.reason, components: [] });
      return;
    }

    await interaction.update({
      content: `Trade complete: <@${result.fromId}> **${result.itemA}** ↔ <@${result.toId}> **${result.itemB}**.`,
      components: [],
    });
  },
});
