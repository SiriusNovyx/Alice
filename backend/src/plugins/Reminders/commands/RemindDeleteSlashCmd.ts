import { slashOptions } from "vety";
import { remindersSlashCmd } from "../types.js";
import { actualRemindersDeleteCmd } from "./actualRemindersDeleteCmd.js";

export const RemindDeleteSlashCmd = remindersSlashCmd({
  name: "delete",
  configPermission: "can_use",
  description: "Delete a reminder by its list number",
  allowDms: false,

  signature: [slashOptions.number({ name: "num", description: "Reminder number from /remind list", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualRemindersDeleteCmd(pluginData, interaction, interaction.user.id, options.num);
  },
});
