import { slashOptions } from "vety";
import { formatAvatarEmbed } from "../functions/formatUtilityReplies.js";
import { utilitySlashCmd } from "../types.js";

export const AvatarSlashCmd = utilitySlashCmd({
  name: "avatar",
  configPermission: "can_avatar",
  description: "Get a user's profile picture",
  allowDms: false,

  signature: [
    slashOptions.user({
      name: "user",
      description: "The user whose avatar to show (defaults to yourself)",
      required: false,
    }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: false });

    const userId = options.user?.id ?? interaction.user.id;
    const member = await pluginData.guild.members.fetch(userId).catch(() => null);
    const user = member ?? options.user ?? interaction.user;

    await interaction.editReply({ embeds: [formatAvatarEmbed(user)] });
  },
});
