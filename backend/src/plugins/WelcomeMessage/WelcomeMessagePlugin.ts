<<<<<<< HEAD
import { guildPlugin, guildPluginEventListener } from "vety";
=======
import { guildPlugin } from "vety";
>>>>>>> a0a54da391085c24c9e28ad6ab2874adc81600a7
import { GuildLogs } from "../../data/GuildLogs.js";
import { LogsPlugin } from "../Logs/LogsPlugin.js";
import { SendWelcomeMessageEvt } from "./events/SendWelcomeMessageEvt.js";
import { WelcomeMessagePluginType, zWelcomeMessageConfig } from "./types.js";

<<<<<<< HEAD
// Remove user from sentWelcomeMessages when they leave so they get welcomed again if they rejoin
const ClearWelcomeOnLeaveEvt = guildPluginEventListener<WelcomeMessagePluginType>()({
  event: "guildMemberRemove",
  listener({ args, pluginData }) {
    pluginData.state.sentWelcomeMessages.delete(args.member.id);
  },
});

=======
>>>>>>> a0a54da391085c24c9e28ad6ab2874adc81600a7
export const WelcomeMessagePlugin = guildPlugin<WelcomeMessagePluginType>()({
  name: "welcome_message",

  dependencies: () => [LogsPlugin],
  configSchema: zWelcomeMessageConfig,

  // prettier-ignore
  events: [
    SendWelcomeMessageEvt,
<<<<<<< HEAD
    ClearWelcomeOnLeaveEvt,
=======
>>>>>>> a0a54da391085c24c9e28ad6ab2874adc81600a7
  ],

  beforeLoad(pluginData) {
    const { state, guild } = pluginData;

    state.logs = new GuildLogs(guild.id);
    state.sentWelcomeMessages = new Set();
  },
});
