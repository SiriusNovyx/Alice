import { ZeppelinPluginDocs } from "../../types.js";
import { zNameHistoryConfig } from "./types.js";

export const nameHistoryPluginDocs: ZeppelinPluginDocs = {
  prettyName: "Name history",
  type: "internal",
  description: "Track username and nickname history. Slash commands live under `/names`.",
  configSchema: zNameHistoryConfig,
};
