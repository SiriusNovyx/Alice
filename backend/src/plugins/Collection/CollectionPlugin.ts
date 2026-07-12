import { guildPlugin } from "vety";
import { GuildCollectionInventory } from "../../data/GuildCollectionInventory.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import {
  GiveCmd,
  GiveSlashCmd,
  InvCmd,
  InvSlashCmd,
  PullCmd,
  PullSlashCmd,
  TradeCmd,
  TradeSlashCmd,
} from "./commands/CollectionCmds.js";
import { CollectionPluginType, collectionSlashGroup, zCollectionConfig } from "./types.js";

export const CollectionPlugin = guildPlugin<CollectionPluginType>()({
  name: "collection",
  configSchema: zCollectionConfig,
  messageCommands: [PullCmd, InvCmd, GiveCmd, TradeCmd],
  slashCommands: [
    collectionSlashGroup({
      name: "collection",
      description: "Collection / gacha",
      defaultMemberPermissions: "0",
      subcommands: [PullSlashCmd, InvSlashCmd, GiveSlashCmd, TradeSlashCmd],
    }),
  ],
  beforeLoad(pluginData) {
    pluginData.state.inventory = GuildCollectionInventory.getGuildInstance(pluginData.guild.id);
    pluginData.state.rolls = new Map();
  },
  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },
});
