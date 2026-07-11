import { slashOptions } from "vety";
import { utilitySlashCmd } from "../types.js";
import { actualRolesCmd } from "./actualRolesCmd.js";

export const RolesSlashCmd = utilitySlashCmd({
  name: "roles",
  configPermission: "can_roles",
  description: "List all roles or roles matching a search",
  allowDms: false,

  signature: [
    slashOptions.string({ name: "search", description: "Filter roles by name or ID", required: false }),
    slashOptions.boolean({ name: "counts", description: "Include member counts", required: false }),
    slashOptions.string({ name: "sort", description: "Sort by name, position, or memberCount", required: false }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualRolesCmd(pluginData, interaction, {
      search: options.search,
      counts: options.counts ?? false,
      sort: options.sort,
    });
  },
});
