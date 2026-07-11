import { ZeppelinPluginDocs } from "../../types.js";
import { zUtilityConfig } from "./types.js";

export const utilityPluginDocs: ZeppelinPluginDocs = {
  type: "stable",
  prettyName: "Utility",
  description: "Assorted utility commands. Slash commands live under `/utility`.",
  configSchema: zUtilityConfig,
};
