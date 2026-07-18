import { guildPlugin, guildPluginEventListener } from "vety";
import { GuildLogs } from "../../data/GuildLogs.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import { LogsPlugin } from "../Logs/LogsPlugin.js";
import {
  GreetChannelCmd,
  GreetColorCmd,
  GreetConfigCmd,
  GreetContentCmd,
  GreetDeleteAfterCmd,
  GreetDescriptionCmd,
  GreetDisableCmd,
  GreetHelpCmd,
  GreetImageCmd,
  GreetMessageCmd,
  GreetSetupCmd,
  GreetTestCmd,
  GreetThumbnailCmd,
  GreetTitleCmd,
  GreetVariablesCmd,
} from "./commands/WelcomeCmds.js";
import { SendWelcomeMessageEvt } from "./events/SendWelcomeMessageEvt.js";
import { WelcomeMessagePluginType, zWelcomeMessageConfig } from "./types.js";

// Remove user from sentWelcomeMessages when they leave so they get welcomed again if they rejoin
const ClearWelcomeOnLeaveEvt = guildPluginEventListener<WelcomeMessagePluginType>()({
  event: "guildMemberRemove",
  listener({ args, pluginData }) {
    pluginData.state.sentWelcomeMessages.delete(args.member.id);
  },
});

export const WelcomeMessagePlugin = guildPlugin<WelcomeMessagePluginType>()({
  name: "welcome_message",

  dependencies: () => [LogsPlugin],
  configSchema: zWelcomeMessageConfig,
  defaultOverrides: [
    {
      level: ">=50",
      config: {
        can_manage: true,
      },
    },
  ],

  // prettier-ignore
  messageCommands: [
    GreetHelpCmd,
    GreetSetupCmd,
    GreetChannelCmd,
    GreetContentCmd,
    GreetTitleCmd,
    GreetDescriptionCmd,
    GreetColorCmd,
    GreetThumbnailCmd,
    GreetImageCmd,
    GreetMessageCmd,
    GreetDeleteAfterCmd,
    GreetTestCmd,
    GreetConfigCmd,
    GreetVariablesCmd,
    GreetDisableCmd,
  ],

  // prettier-ignore
  events: [
    SendWelcomeMessageEvt,
    ClearWelcomeOnLeaveEvt,
  ],

  beforeLoad(pluginData) {
    const { state, guild } = pluginData;

    state.logs = new GuildLogs(guild.id);
    state.sentWelcomeMessages = new Set();
  },

  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },
});
