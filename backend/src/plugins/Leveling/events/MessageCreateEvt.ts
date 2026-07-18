import { Message } from "discord.js";
import { resolveMessageMember } from "../../../pluginUtils.js";
import { handleMessageXp } from "../functions/xp.js";
import { levelingEvt } from "../types.js";

export const MessageCreateEvt = levelingEvt({
  event: "messageCreate",
  async listener({ pluginData, args: { message } }) {
    if (!message.inGuild() || message.author.bot) return;

    let member;
    try {
      member = await resolveMessageMember(message as Message<true>);
    } catch {
      return;
    }
    if (!member) return;

    await handleMessageXp(pluginData, member, message.channel.id);
  },
});
