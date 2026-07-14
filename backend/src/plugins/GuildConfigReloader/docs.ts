import { AlicePluginDocs } from "../../types.js";
import { zGuildConfigReloaderPluginConfig } from "./types.js";

export const guildConfigReloaderPluginDocs: AlicePluginDocs = {
  prettyName: "Guild config reloader",
  type: "internal",
  configSchema: zGuildConfigReloaderPluginConfig,
};
