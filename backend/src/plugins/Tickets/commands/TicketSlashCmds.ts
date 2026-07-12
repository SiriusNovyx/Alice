import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { ticketsSlashCmd } from "../types.js";
import {
  actualAddCmd,
  actualClaimCmd,
  actualCloseCmd,
  actualPanelCmd,
  actualRemoveCmd,
} from "./actualTicketCmds.js";

const textChannelTypes = [
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
];

export const TicketPanelSlashCmd = ticketsSlashCmd({
  name: "panel",
  configPermission: "can_manage",
  description: "Send a ticket panel to this channel",
  allowDms: false,
  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel for the panel",
      channelTypes: textChannelTypes,
      required: false,
    }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const channel = options.channel ?? interaction.channel;
    if (!channel || !("isTextBased" in channel) || !channel.isTextBased() || channel.isDMBased()) {
      await pluginData.state.common.sendErrorMessage(interaction, "Provide a text channel.");
      return;
    }
    await actualPanelCmd(pluginData, interaction, channel as any);
  },
});

export const TicketCloseSlashCmd = ticketsSlashCmd({
  name: "close",
  configPermission: "can_use",
  description: "Close the current ticket",
  allowDms: false,
  signature: [slashOptions.string({ name: "reason", description: "Close reason", required: false })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const memberConfig = await pluginData.config.getForMember(interaction.member as any);
    await actualCloseCmd(
      pluginData,
      interaction,
      interaction.channelId!,
      interaction.user.id,
      options.reason ?? null,
      memberConfig.can_manage,
    );
  },
});

export const TicketClaimSlashCmd = ticketsSlashCmd({
  name: "claim",
  configPermission: "can_manage",
  description: "Claim the current ticket",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualClaimCmd(pluginData, interaction, interaction.channelId!, interaction.user.id);
  },
});

export const TicketAddSlashCmd = ticketsSlashCmd({
  name: "add",
  configPermission: "can_manage",
  description: "Add a user to the ticket",
  allowDms: false,
  signature: [slashOptions.user({ name: "user", description: "User to add", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualAddCmd(pluginData, interaction, interaction.channelId!, options.user.id);
  },
});

export const TicketRemoveSlashCmd = ticketsSlashCmd({
  name: "remove",
  configPermission: "can_manage",
  description: "Remove a user from the ticket",
  allowDms: false,
  signature: [slashOptions.user({ name: "user", description: "User to remove", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualRemoveCmd(pluginData, interaction, interaction.channelId!, options.user.id);
  },
});
