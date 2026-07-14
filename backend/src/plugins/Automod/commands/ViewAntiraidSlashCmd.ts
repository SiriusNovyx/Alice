import { MessageFlags } from "discord.js";
import { automodSlashCmd } from "../types.js";
import { actualViewAntiraidCmd } from "./actualViewAntiraidCmd.js";

export const ViewAntiraidSlashCmd = automodSlashCmd({
  name: "view",
  // Permission is checked in run() so either can_view_antiraid or can_set_antiraid is accepted.
  // (Framework configPermission only supports a single key.)
  description: "View the current anti-raid level",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    const config = await pluginData.config.getForInteraction(interaction);
    if (!config.can_view_antiraid && !config.can_set_antiraid) {
      await interaction.reply({
        content: "You don't have permission to use this command",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    await actualViewAntiraidCmd(pluginData, interaction);
  },
});
