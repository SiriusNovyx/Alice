import { AlicePluginDocs } from "../../types.js";
import { zWelcomeMessageConfig } from "./types.js";

export const welcomeMessagePluginDocs: AlicePluginDocs = {
  type: "stable",
  prettyName: "Welcome message",
  configSchema: zWelcomeMessageConfig,
};
