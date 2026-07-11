import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { starboardCmd } from "../types.js";
import { actualMigratePinsCmd } from "./actualMigratePinsCmd.js";

export const MigratePinsCmd = starboardCmd({
  trigger: "starboard migrate_pins",
  permission: "can_migrate",

  description: "Posts all pins from a channel to the specified starboard. The pins are NOT unpinned automatically.",

  signature: {
    pinChannel: ct.textChannel(),
    starboardName: ct.string(),
  },

  async run({ message: msg, args, pluginData }) {
    await actualMigratePinsCmd(pluginData, msg, args.pinChannel, args.starboardName);
  },
});
