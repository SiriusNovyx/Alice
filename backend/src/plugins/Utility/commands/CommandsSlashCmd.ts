import { utilitySlashCmd } from "../types.js";
import { actualCommandsCatalogCmd } from "./actualCommandsCatalogCmd.js";

export const CommandsSlashCmd = utilitySlashCmd({
  name: "commands",
  configPermission: "can_help",
  description: "Open the Alice Help Center with categorized commands",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: false });
    await actualCommandsCatalogCmd(pluginData, interaction);
  },
});
