import { timeAndDateSlashCmd } from "../types.js";
import { actualResetTimezoneCmd } from "./actualResetTimezoneCmd.js";

export const ResetTimezoneSlashCmd = timeAndDateSlashCmd({
  name: "reset",
  configPermission: "can_set_timezone",
  description: "Reset your timezone to the server default",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualResetTimezoneCmd(pluginData, interaction, interaction.user.id);
  },
});
