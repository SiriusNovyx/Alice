import { AlicePluginDocs } from "../../types.js";
import { zGuildMemberCacheConfig } from "./types.js";

export const guildMemberCachePluginDocs: AlicePluginDocs = {
  prettyName: "Guild member cache",
  type: "internal",
  configSchema: zGuildMemberCacheConfig,
};
