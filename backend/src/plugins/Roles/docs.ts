import { AlicePluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zRolesConfig } from "./types.js";

export const rolesPluginDocs: AlicePluginDocs = {
  type: "stable",
  prettyName: "Roles",
  description: trimPluginDescription(`
    Enables authorised users to add and remove whitelisted roles with a command.
    Slash commands live under \`/roles\` (add, remove, temprole, untemprole, massadd, massremove).
    Timed roles: \`!temprole <user> <duration> <role> [-reason]\` (role name may contain spaces).
    Permanent add: \`!addrole <user> <role> [-reason]\`.
    Roles assigned with a duration are automatically removed when the timer expires.
  `),
  configSchema: zRolesConfig,
};
