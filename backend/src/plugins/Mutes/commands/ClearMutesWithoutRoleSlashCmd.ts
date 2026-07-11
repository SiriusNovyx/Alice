import { mutesSlashCmd } from "../types.js";
import { actualClearMutesWithoutRoleCmd } from "./actualClearMutesWithoutRoleCmd.js";

export const ClearMutesWithoutRoleSlashCmd = mutesSlashCmd({
  name: "clear_without_role",
  configPermission: "can_cleanup",
  description: "Clear mutes for members missing the mute role",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualClearMutesWithoutRoleCmd(pluginData, interaction);
  },
});
