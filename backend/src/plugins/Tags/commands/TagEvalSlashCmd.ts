import { GuildMember } from "discord.js";
import { slashOptions } from "vety";
import { tagsSlashCmd } from "../types.js";
import { actualTagEvalCmd } from "./actualTagEvalCmd.js";

export const TagEvalSlashCmd = tagsSlashCmd({
  name: "eval",
  configPermission: "can_create",
  description: "Evaluate tag template syntax",
  allowDms: false,

  signature: [slashOptions.string({ name: "body", description: "Tag body to evaluate", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const authorMember = interaction.member as GuildMember;
    await actualTagEvalCmd(pluginData, interaction, interaction.user, authorMember, options.body);
  },
});
