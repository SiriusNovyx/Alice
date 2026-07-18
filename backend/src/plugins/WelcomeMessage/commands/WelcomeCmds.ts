import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { welcomeMessageCmd } from "../types.js";
import {
  actualGreetChannelCmd,
  actualGreetColorCmd,
  actualGreetConfigCmd,
  actualGreetContentCmd,
  actualGreetDeleteAfterCmd,
  actualGreetDescriptionCmd,
  actualGreetDisableCmd,
  actualGreetHelpCmd,
  actualGreetImageCmd,
  actualGreetMessageCmd,
  actualGreetSetupCmd,
  actualGreetTestCmd,
  actualGreetThumbnailCmd,
  actualGreetTitleCmd,
  actualGreetVariablesCmd,
} from "./actualWelcomeCmds.js";

export const GreetHelpCmd = welcomeMessageCmd({
  trigger: ["greet", "welcome"],
  usage: "!greet",
  permission: "can_manage",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualGreetHelpCmd(pluginData, msg);
  },
});

export const GreetSetupCmd = welcomeMessageCmd({
  trigger: ["greet setup", "welcome setup"],
  usage: "!greet setup <channel>",
  permission: "can_manage",
  signature: {
    channel: ct.guildTextBasedChannel(),
  },
  async run({ message: msg, args, pluginData }) {
    await actualGreetSetupCmd(pluginData, msg, args.channel.id);
  },
});

export const GreetChannelCmd = welcomeMessageCmd({
  trigger: ["greet channel", "welcome channel"],
  usage: "!greet channel <channel>",
  permission: "can_manage",
  signature: {
    channel: ct.guildTextBasedChannel(),
  },
  async run({ message: msg, args, pluginData }) {
    await actualGreetChannelCmd(pluginData, msg, args.channel.id);
  },
});

export const GreetContentCmd = welcomeMessageCmd({
  trigger: ["greet content", "welcome content"],
  usage: "!greet content <text>",
  permission: "can_manage",
  signature: {
    text: ct.string({ catchAll: true }),
  },
  async run({ message: msg, args, pluginData }) {
    await actualGreetContentCmd(pluginData, msg, args.text);
  },
});

export const GreetTitleCmd = welcomeMessageCmd({
  trigger: ["greet title", "welcome title"],
  usage: "!greet title <text>",
  permission: "can_manage",
  signature: {
    text: ct.string({ catchAll: true }),
  },
  async run({ message: msg, args, pluginData }) {
    await actualGreetTitleCmd(pluginData, msg, args.text);
  },
});

export const GreetDescriptionCmd = welcomeMessageCmd({
  trigger: ["greet description", "welcome description"],
  usage: "!greet description <text>",
  permission: "can_manage",
  signature: {
    text: ct.string({ catchAll: true }),
  },
  async run({ message: msg, args, pluginData }) {
    await actualGreetDescriptionCmd(pluginData, msg, args.text);
  },
});

export const GreetColorCmd = welcomeMessageCmd({
  trigger: ["greet color", "welcome color"],
  usage: "!greet color <#hex>",
  permission: "can_manage",
  signature: {
    color: ct.string(),
  },
  async run({ message: msg, args, pluginData }) {
    await actualGreetColorCmd(pluginData, msg, args.color);
  },
});

export const GreetThumbnailCmd = welcomeMessageCmd({
  trigger: ["greet thumbnail", "welcome thumbnail"],
  usage: "!greet thumbnail <url>",
  permission: "can_manage",
  signature: {
    url: ct.string({ catchAll: true }),
  },
  async run({ message: msg, args, pluginData }) {
    await actualGreetThumbnailCmd(pluginData, msg, args.url);
  },
});

export const GreetImageCmd = welcomeMessageCmd({
  trigger: ["greet image", "welcome image"],
  usage: "!greet image <url>",
  permission: "can_manage",
  signature: {
    url: ct.string({ catchAll: true }),
  },
  async run({ message: msg, args, pluginData }) {
    await actualGreetImageCmd(pluginData, msg, args.url);
  },
});

export const GreetMessageCmd = welcomeMessageCmd({
  trigger: ["greet message", "welcome message"],
  usage: "!greet message <text>",
  permission: "can_manage",
  signature: {
    text: ct.string({ catchAll: true }),
  },
  async run({ message: msg, args, pluginData }) {
    await actualGreetMessageCmd(pluginData, msg, args.text);
  },
});

export const GreetDeleteAfterCmd = welcomeMessageCmd({
  trigger: ["greet deleteafter", "welcome deleteafter", "greet delete-after", "welcome delete-after"],
  usage: "!greet deleteafter <seconds>",
  permission: "can_manage",
  signature: {
    seconds: ct.number(),
  },
  async run({ message: msg, args, pluginData }) {
    await actualGreetDeleteAfterCmd(pluginData, msg, args.seconds);
  },
});

export const GreetTestCmd = welcomeMessageCmd({
  trigger: ["greet test", "welcome test"],
  usage: "!greet test",
  permission: "can_manage",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualGreetTestCmd(pluginData, msg);
  },
});

export const GreetConfigCmd = welcomeMessageCmd({
  trigger: ["greet config", "welcome config"],
  usage: "!greet config",
  permission: "can_manage",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualGreetConfigCmd(pluginData, msg);
  },
});

export const GreetVariablesCmd = welcomeMessageCmd({
  trigger: ["greet variables", "welcome variables", "greet vars", "welcome vars"],
  usage: "!greet variables",
  permission: "can_manage",
  signature: {},
  async run({ message: msg }) {
    await actualGreetVariablesCmd(msg);
  },
});

export const GreetDisableCmd = welcomeMessageCmd({
  trigger: ["greet disable", "welcome disable"],
  usage: "!greet disable",
  permission: "can_manage",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualGreetDisableCmd(pluginData, msg);
  },
});
