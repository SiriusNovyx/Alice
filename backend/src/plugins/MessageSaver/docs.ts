import { AlicePluginDocs } from "../../types.js";
import { zMessageSaverConfig } from "./types.js";

export const messageSaverPluginDocs: AlicePluginDocs = {
  prettyName: "Message saver",
  type: "internal",
  description: "Save messages to the database. Slash commands live under `/message_saver`.",
  configSchema: zMessageSaverConfig,
};
