import { slashOptions } from "vety";
import { nameHistorySlashCmd } from "../types.js";
import { actualNamesCmd } from "./actualNamesCmd.js";

export const NamesSlashCmd = nameHistorySlashCmd({
  name: "names",
  configPermission: "can_view",
  description: "View nickname and username history for a user",
  allowDms: false,

  signature: [slashOptions.user({ name: "user", description: "User to look up", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualNamesCmd(pluginData, interaction, options.user.id);
  },
});
