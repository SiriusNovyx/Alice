import { remindersSlashCmd } from "../types.js";
import { actualRemindersListCmd } from "./actualRemindersListCmd.js";

export const RemindListSlashCmd = remindersSlashCmd({
  name: "list",
  configPermission: "can_use",
  description: "List your reminders",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualRemindersListCmd(pluginData, interaction, interaction.user.id);
  },
});
