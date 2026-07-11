import { automodSlashCmd } from "../types.js";
import { actualViewAntiraidCmd } from "./actualViewAntiraidCmd.js";

export const ViewAntiraidSlashCmd = automodSlashCmd({
  name: "view",
  configPermission: "can_view_antiraid",
  description: "View the current anti-raid level",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualViewAntiraidCmd(pluginData, interaction);
  },
});
