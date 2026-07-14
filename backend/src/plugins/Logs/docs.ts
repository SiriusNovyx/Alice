import { AlicePluginDocs } from "../../types.js";
import { zLogsConfig } from "./types.js";

export const logsPluginDocs: AlicePluginDocs = {
  prettyName: "Logs",
  configSchema: zLogsConfig,
  type: "stable",
};
