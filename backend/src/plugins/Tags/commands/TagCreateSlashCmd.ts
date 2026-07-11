import { slashOptions } from "vety";
import { tagsSlashCmd } from "../types.js";
import { actualTagCreateCmd } from "./actualTagCreateCmd.js";

export const TagCreateSlashCmd = tagsSlashCmd({
  name: "create",
  configPermission: "can_create",
  description: "Create or update a tag",
  allowDms: false,

  signature: [
    slashOptions.string({ name: "name", description: "Tag name", required: true }),
    slashOptions.string({ name: "body", description: "Tag content", required: true }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualTagCreateCmd(pluginData, interaction, interaction.user.id, options.name, options.body);
  },
});
