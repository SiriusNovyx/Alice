import { ZeppelinPluginDocs } from "../../types.js";
import { zMutesConfig } from "./types.js";

export const mutesPluginDocs: ZeppelinPluginDocs = {
  prettyName: "Mutes",
  type: "stable",
  description: "Manage active mutes. Slash commands live under `/mutes`.",
  configSchema: zMutesConfig,
};
