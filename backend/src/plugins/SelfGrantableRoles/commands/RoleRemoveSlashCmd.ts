import { slashOptions } from "vety";
import { selfGrantableRolesSlashCmd } from "../types.js";
import { actualRoleRemoveCmd } from "./actualRoleRemoveCmd.js";

export const RoleRemoveSlashCmd = selfGrantableRolesSlashCmd({
  name: "remove",
  description: "Remove self-grantable roles from yourself",
  allowDms: false,

  signature: [slashOptions.string({ name: "roles", description: "Role name(s) to remove", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualRoleRemoveCmd(
      pluginData,
      interaction,
      interaction.user,
      interaction.user.id,
      options.roles.split(/\s+/),
    );
  },
});
