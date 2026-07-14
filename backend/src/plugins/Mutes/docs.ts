import { AlicePluginDocs } from "../../types.js";
import { zMutesConfig } from "./types.js";

export const mutesPluginDocs: AlicePluginDocs = {
  prettyName: "Mutes",
  type: "stable",
  description: "Manage active mutes. Slash commands live under `/mutes`.",
  configSchema: zMutesConfig,
};
