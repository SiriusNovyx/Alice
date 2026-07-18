import { guildPlugin } from "vety";
import { GuildVoiceMasterChannels } from "../../data/GuildVoiceMasterChannels.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import { VmClaimCmd, VmHideCmd, VmLimitCmd, VmLockCmd, VmRenameCmd, VmTransferCmd, VmUnhideCmd, VmUnlockCmd } from "./commands/VmControlCmds.js";
import { VmSetupCmd } from "./commands/VmSetupCmd.js";
import {
  VmClaimSlashCmd,
  VmHideSlashCmd,
  VmLimitSlashCmd,
  VmLockSlashCmd,
  VmRenameSlashCmd,
  VmSetupSlashCmd,
  VmTransferSlashCmd,
  VmUnhideSlashCmd,
  VmUnlockSlashCmd,
} from "./commands/VmSlashCmds.js";
import { VoiceStateUpdateEvt } from "./events/VoiceStateUpdateEvt.js";
import { VoiceMasterPluginType, voiceMasterSlashGroup, zVoiceMasterConfig } from "./types.js";

export const VoiceMasterPlugin = guildPlugin<VoiceMasterPluginType>()({
  name: "voicemaster",

  configSchema: zVoiceMasterConfig,
  defaultOverrides: [
    {
      level: ">=50",
      config: {
        can_setup: true,
      },
    },
  ],

  // prettier-ignore
  messageCommands: [
    VmSetupCmd,
    VmLockCmd,
    VmUnlockCmd,
    VmHideCmd,
    VmUnhideCmd,
    VmRenameCmd,
    VmLimitCmd,
    VmClaimCmd,
    VmTransferCmd,
  ],

  slashCommands: [
    voiceMasterSlashGroup({
      name: "voicemaster",
      description: "Temporary voice channel controls",
      subcommands: [
        VmSetupSlashCmd,
        VmLockSlashCmd,
        VmUnlockSlashCmd,
        VmHideSlashCmd,
        VmUnhideSlashCmd,
        VmRenameSlashCmd,
        VmLimitSlashCmd,
        VmClaimSlashCmd,
        VmTransferSlashCmd,
      ],
    }),
  ],

  events: [VoiceStateUpdateEvt],

  beforeLoad(pluginData) {
    pluginData.state.voiceChannels = GuildVoiceMasterChannels.getGuildInstance(pluginData.guild.id);
    pluginData.state.creating = new Set();
  },

  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },
});
