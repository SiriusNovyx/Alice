import { AlicePluginDocs } from "../../types.js";
import { zRemindersConfig } from "./types.js";

export const remindersPluginDocs: AlicePluginDocs = {
  prettyName: "Reminders",
  description: "Set personal reminders. Slash commands live under `/remind`.",
  configSchema: zRemindersConfig,
  type: "stable",
};
