import { slashOptions } from "vety";
import { locateUserSlashCmd } from "../types.js";
import { actualWhereCmd } from "./actualWhereCmd.js";

export const WhereSlashCmd = locateUserSlashCmd({
  name: "where",
  configPermission: "can_where",
  description: "Posts an invite to the voice channel a member is in",
  allowDms: false,

  signature: [slashOptions.user({ name: "member", description: "The member to locate", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const member = await pluginData.guild.members.fetch(options.member.id).catch(() => null);
    if (!member) {
      await pluginData.state.common.sendErrorMessage(interaction, "Member not found");
      return;
    }

    await actualWhereCmd(pluginData, interaction, interaction.user.id, member);
  },
});
