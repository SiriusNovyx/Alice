import { AlicePluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zGuildAccessMonitorConfig } from "./types.js";

export const guildAccessMonitorPluginDocs: AlicePluginDocs = {
  type: "stable",
  configSchema: zGuildAccessMonitorConfig,

  prettyName: "Bot control",
  description: trimPluginDescription(`
    Automatically leaves servers that are not on the list of allowed servers
  `),
};
