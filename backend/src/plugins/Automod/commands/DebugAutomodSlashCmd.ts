import { slashOptions } from "vety";
import { automodSlashCmd } from "../types.js";
import { actualDebugAutomodCmd } from "./actualDebugAutomodCmd.js";

export const DebugAutomodSlashCmd = automodSlashCmd({
  name: "debug_automod",
  configPermission: "can_debug_automod",
  description: "Debug which automod rules would match a saved message",
  allowDms: false,

  signature: [slashOptions.string({ name: "message_id", description: "Saved message ID to debug", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualDebugAutomodCmd(pluginData, interaction, options.message_id);
  },
});
