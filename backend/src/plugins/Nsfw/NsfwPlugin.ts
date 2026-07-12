import { guildPlugin } from "vety";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import {
  NsfwCheckCmd,
  NsfwCheckSlashCmd,
  NsfwImageCmd,
  NsfwImageSlashCmd,
} from "./commands/NsfwCmds.js";
import { NsfwPluginType, nsfwSlashGroup, zNsfwConfig } from "./types.js";

export const NsfwPlugin = guildPlugin<NsfwPluginType>()({
  name: "nsfw",
  configSchema: zNsfwConfig,
  messageCommands: [NsfwCheckCmd, NsfwImageCmd],
  slashCommands: [
    nsfwSlashGroup({
      name: "nsfw",
      description: "NSFW-gated commands",
      defaultMemberPermissions: "0",
      subcommands: [NsfwCheckSlashCmd, NsfwImageSlashCmd],
    }),
  ],
  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },
});
