import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { countersSlashCmd } from "../types.js";
import {
  actualAddCounterCmd,
  actualCountersListCmd,
  actualResetAllCounterValuesCmd,
  actualResetCounterCmd,
  actualSetCounterCmd,
  actualViewCounterCmd,
} from "./actualCountersCmds.js";

const channelOpt = slashOptions.channel({
  name: "channel",
  description: "Channel (required for per-channel counters)",
  channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread],
  required: false,
});

const userOpt = slashOptions.user({
  name: "user",
  description: "User (required for per-user counters)",
  required: false,
});

export const CountersListSlashCmd = countersSlashCmd({
  name: "list",
  configPermission: "can_view",
  description: "List configured counters",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualCountersListCmd(pluginData, interaction);
  },
});

export const ViewCounterSlashCmd = countersSlashCmd({
  name: "view",
  configPermission: "can_view",
  description: "View a counter's value",
  allowDms: false,
  signature: [
    slashOptions.string({ name: "counter", description: "Counter name", required: true }),
    channelOpt,
    userOpt,
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const channel = options.channel ? pluginData.guild.channels.cache.get(options.channel.id) ?? null : null;
    await actualViewCounterCmd(pluginData, interaction, options.counter, channel, options.user ?? null);
  },
});

export const AddCounterSlashCmd = countersSlashCmd({
  name: "add",
  configPermission: "can_edit",
  description: "Add to a counter's value",
  allowDms: false,
  signature: [
    slashOptions.string({ name: "counter", description: "Counter name", required: true }),
    slashOptions.number({ name: "amount", description: "Amount to add", required: true }),
    channelOpt,
    userOpt,
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const channel = options.channel ? pluginData.guild.channels.cache.get(options.channel.id) ?? null : null;
    await actualAddCounterCmd(pluginData, interaction, options.counter, options.amount, channel, options.user ?? null);
  },
});

export const SetCounterSlashCmd = countersSlashCmd({
  name: "set",
  configPermission: "can_edit",
  description: "Set a counter's value",
  allowDms: false,
  signature: [
    slashOptions.string({ name: "counter", description: "Counter name", required: true }),
    slashOptions.number({ name: "value", description: "New value", required: true }),
    channelOpt,
    userOpt,
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const channel = options.channel ? pluginData.guild.channels.cache.get(options.channel.id) ?? null : null;
    await actualSetCounterCmd(pluginData, interaction, options.counter, options.value, channel, options.user ?? null);
  },
});

export const ResetCounterSlashCmd = countersSlashCmd({
  name: "reset",
  configPermission: "can_edit",
  description: "Reset a counter value to its initial value",
  allowDms: false,
  signature: [
    slashOptions.string({ name: "counter", description: "Counter name", required: true }),
    channelOpt,
    userOpt,
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const channel = options.channel ? pluginData.guild.channels.cache.get(options.channel.id) ?? null : null;
    await actualResetCounterCmd(pluginData, interaction, options.counter, channel, options.user ?? null);
  },
});

export const ResetAllCounterSlashCmd = countersSlashCmd({
  name: "reset_all",
  configPermission: "can_reset_all",
  description: "Reset ALL values for a counter (users and channels)",
  allowDms: false,
  signature: [
    slashOptions.string({ name: "counter", description: "Counter name", required: true }),
    slashOptions.boolean({
      name: "confirm",
      description: "Must be true to confirm this destructive action",
      required: true,
    }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualResetAllCounterValuesCmd(pluginData, interaction, options.counter, options.confirm);
  },
});
