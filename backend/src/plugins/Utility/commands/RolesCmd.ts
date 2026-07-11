import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { utilityCmd } from "../types.js";
import { actualRolesCmd } from "./actualRolesCmd.js";

export const RolesCmd = utilityCmd({
  trigger: "roles",
  description: "List all roles or roles matching a search",
  usage: "!roles [search]",
  permission: "can_roles",

  signature: {
    search: ct.string({ required: false, catchAll: true }),
    counts: ct.switchOption(),
    sort: ct.string({ option: true }),
  },

  async run({ message: msg, args, pluginData }) {
    await actualRolesCmd(pluginData, msg, {
      search: args.search,
      counts: args.counts,
      sort: args.sort,
    });
  },
});
