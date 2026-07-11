import { ChannelType, escapeInlineCode } from "discord.js";
import { slashOptions } from "vety";
import { asSingleLine, renderUsername } from "../../../utils.js";
import { getMissingChannelPermissions } from "../../../utils/getMissingChannelPermissions.js";
import { missingPermissionError } from "../../../utils/missingPermissionError.js";
import { BOT_SLOWMODE_CLEAR_PERMISSIONS } from "../requiredPermissions.js";
import { slowmodeSlashCmd } from "../types.js";
import { clearBotSlowmodeFromUserId } from "../util/clearBotSlowmodeFromUserId.js";

export const SlowmodeClearSlashCmd = slowmodeSlashCmd({
  name: "clear",
  configPermission: "can_manage",
  description: "Clear bot slowmode from a user in a channel",
  allowDms: false,

  signature: [
    slashOptions.user({ name: "user", description: "The user to clear slowmode from", required: true }),
    slashOptions.channel({
      name: "channel",
      description: "The channel (defaults to current)",
      channelTypes: [ChannelType.GuildText],
      required: false,
    }),
    slashOptions.boolean({ name: "force", description: "Force clear even if checks fail", required: false }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const channel = (options.channel
      ? pluginData.guild.channels.cache.get(options.channel.id)
      : interaction.channel) as any;

    if (!channel || channel.type !== ChannelType.GuildText) {
      pluginData.state.common.sendErrorMessage(interaction, "Slowmode clear requires a text channel");
      return;
    }

    const channelSlowmode = await pluginData.state.slowmodes.getChannelSlowmode(channel.id);
    if (!channelSlowmode) {
      pluginData.state.common.sendErrorMessage(interaction, "Channel doesn't have slowmode!");
      return;
    }

    const me =
      pluginData.guild.members.cache.get(pluginData.client.user!.id) ||
      pluginData.guild.members.me ||
      (await pluginData.guild.members.fetchMe());
    const missingPermissions = getMissingChannelPermissions(me, channel, BOT_SLOWMODE_CLEAR_PERMISSIONS);
    if (missingPermissions) {
      pluginData.state.common.sendErrorMessage(
        interaction,
        `Unable to clear slowmode. ${missingPermissionError(missingPermissions)}`,
      );
      return;
    }

    try {
      await clearBotSlowmodeFromUserId(pluginData, channel, options.user.id, options.force ?? false);
    } catch (e) {
      pluginData.state.common.sendErrorMessage(
        interaction,
        asSingleLine(`
          Failed to clear slowmode from **${renderUsername(options.user)}** in <#${channel.id}>:
          \`${escapeInlineCode(e.message)}\`
        `),
      );
      return;
    }

    pluginData.state.common.sendSuccessMessage(
      interaction,
      `Slowmode cleared from **${renderUsername(options.user)}** in <#${channel.id}>`,
    );
  },
});
