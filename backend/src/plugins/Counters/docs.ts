import { AlicePluginDocs } from "../../types.js";
import { zCountersConfig } from "./types.js";

export const countersPluginDocs: AlicePluginDocs = {
  type: "stable",
  configSchema: zCountersConfig,

  prettyName: "Counters",
  description:
    "Keep track of per-user, per-channel, or global numbers and trigger specific actions based on this number. Slash commands live under `/counter`.",
  configurationGuide: "See <a href='/docs/setup-guides/counters'>Counters setup guide</a>",
};
