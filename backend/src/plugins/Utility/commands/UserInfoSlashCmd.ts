import { slashOptions } from "vety";
import { getUserInfoEmbed } from "../functions/getUserInfoEmbed.js";
import { utilitySlashCmd } from "../types.js";

export const UserInfoSlashCmd = utilitySlashCmd({
  name: "userinfo",
  configPermission: "can_userinfo",
  description: "Show information about a user",
  allowDms: false,

  signature: [
    slashOptions.user({ name: "user", description: "The user to look up (defaults to yourself)", required: false }),
    slashOptions.boolean({ name: "compact", description: "Show a compact version", required: false }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: false });

    const userId = options.user?.id ?? interaction.user.id;
    const embed = await getUserInfoEmbed(pluginData, userId, options.compact ?? false);
    if (!embed) {
      pluginData.state.common.sendErrorMessage(interaction, "User not found");
      return;
    }

    interaction.editReply({ embeds: [embed] });
  },
});
