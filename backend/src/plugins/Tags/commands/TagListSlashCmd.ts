import { slashOptions } from "vety";
import { tagsSlashCmd } from "../types.js";
import { actualTagListCmd } from "./actualTagListCmd.js";

export const TagListSlashCmd = tagsSlashCmd({
  name: "list",
  configPermission: "can_list",
  description: "List available tags",
  allowDms: false,

  signature: [slashOptions.string({ name: "search", description: "Optional search filter", required: false })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualTagListCmd(pluginData, interaction, options.search);
  },
});
