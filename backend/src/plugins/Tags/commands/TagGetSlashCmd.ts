import { slashOptions } from "vety";
import { tagsSlashCmd } from "../types.js";
import { actualTagGetCmd } from "./actualTagGetCmd.js";

export const TagGetSlashCmd = tagsSlashCmd({
  name: "get",
  configPermission: "can_create",
  description: "Get a tag's source",
  allowDms: false,

  signature: [slashOptions.string({ name: "name", description: "Tag name", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualTagGetCmd(pluginData, interaction, options.name);
  },
});
