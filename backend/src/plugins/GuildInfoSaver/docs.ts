import { AlicePluginDocs } from "../../types.js";
import { zGuildInfoSaverConfig } from "./types.js";

export const guildInfoSaverPluginDocs: AlicePluginDocs = {
  prettyName: "Guild info saver",
  type: "internal",
  configSchema: zGuildInfoSaverConfig,
};
