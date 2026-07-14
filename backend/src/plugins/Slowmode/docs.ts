import { AlicePluginDocs } from "../../types.js";
import { zSlowmodeConfig } from "./types.js";

export const slowmodePluginDocs: AlicePluginDocs = {
  type: "stable",
  prettyName: "Slowmode",
  description: "Manage channel slowmode. Slash commands live under `/slowmode`.",
  configSchema: zSlowmodeConfig,
};
