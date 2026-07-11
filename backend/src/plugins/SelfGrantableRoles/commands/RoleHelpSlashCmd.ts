import { selfGrantableRolesSlashCmd } from "../types.js";
import { actualRoleHelpCmd } from "./actualRoleHelpCmd.js";

export const RoleHelpSlashCmd = selfGrantableRolesSlashCmd({
  name: "help",
  description: "Show available self-grantable roles and how to use them",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualRoleHelpCmd(pluginData, interaction);
  },
});
