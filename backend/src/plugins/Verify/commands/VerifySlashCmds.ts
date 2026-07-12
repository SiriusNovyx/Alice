import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { verifySlashCmd } from "../types.js";
import { actualSetupPanelCmd, actualSubmitCmd } from "./actualVerifyCmds.js";

const textChannelTypes = [
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
];

export const VerifySetupSlashCmd = verifySlashCmd({
  name: "panel",
  configPermission: "can_setup",
  description: "Send the verification panel",
  allowDms: false,
  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel for the panel",
      channelTypes: textChannelTypes,
      required: true,
    }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualSetupPanelCmd(pluginData, interaction, options.channel.id);
  },
});

export const VerifySubmitSlashCmd = verifySlashCmd({
  name: "submit",
  configPermission: "can_submit",
  description: "Submit a captcha verification code",
  allowDms: false,
  signature: [slashOptions.string({ name: "code", description: "Captcha code", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const member = await pluginData.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member) {
      await pluginData.state.common.sendErrorMessage(interaction, "Could not resolve member.");
      return;
    }
    await actualSubmitCmd(pluginData, interaction, member, options.code);
  },
});
