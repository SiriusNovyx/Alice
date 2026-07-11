import { timeAndDateSlashCmd } from "../types.js";
import { actualViewTimezoneCmd } from "./actualViewTimezoneCmd.js";

export const ViewTimezoneSlashCmd = timeAndDateSlashCmd({
  name: "get",
  configPermission: "can_set_timezone",
  description: "View your current timezone setting",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualViewTimezoneCmd(pluginData, interaction, interaction.user.id);
  },
});
