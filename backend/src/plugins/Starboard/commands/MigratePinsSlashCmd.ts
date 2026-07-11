import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { starboardSlashCmd } from "../types.js";
import { actualMigratePinsCmd } from "./actualMigratePinsCmd.js";

export const MigratePinsSlashCmd = starboardSlashCmd({
  name: "migrate_pins",
  configPermission: "can_migrate",
  description: "Migrate pinned messages to a starboard (pins are not removed)",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "pin-channel",
      description: "Channel whose pins to migrate",
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
      required: true,
    }),
    slashOptions.string({
      name: "starboard",
      description: "Name of the starboard board from config",
      required: true,
    }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const pinChannel = pluginData.guild.channels.cache.get(options["pin-channel"].id);
    if (!pinChannel?.isTextBased() || pinChannel.isThread()) {
      await pluginData.state.common.sendErrorMessage(interaction, "Invalid pin channel");
      return;
    }

    await actualMigratePinsCmd(pluginData, interaction, pinChannel, options.starboard);
  },
});
