import { slashOptions } from "vety";
import { tagsSlashCmd } from "../types.js";
import { actualTagDeleteCmd } from "./actualTagDeleteCmd.js";

export const TagDeleteSlashCmd = tagsSlashCmd({
  name: "delete",
  configPermission: "can_create",
  description: "Delete a tag",
  allowDms: false,

  signature: [slashOptions.string({ name: "name", description: "Tag name", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualTagDeleteCmd(pluginData, interaction, options.name);
  },
});
