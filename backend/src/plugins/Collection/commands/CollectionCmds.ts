import { slashOptions } from "vety";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { collectionCmd, collectionSlashCmd } from "../types.js";
import { actualGive, actualInv, actualPull, actualTrade } from "./actualCollectionCmds.js";

export const PullCmd = collectionCmd({
  trigger: ["cpull", "collect", "croll"],
  usage: "!cpull",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualPull(pluginData, msg, msg.author.id);
  },
});

export const InvCmd = collectionCmd({
  trigger: ["cinv", "collection"],
  usage: "!cinv",
  permission: "can_use",
  signature: { user: ct.user({ required: false }) },
  async run({ message: msg, args, pluginData }) {
    await actualInv(pluginData, msg, args.user?.id ?? msg.author.id);
  },
});

export const GiveCmd = collectionCmd({
  trigger: ["cgive"],
  usage: "!cgive <user> <item> [qty]",
  permission: "can_use",
  signature: {
    user: ct.user(),
    item: ct.string(),
    qty: ct.number({ required: false }),
  },
  async run({ message: msg, args, pluginData }) {
    await actualGive(pluginData, msg, msg.author.id, args.user.id, args.item, args.qty ?? 1);
  },
});

export const TradeCmd = collectionCmd({
  trigger: ["ctrade"],
  usage: "!ctrade <your_item> <@user> <their_item>",
  permission: "can_use",
  signature: {
    itemA: ct.string(),
    user: ct.user(),
    itemB: ct.string(),
  },
  async run({ message: msg, args, pluginData }) {
    await actualTrade(pluginData, msg, msg.author.id, args.itemA, args.user.id, args.itemB);
  },
});

export const PullSlashCmd = collectionSlashCmd({
  name: "pull",
  configPermission: "can_use",
  description: "Pull a random collection item",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualPull(pluginData, interaction, interaction.user.id);
  },
});

export const InvSlashCmd = collectionSlashCmd({
  name: "inventory",
  configPermission: "can_use",
  description: "Show collection inventory",
  allowDms: false,
  signature: [slashOptions.user({ name: "user", description: "User", required: false })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualInv(pluginData, interaction, options.user?.id ?? interaction.user.id);
  },
});

export const GiveSlashCmd = collectionSlashCmd({
  name: "give",
  configPermission: "can_use",
  description: "Give a collection item",
  allowDms: false,
  signature: [
    slashOptions.user({ name: "user", description: "Recipient", required: true }),
    slashOptions.string({ name: "item", description: "Item key", required: true }),
    slashOptions.integer({ name: "quantity", description: "Quantity", required: false }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualGive(
      pluginData,
      interaction,
      interaction.user.id,
      options.user.id,
      options.item,
      options.quantity ?? 1,
    );
  },
});

export const TradeSlashCmd = collectionSlashCmd({
  name: "trade",
  configPermission: "can_use",
  description: "Trade one item with another user",
  allowDms: false,
  signature: [
    slashOptions.string({ name: "your_item", description: "Your item key", required: true }),
    slashOptions.user({ name: "user", description: "Trade partner", required: true }),
    slashOptions.string({ name: "their_item", description: "Their item key", required: true }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualTrade(
      pluginData,
      interaction,
      interaction.user.id,
      options.your_item,
      options.user.id,
      options.their_item,
    );
  },
});
