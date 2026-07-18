import { botProfileCmd } from "../types.js";
import { actualCustomBotCmd } from "./actualBotProfileCmds.js";

export const CustomBotCmd = botProfileCmd({
  trigger: ["custombot", "botprofile", "cb"],
  usage: "!custombot",
  permission: "can_manage",
  description: "Customize the bot nickname, avatar, banner, and bio for this server",
  signature: {},
  async run({ message: msg, pluginData }) {
    if (!msg.channel.isTextBased() || msg.channel.isDMBased()) return;
    await actualCustomBotCmd(pluginData, msg, msg.author.id);
  },
});
