import { slashOptions } from "vety";
import { mutesSlashCmd } from "../types.js";
import { actualClearMutesCmd } from "./actualClearMutesCmd.js";

export const ClearMutesSlashCmd = mutesSlashCmd({
  name: "clear",
  configPermission: "can_cleanup",
  description: "Clear mute records for specific user IDs",
  allowDms: false,

  signature: [
    slashOptions.string({
      name: "user_ids",
      description: "Space-separated user IDs to clear mutes for",
      required: true,
    }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const userIds = options.user_ids.split(/\s+/).filter(Boolean);
    await actualClearMutesCmd(pluginData, interaction, userIds);
  },
});
