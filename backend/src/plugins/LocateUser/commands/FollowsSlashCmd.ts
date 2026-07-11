import { locateUserSlashCmd } from "../types.js";
import { actualListFollowCmd } from "./actualListFollowCmd.js";

export const FollowsSlashCmd = locateUserSlashCmd({
  name: "follows",
  configPermission: "can_alert",
  description: "List your active voice alerts",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualListFollowCmd(pluginData, interaction, interaction.user.id);
  },
});
