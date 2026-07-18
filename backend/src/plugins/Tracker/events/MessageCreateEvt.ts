import moment from "moment-timezone";
import { trackerEvt } from "../types.js";

export const MessageCreateEvt = trackerEvt({
  event: "messageCreate",
  async listener({ pluginData, args: { message } }) {
    if (!pluginData.config.get().enabled) return;
    if (!message.inGuild() || message.author.bot) return;

    const blacklisted = await pluginData.state.blacklist.isBlacklisted(message.channel.id);
    if (blacklisted) return;

    const date = moment.utc().format("YYYY-MM-DD");
    await pluginData.state.messages.increment(message.author.id, date);
  },
});
