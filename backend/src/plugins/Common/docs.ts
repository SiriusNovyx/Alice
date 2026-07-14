import { AlicePluginDocs } from "../../types.js";
import { zCommonConfig } from "./types.js";

export const commonPluginDocs: AlicePluginDocs = {
  type: "stable",
  configSchema: zCommonConfig,

  prettyName: "Common",
};
