import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { voiceMasterSlashCmd } from "../types.js";
import { actualSetupCmd } from "./actualSetupCmd.js";
import {
  actualClaimCmd,
  actualHideCmd,
  actualLimitCmd,
  actualLockCmd,
  actualRenameCmd,
  actualTransferCmd,
  actualUnhideCmd,
  actualUnlockCmd,
} from "./actualControlCmds.js";

export const VmSetupSlashCmd = voiceMasterSlashCmd({
  name: "setup",
  configPermission: "can_setup",
  description: "Validate VoiceMaster hub/category and print YAML to enable",
  allowDms: false,
  signature: [
    slashOptions.channel({
      name: "hub",
      description: "Join-to-create voice channel",
      channelTypes: [ChannelType.GuildVoice],
      required: true,
    }),
    slashOptions.channel({
      name: "category",
      description: "Category for temp channels",
      channelTypes: [ChannelType.GuildCategory],
      required: false,
    }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualSetupCmd(pluginData, interaction, options.hub.id, options.category?.id ?? null);
  },
});

export const VmLockSlashCmd = voiceMasterSlashCmd({
  name: "lock",
  configPermission: "can_control",
  description: "Lock your temporary voice channel",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualLockCmd(pluginData, interaction, interaction.user.id);
  },
});

export const VmUnlockSlashCmd = voiceMasterSlashCmd({
  name: "unlock",
  configPermission: "can_control",
  description: "Unlock your temporary voice channel",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualUnlockCmd(pluginData, interaction, interaction.user.id);
  },
});

export const VmHideSlashCmd = voiceMasterSlashCmd({
  name: "hide",
  configPermission: "can_control",
  description: "Hide your temporary voice channel",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualHideCmd(pluginData, interaction, interaction.user.id);
  },
});

export const VmUnhideSlashCmd = voiceMasterSlashCmd({
  name: "unhide",
  configPermission: "can_control",
  description: "Unhide your temporary voice channel",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualUnhideCmd(pluginData, interaction, interaction.user.id);
  },
});

export const VmRenameSlashCmd = voiceMasterSlashCmd({
  name: "rename",
  configPermission: "can_control",
  description: "Rename your temporary voice channel",
  allowDms: false,
  signature: [slashOptions.string({ name: "name", description: "New channel name", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualRenameCmd(pluginData, interaction, interaction.user.id, options.name);
  },
});

export const VmLimitSlashCmd = voiceMasterSlashCmd({
  name: "limit",
  configPermission: "can_control",
  description: "Set user limit for your temporary voice channel",
  allowDms: false,
  signature: [slashOptions.integer({ name: "limit", description: "0-99 (0 = unlimited)", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualLimitCmd(pluginData, interaction, interaction.user.id, options.limit);
  },
});

export const VmClaimSlashCmd = voiceMasterSlashCmd({
  name: "claim",
  configPermission: "can_control",
  description: "Claim an abandoned temporary voice channel",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualClaimCmd(pluginData, interaction, interaction.user.id);
  },
});

export const VmTransferSlashCmd = voiceMasterSlashCmd({
  name: "transfer",
  configPermission: "can_control",
  description: "Transfer ownership of your temporary voice channel",
  allowDms: false,
  signature: [slashOptions.user({ name: "user", description: "New owner", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualTransferCmd(pluginData, interaction, interaction.user.id, options.user.id);
  },
});
