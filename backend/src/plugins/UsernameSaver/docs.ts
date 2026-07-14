import { AlicePluginDocs } from "../../types.js";
import { zUsernameSaverConfig } from "./types.js";

export const usernameSaverPluginDocs: AlicePluginDocs = {
  type: "internal",
  prettyName: "Username saver",
  configSchema: zUsernameSaverConfig,
};
