import { Snowflake, TextChannel } from "discord.js";
import { guildPluginMessageCommand } from "vety";
import { waitForReply } from "vety/helpers";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { UnknownUser, resolveUser } from "../../../utils.js";
import { CountersPluginType } from "../types.js";
import { actualResetCounterCmd } from "./actualCountersCmds.js";

export const ResetCounterCmd = guildPluginMessageCommand<CountersPluginType>()({
  trigger: ["counters reset", "counter reset", "resetcounter"],
  permission: "can_edit",

  signature: [
    {
      counterName: ct.string(),
    },
    {
      counterName: ct.string(),
      user: ct.resolvedUser(),
    },
    {
      counterName: ct.string(),
      channel: ct.textChannel(),
    },
    {
      counterName: ct.string(),
      channel: ct.textChannel(),
      user: ct.resolvedUser(),
    },
    {
      counterName: ct.string(),
      user: ct.resolvedUser(),
      channel: ct.textChannel(),
    },
  ],

  async run({ pluginData, message, args }) {
    const config = await pluginData.config.getForMessage(message);
    const counter = config.counters[args.counterName];
    if (!counter || !pluginData.state.counterIds[args.counterName]) {
      void pluginData.state.common.sendErrorMessage(message, `Unknown counter: ${args.counterName}`);
      return;
    }

    let channel = args.channel ?? null;
    if (!channel && counter.per_channel) {
      await message.channel.send(`Which channel's counter value would you like to reset?`);
      const reply = await waitForReply(pluginData.client, message.channel, message.author.id);
      if (!reply || !reply.content) {
        void pluginData.state.common.sendErrorMessage(message, "Cancelling");
        return;
      }

      const potentialChannel = pluginData.guild.channels.resolve(reply.content as Snowflake);
      if (!potentialChannel || !(potentialChannel instanceof TextChannel)) {
        void pluginData.state.common.sendErrorMessage(message, "Channel is not a text channel, cancelling");
        return;
      }

      channel = potentialChannel;
    }

    let user = args.user ?? null;
    if (!user && counter.per_user) {
      await message.channel.send(`Which user's counter value would you like to reset?`);
      const reply = await waitForReply(pluginData.client, message.channel, message.author.id);
      if (!reply || !reply.content) {
        void pluginData.state.common.sendErrorMessage(message, "Cancelling");
        return;
      }

      const potentialUser = await resolveUser(pluginData.client, reply.content, "Counters:ResetCounterCmd");
      if (!potentialUser || potentialUser instanceof UnknownUser) {
        void pluginData.state.common.sendErrorMessage(message, "Unknown user, cancelling");
        return;
      }

      user = potentialUser;
    }

    await actualResetCounterCmd(pluginData, message, args.counterName, channel, user);
  },
});
