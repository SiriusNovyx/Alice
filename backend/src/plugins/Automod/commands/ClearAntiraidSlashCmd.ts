import { automodSlashCmd } from "../types.js";
import { actualClearAntiraidCmd } from "./actualClearAntiraidCmd.js";

export const ClearAntiraidSlashCmd = automodSlashCmd({
  name: "clear",
  configPermission: "can_set_antiraid",
  description: "Turn off anti-raid",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualClearAntiraidCmd(pluginData, interaction, interaction.user);
  },
});
