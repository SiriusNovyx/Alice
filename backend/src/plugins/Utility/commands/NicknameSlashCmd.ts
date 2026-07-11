import { GuildMember } from "discord.js";
import { slashOptions } from "vety";
import { utilitySlashCmd } from "../types.js";
import { actualNicknameCmd } from "./actualNicknameCmd.js";

export const NicknameSlashCmd = utilitySlashCmd({
  name: "nickname",
  configPermission: "can_nickname",
  description: "Set, view, or reset a member's nickname",
  allowDms: false,

  signature: [
    slashOptions.user({ name: "member", description: "The member whose nickname to set", required: true }),
    slashOptions.string({
      name: "nickname",
      description: "The new nickname (leave empty to view current)",
      required: false,
    }),
    slashOptions.boolean({
      name: "reset",
      description: "Reset the member's nickname to their username",
      required: false,
    }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const member = await pluginData.guild.members.fetch(options.member.id).catch(() => null);
    if (!member) {
      pluginData.state.common.sendErrorMessage(interaction, "Member not found");
      return;
    }

    const modMember =
      (interaction.member as GuildMember) ??
      (await pluginData.guild.members.fetch(interaction.user.id).catch(() => null));
    if (!modMember) {
      pluginData.state.common.sendErrorMessage(interaction, "Failed to resolve your member info");
      return;
    }

    if (options.reset) {
      await actualNicknameCmd(pluginData, interaction, modMember, member, "reset");
      return;
    }

    await actualNicknameCmd(
      pluginData,
      interaction,
      modMember,
      member,
      options.nickname ? "set" : "view",
      options.nickname,
    );
  },
});
