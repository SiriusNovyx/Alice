import { Snowflake } from "discord.js";
import { guildPluginMessageCommand } from "vety";
import { waitForReply } from "vety/helpers";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { resolveUser, UnknownUser } from "../../../utils.js";
import { CountersPluginType } from "../types.js";
import { actualViewCounterCmd } from "./actualCountersCmds.js";

export const ViewCounterCmd = guildPluginMessageCommand<CountersPluginType>()({
  trigger: ["counters view", "counter view", "viewcounter", "counter"],
  permission: "can_view",

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
      channel: ct.guildTextBasedChannel(),
    },
    {
      counterName: ct.string(),
      channel: ct.guildTextBasedChannel(),
      user: ct.resolvedUser(),
    },
    {
      counterName: ct.string(),
      user: ct.resolvedUser(),
      channel: ct.guildTextBasedChannel(),
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
      await message.channel.send(`Which channel's counter value would you like to view?`);
      const reply = await waitForReply(pluginData.client, message.channel, message.author.id);
      if (!reply || !reply.content) {
        void pluginData.state.common.sendErrorMessage(message, "Cancelling");
        return;
      }

      const potentialChannel = pluginData.guild.channels.resolve(reply.content as Snowflake);
      if (!potentialChannel?.isTextBased()) {
        void pluginData.state.common.sendErrorMessage(message, "Channel is not a text channel, cancelling");
        return;
      }

      channel = potentialChannel;
    }

    let user = args.user ?? null;
    if (!user && counter.per_user) {
      await message.channel.send(`Which user's counter value would you like to view?`);
      const reply = await waitForReply(pluginData.client, message.channel, message.author.id);
      if (!reply || !reply.content) {
        void pluginData.state.common.sendErrorMessage(message, "Cancelling");
        return;
      }

      const potentialUser = await resolveUser(pluginData.client, reply.content, "Counters:ViewCounterCmd");
      if (!potentialUser || potentialUser instanceof UnknownUser) {
        void pluginData.state.common.sendErrorMessage(message, "Unknown user, cancelling");
        return;
      }

      user = potentialUser;
    }

    await actualViewCounterCmd(pluginData, message, args.counterName, channel, user);
  },
});
