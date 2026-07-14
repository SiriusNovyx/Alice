import { AlicePluginDocs } from "../../types.js";
import { zPingableRolesConfig } from "./types.js";

export const pingableRolesPluginDocs: AlicePluginDocs = {
  prettyName: "Pingable roles",
  description: "Temporarily make roles mentionable. Slash commands live under `/pingable_role`.",
  configSchema: zPingableRolesConfig,
  type: "stable",
};
