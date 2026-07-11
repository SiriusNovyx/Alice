import { ChannelType, GuildMember } from "discord.js";
import { slashOptions } from "vety";
import { reactionRolesSlashCmd } from "../types.js";
import { actualInitReactionRolesCmd } from "./actualInitReactionRolesCmd.js";

export const InitReactionRolesSlashCmd = reactionRolesSlashCmd({
  name: "init",
  configPermission: "can_manage",
  description: "Add reaction roles to a message",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel containing the target message",
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread],
      required: true,
    }),
    slashOptions.string({ name: "message-id", description: "ID of the message to add reaction roles to", required: true }),
    slashOptions.string({
      name: "pairs",
      description: "Emoji = roleId pairs, one per line (paste multiline)",
      required: true,
    }),
    slashOptions.boolean({ name: "exclusive", description: "Only one role from this set at a time", required: false }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const channel = pluginData.guild.channels.cache.get(options.channel.id);
    if (!channel?.isTextBased()) {
      await pluginData.state.common.sendErrorMessage(interaction, "Invalid channel");
      return;
    }

    const member = interaction.member as GuildMember;
    await actualInitReactionRolesCmd(
      pluginData,
      interaction,
      member,
      channel,
      options["message-id"],
      options.pairs,
      options.exclusive ?? false,
    );
  },
});
