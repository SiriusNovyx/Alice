import { slashOptions } from "vety";
import { selfGrantableRolesSlashCmd } from "../types.js";
import { actualRoleAddCmd } from "./actualRoleAddCmd.js";

export const RoleAddSlashCmd = selfGrantableRolesSlashCmd({
  name: "add",
  description: "Add self-grantable roles to yourself",
  allowDms: false,

  signature: [slashOptions.string({ name: "roles", description: "Role name(s) to add", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualRoleAddCmd(pluginData, interaction, interaction.user, interaction.user.id, options.roles.split(/\s+/));
  },
});
