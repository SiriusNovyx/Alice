import { AlicePluginDocs } from "../../types.js";
import { zUtilityConfig } from "./types.js";

export const utilityPluginDocs: AlicePluginDocs = {
  type: "stable",
  prettyName: "Utility",
  description: "Assorted utility commands. Slash commands live under `/utility`.",
  configSchema: zUtilityConfig,
};
