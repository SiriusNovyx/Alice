import { mutesSlashCmd } from "../types.js";
import { actualClearBannedMutesCmd } from "./actualClearBannedMutesCmd.js";

export const ClearBannedMutesSlashCmd = mutesSlashCmd({
  name: "clear_banned",
  configPermission: "can_cleanup",
  description: "Clear dangling mutes for banned members",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualClearBannedMutesCmd(pluginData, interaction);
  },
});
