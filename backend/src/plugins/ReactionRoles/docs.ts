import { ZeppelinPluginDocs } from "../../types.js";
import { zReactionRolesConfig } from "./types.js";

export const reactionRolesPluginDocs: ZeppelinPluginDocs = {
  prettyName: "Reaction roles",
  description: "Consider using the [Role buttons](https://zeppelin.gg/docs/plugins/role_buttons) plugin instead. Slash commands live under `/reaction_roles`.",
  type: "legacy",
  configSchema: zReactionRolesConfig,
};
