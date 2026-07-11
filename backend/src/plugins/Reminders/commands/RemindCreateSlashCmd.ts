import { slashOptions } from "vety";
import { remindersSlashCmd } from "../types.js";
import { actualRemindCmd } from "./actualRemindCmd.js";

export const RemindCreateSlashCmd = remindersSlashCmd({
  name: "create",
  configPermission: "can_use",
  description: "Create a reminder",
  allowDms: false,

  signature: [
    slashOptions.string({
      name: "time",
      description: "When to remind (e.g. 3h, 2026-07-12, 2026-07-12T15:30)",
      required: true,
    }),
    slashOptions.string({ name: "reminder", description: "Reminder text", required: false }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualRemindCmd(
      pluginData,
      interaction,
      interaction.user.id,
      interaction.channelId,
      options.time,
      options.reminder,
      "Reminder",
    );
  },
});
