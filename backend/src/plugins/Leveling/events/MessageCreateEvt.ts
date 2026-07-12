import { GuildMember } from "discord.js";
import { handleMessageXp } from "../functions/xp.js";
import { levelingEvt } from "../types.js";

export const MessageCreateEvt = levelingEvt({
  event: "messageCreate",
  async listener({ pluginData, args: { message } }) {
    if (!message.guild || message.author.bot || !message.member) return;
    await handleMessageXp(pluginData, message.member as GuildMember, message.channel.id);
  },
});
