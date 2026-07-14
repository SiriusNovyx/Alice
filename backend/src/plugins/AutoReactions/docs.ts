import { AlicePluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zAutoReactionsConfig } from "./types.js";

export const autoReactionsPluginDocs: AlicePluginDocs = {
  type: "stable",
  configSchema: zAutoReactionsConfig,

  prettyName: "Auto-reactions",
  description: trimPluginDescription(`
    Allows setting up automatic reactions to all new messages on a channel.
    Slash commands live under \`/auto_reactions\`.
  `),
};
