import { slashOptions } from "vety";
import { parseSlashDelay } from "../../../utils.js";
import { locateUserSlashCmd } from "../types.js";
import { actualFollowCmd } from "./actualFollowCmd.js";

export const FollowSlashCmd = locateUserSlashCmd({
  name: "follow",
  configPermission: "can_alert",
  description: "Alert when a member joins or switches voice channels",
  allowDms: false,

  signature: [
    slashOptions.user({ name: "member", description: "The member to follow", required: true }),
    slashOptions.string({ name: "reminder", description: "Optional reminder text", required: false }),
    slashOptions.string({ name: "duration", description: "Alert duration e.g. 10m (default 10m)", required: false }),
    slashOptions.boolean({ name: "active", description: "Also move you into their VC", required: false }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const member = await pluginData.guild.members.fetch(options.member.id).catch(() => null);
    if (!member) {
      await pluginData.state.common.sendErrorMessage(interaction, "Member not found");
      return;
    }

    let duration: number | undefined;
    if (options.duration) {
      const parsed = parseSlashDelay(options.duration);
      if (parsed === null) {
        await pluginData.state.common.sendErrorMessage(interaction, `Could not convert ${options.duration} to a delay`);
        return;
      }
      duration = parsed;
    }

    await actualFollowCmd(
      pluginData,
      interaction,
      interaction.user.id,
      interaction.channelId,
      member,
      options.reminder,
      duration,
      options.active || false,
    );
  },
});
