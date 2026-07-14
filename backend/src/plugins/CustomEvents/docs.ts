import { AlicePluginDocs } from "../../types.js";
import { zCustomEventsConfig } from "./types.js";

export const customEventsPluginDocs: AlicePluginDocs = {
  prettyName: "Custom events",
  type: "internal",
  configSchema: zCustomEventsConfig,
};
