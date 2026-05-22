import { escapeBold, GuildMember } from "discord.js";
import { slashOptions } from "vety";
import { canActOn } from "../../../pluginUtils.js";
import { utilitySlashCmd } from "../types.js";

export const NicknameSlashCmd = utilitySlashCmd({
  name: "nickname",
  configPermission: "can_nickname",
  description: "Set or view a member's nickname",
  allowDms: false,

  signature: [
    slashOptions.user({ name: "member", description: "The member whose nickname to set", required: true }),
    slashOptions.string({ name: "nickname", description: "The new nickname (leave empty to view current)", required: false }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const member = await pluginData.guild.members.fetch(options.member.id).catch(() => null);
    if (!member) {
      pluginData.state.common.sendErrorMessage(interaction, "Member not found");
      return;
    }

    if (!options.nickname) {
      if (!member.nickname) {
        interaction.editReply(`<@!${member.id}> does not have a nickname`);
      } else {
        interaction.editReply(`The nickname of <@!${member.id}> is **${escapeBold(member.nickname)}**`);
      }
      return;
    }

    if (interaction.user.id !== member.id && !canActOn(pluginData, interaction.member as GuildMember, member)) {
      pluginData.state.common.sendErrorMessage(interaction, "Cannot change nickname: insufficient permissions");
      return;
    }

    const nicknameLength = [...options.nickname].length;
    if (nicknameLength < 2 || nicknameLength > 32) {
      pluginData.state.common.sendErrorMessage(interaction, "Nickname must be between 2 and 32 characters long");
      return;
    }

    const oldNickname = member.nickname || "<none>";
    await member.setNickname(options.nickname).catch(() => null);

    pluginData.state.common.sendSuccessMessage(
      interaction,
      `Changed nickname of <@!${member.id}> from **${oldNickname}** to **${options.nickname}**`,
    );
  },
});
