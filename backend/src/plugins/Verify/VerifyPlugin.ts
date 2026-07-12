import { guildPlugin } from "vety";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import { VerifySetupCmd, VerifySubmitCmd } from "./commands/VerifyCmds.js";
import { VerifySetupSlashCmd, VerifySubmitSlashCmd } from "./commands/VerifySlashCmds.js";
import { MemberAddEvt, VerifyInteractionEvt } from "./events/VerifyEvts.js";
import { VerifyPluginType, verifySlashGroup, zVerifyConfig } from "./types.js";

export const VerifyPlugin = guildPlugin<VerifyPluginType>()({
  name: "verify",

  configSchema: zVerifyConfig,
  defaultOverrides: [
    {
      level: ">=50",
      config: {
        can_setup: true,
      },
    },
  ],

  messageCommands: [VerifySetupCmd, VerifySubmitCmd],

  slashCommands: [
    verifySlashGroup({
      name: "verify",
      description: "Member verification",
      defaultMemberPermissions: "0",
      subcommands: [VerifySetupSlashCmd, VerifySubmitSlashCmd],
    }),
  ],

  events: [MemberAddEvt, VerifyInteractionEvt],

  beforeLoad(pluginData) {
    pluginData.state.challenges = new Map();
  },

  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },
});
