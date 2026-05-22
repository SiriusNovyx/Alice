import { slashOptions } from "vety";
import { helpers } from "vety";
import { renderUsername } from "../../../utils.js";
import { utilitySlashCmd } from "../types.js";

const { getMemberLevel } = helpers;

export const LevelSlashCmd = utilitySlashCmd({
  name: "level",
  configPermission: "can_level",
  description: "Show the permission level of a user",
  allowDms: false,

  signature: [
    slashOptions.user({ name: "member", description: "The member to check (defaults to yourself)", required: false }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const member = options.member
      ? await pluginData.guild.members.fetch(options.member.id).catch(() => null)
      : await pluginData.guild.members.fetch(interaction.user.id).catch(() => null);

    if (!member) {
      pluginData.state.common.sendErrorMessage(interaction, "Member not found");
      return;
    }

    const level = getMemberLevel(pluginData, member);
    interaction.editReply(`The permission level of ${renderUsername(member)} is **${level}**`);
  },
});
