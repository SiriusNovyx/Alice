import { slashOptions } from "vety";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { economyCmd, economySlashCmd } from "../types.js";
import {
  actualBalance,
  actualBattle,
  actualBeg,
  actualBuy,
  actualClanCreate,
  actualClanInfo,
  actualClanJoin,
  actualClanLeave,
  actualCrime,
  actualDaily,
  actualDeposit,
  actualDivorce,
  actualEcoLb,
  actualGamble,
  actualHunt,
  actualInventory,
  actualMarry,
  actualPay,
  actualRelease,
  actualRob,
  actualShop,
  actualSlots,
  actualTeamAdd,
  actualWeekly,
  actualWithdraw,
  actualWork,
  actualZoo,
} from "./actualEconomyCmds.js";

export const BalanceCmd = economyCmd({
  trigger: ["balance", "bal"],
  usage: "!balance [user]",
  permission: "can_use",
  signature: { user: ct.user({ required: false }) },
  async run({ message: msg, args, pluginData }) {
    await actualBalance(pluginData, msg, args.user?.id ?? msg.author.id);
  },
});

export const WorkCmd = economyCmd({
  trigger: "work",
  usage: "!work",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualWork(pluginData, msg, msg.author.id);
  },
});

export const CrimeCmd = economyCmd({
  trigger: "crime",
  usage: "!crime",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualCrime(pluginData, msg, msg.author.id);
  },
});

export const DailyCmd = economyCmd({
  trigger: "daily",
  usage: "!daily",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualDaily(pluginData, msg, msg.author.id);
  },
});

export const WeeklyCmd = economyCmd({
  trigger: "weekly",
  usage: "!weekly",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualWeekly(pluginData, msg, msg.author.id);
  },
});

export const PayCmd = economyCmd({
  trigger: "pay",
  usage: "!pay <user> <amount>",
  permission: "can_use",
  signature: { user: ct.user(), amount: ct.number() },
  async run({ message: msg, args, pluginData }) {
    await actualPay(pluginData, msg, msg.author.id, args.user.id, args.amount);
  },
});

export const EcoLbCmd = economyCmd({
  trigger: ["ecolb", "baltop"],
  usage: "!ecolb",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualEcoLb(pluginData, msg);
  },
});

export const GambleCmd = economyCmd({
  trigger: ["gamble", "coinflip"],
  usage: "!gamble <amount>",
  permission: "can_use",
  signature: { amount: ct.number() },
  async run({ message: msg, args, pluginData }) {
    await actualGamble(pluginData, msg, msg.author.id, args.amount);
  },
});

export const DepositCmd = economyCmd({
  trigger: ["deposit", "dep"],
  usage: "!deposit <amount>",
  permission: "can_use",
  signature: { amount: ct.number() },
  async run({ message: msg, args, pluginData }) {
    await actualDeposit(pluginData, msg, msg.author.id, args.amount);
  },
});

export const WithdrawCmd = economyCmd({
  trigger: ["withdraw", "with"],
  usage: "!withdraw <amount>",
  permission: "can_use",
  signature: { amount: ct.number() },
  async run({ message: msg, args, pluginData }) {
    await actualWithdraw(pluginData, msg, msg.author.id, args.amount);
  },
});

export const BegCmd = economyCmd({
  trigger: "beg",
  usage: "!beg",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualBeg(pluginData, msg, msg.author.id);
  },
});

export const RobCmd = economyCmd({
  trigger: "rob",
  usage: "!rob <user>",
  permission: "can_use",
  signature: { user: ct.user() },
  async run({ message: msg, args, pluginData }) {
    await actualRob(pluginData, msg, msg.author.id, args.user.id);
  },
});

export const SlotsCmd = economyCmd({
  trigger: "slots",
  usage: "!slots <amount>",
  permission: "can_use",
  signature: { amount: ct.number() },
  async run({ message: msg, args, pluginData }) {
    await actualSlots(pluginData, msg, msg.author.id, args.amount);
  },
});

export const ShopCmd = economyCmd({
  trigger: "shop",
  usage: "!shop [category]",
  permission: "can_use",
  signature: { category: ct.string({ required: false }) },
  async run({ message: msg, args, pluginData }) {
    await actualShop(pluginData, msg, args.category);
  },
});

export const BuyCmd = economyCmd({
  trigger: "buy",
  usage: "!buy <item_id>",
  permission: "can_use",
  signature: { item: ct.string() },
  async run({ message: msg, args, pluginData }) {
    await actualBuy(pluginData, msg, msg.author.id, args.item);
  },
});

export const InventoryCmd = economyCmd({
  trigger: ["einv", "ecoinv"],
  usage: "!einv",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualInventory(pluginData, msg, msg.author.id);
  },
});

export const HuntCmd = economyCmd({
  trigger: "hunt",
  usage: "!hunt",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualHunt(pluginData, msg, msg.author.id);
  },
});

export const ZooCmd = economyCmd({
  trigger: "zoo",
  usage: "!zoo",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualZoo(pluginData, msg, msg.author.id);
  },
});

export const TeamAddCmd = economyCmd({
  trigger: ["teamadd", "team-add"],
  usage: "!teamadd <creature_id>",
  permission: "can_use",
  signature: { id: ct.string() },
  async run({ message: msg, args, pluginData }) {
    await actualTeamAdd(pluginData, msg, msg.author.id, args.id);
  },
});

export const ReleaseCmd = economyCmd({
  trigger: "release",
  usage: "!release <creature_id>",
  permission: "can_use",
  signature: { id: ct.string() },
  async run({ message: msg, args, pluginData }) {
    await actualRelease(pluginData, msg, msg.author.id, args.id);
  },
});

export const BattleCmd = economyCmd({
  trigger: ["battle", "fight"],
  usage: "!battle",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualBattle(pluginData, msg, msg.author.id);
  },
});

export const MarryCmd = economyCmd({
  trigger: "marry",
  usage: "!marry <user>",
  permission: "can_use",
  signature: { user: ct.user() },
  async run({ message: msg, args, pluginData }) {
    await actualMarry(pluginData, msg, msg.author.id, args.user.id);
  },
});

export const DivorceCmd = economyCmd({
  trigger: "divorce",
  usage: "!divorce",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualDivorce(pluginData, msg, msg.author.id);
  },
});

export const ClanCreateCmd = economyCmd({
  trigger: ["clancreate", "clan-create"],
  usage: "!clancreate <name> <tag>",
  permission: "can_use",
  signature: { name: ct.string(), tag: ct.string() },
  async run({ message: msg, args, pluginData }) {
    await actualClanCreate(pluginData, msg, msg.author.id, args.name, args.tag);
  },
});

export const ClanJoinCmd = economyCmd({
  trigger: ["clanjoin", "clan-join"],
  usage: "!clanjoin <name>",
  permission: "can_use",
  signature: { name: ct.string({ catchAll: true }) },
  async run({ message: msg, args, pluginData }) {
    await actualClanJoin(pluginData, msg, msg.author.id, args.name);
  },
});

export const ClanLeaveCmd = economyCmd({
  trigger: ["clanleave", "clan-leave"],
  usage: "!clanleave",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualClanLeave(pluginData, msg, msg.author.id);
  },
});

export const ClanInfoCmd = economyCmd({
  trigger: ["clan", "claninfo"],
  usage: "!clan",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualClanInfo(pluginData, msg, msg.author.id);
  },
});

// ── Slash ──────────────────────────────────────────────────

export const BalanceSlashCmd = economySlashCmd({
  name: "balance",
  configPermission: "can_use",
  description: "Check balance",
  allowDms: false,
  signature: [slashOptions.user({ name: "user", description: "User", required: false })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualBalance(pluginData, interaction, options.user?.id ?? interaction.user.id);
  },
});

export const WorkSlashCmd = economySlashCmd({
  name: "work",
  configPermission: "can_use",
  description: "Work for coins",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualWork(pluginData, interaction, interaction.user.id);
  },
});

export const CrimeSlashCmd = economySlashCmd({
  name: "crime",
  configPermission: "can_use",
  description: "Commit a crime",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualCrime(pluginData, interaction, interaction.user.id);
  },
});

export const DailySlashCmd = economySlashCmd({
  name: "daily",
  configPermission: "can_use",
  description: "Claim daily reward",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualDaily(pluginData, interaction, interaction.user.id);
  },
});

export const WeeklySlashCmd = economySlashCmd({
  name: "weekly",
  configPermission: "can_use",
  description: "Claim weekly reward",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualWeekly(pluginData, interaction, interaction.user.id);
  },
});

export const PaySlashCmd = economySlashCmd({
  name: "pay",
  configPermission: "can_use",
  description: "Pay another user",
  allowDms: false,
  signature: [
    slashOptions.user({ name: "user", description: "Recipient", required: true }),
    slashOptions.integer({ name: "amount", description: "Amount", required: true }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualPay(pluginData, interaction, interaction.user.id, options.user.id, options.amount);
  },
});

export const EcoLbSlashCmd = economySlashCmd({
  name: "leaderboard",
  configPermission: "can_use",
  description: "Economy leaderboard",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualEcoLb(pluginData, interaction);
  },
});

export const GambleSlashCmd = economySlashCmd({
  name: "gamble",
  configPermission: "can_use",
  description: "50/50 gamble",
  allowDms: false,
  signature: [slashOptions.integer({ name: "amount", description: "Bet amount", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualGamble(pluginData, interaction, interaction.user.id, options.amount);
  },
});

export const DepositSlashCmd = economySlashCmd({
  name: "deposit",
  configPermission: "can_use",
  description: "Deposit cash to bank",
  allowDms: false,
  signature: [slashOptions.integer({ name: "amount", description: "Amount", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualDeposit(pluginData, interaction, interaction.user.id, options.amount);
  },
});

export const WithdrawSlashCmd = economySlashCmd({
  name: "withdraw",
  configPermission: "can_use",
  description: "Withdraw cash from bank",
  allowDms: false,
  signature: [slashOptions.integer({ name: "amount", description: "Amount", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualWithdraw(pluginData, interaction, interaction.user.id, options.amount);
  },
});

export const BegSlashCmd = economySlashCmd({
  name: "beg",
  configPermission: "can_use",
  description: "Beg for coins",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualBeg(pluginData, interaction, interaction.user.id);
  },
});

export const RobSlashCmd = economySlashCmd({
  name: "rob",
  configPermission: "can_use",
  description: "Rob another user",
  allowDms: false,
  signature: [slashOptions.user({ name: "user", description: "Target", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualRob(pluginData, interaction, interaction.user.id, options.user.id);
  },
});

export const SlotsSlashCmd = economySlashCmd({
  name: "slots",
  configPermission: "can_use",
  description: "Play slots",
  allowDms: false,
  signature: [slashOptions.integer({ name: "amount", description: "Bet", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualSlots(pluginData, interaction, interaction.user.id, options.amount);
  },
});

export const ShopSlashCmd = economySlashCmd({
  name: "shop",
  configPermission: "can_use",
  description: "Browse the shop",
  allowDms: false,
  signature: [slashOptions.string({ name: "category", description: "Category", required: false })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualShop(pluginData, interaction, options.category);
  },
});

export const BuySlashCmd = economySlashCmd({
  name: "buy",
  configPermission: "can_use",
  description: "Buy a shop item",
  allowDms: false,
  signature: [slashOptions.string({ name: "item", description: "Item id", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualBuy(pluginData, interaction, interaction.user.id, options.item);
  },
});

export const InventorySlashCmd = economySlashCmd({
  name: "inventory",
  configPermission: "can_use",
  description: "Show economy inventory",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualInventory(pluginData, interaction, interaction.user.id);
  },
});

export const HuntSlashCmd = economySlashCmd({
  name: "hunt",
  configPermission: "can_use",
  description: "Hunt for creatures",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualHunt(pluginData, interaction, interaction.user.id);
  },
});

export const ZooSlashCmd = economySlashCmd({
  name: "zoo",
  configPermission: "can_use",
  description: "Show your zoo",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualZoo(pluginData, interaction, interaction.user.id);
  },
});

export const BattleSlashCmd = economySlashCmd({
  name: "battle",
  configPermission: "can_use",
  description: "Battle a wild creature",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualBattle(pluginData, interaction, interaction.user.id);
  },
});

export const MarrySlashCmd = economySlashCmd({
  name: "marry",
  configPermission: "can_use",
  description: "Marry another user",
  allowDms: false,
  signature: [slashOptions.user({ name: "user", description: "Partner", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualMarry(pluginData, interaction, interaction.user.id, options.user.id);
  },
});

export const DivorceSlashCmd = economySlashCmd({
  name: "divorce",
  configPermission: "can_use",
  description: "Divorce your partner",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualDivorce(pluginData, interaction, interaction.user.id);
  },
});

export const ClanCreateSlashCmd = economySlashCmd({
  name: "clan_create",
  configPermission: "can_use",
  description: "Create a clan",
  allowDms: false,
  signature: [
    slashOptions.string({ name: "name", description: "Clan name", required: true }),
    slashOptions.string({ name: "tag", description: "Short tag", required: true }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualClanCreate(pluginData, interaction, interaction.user.id, options.name, options.tag);
  },
});

export const ClanJoinSlashCmd = economySlashCmd({
  name: "clan_join",
  configPermission: "can_use",
  description: "Join a clan by name",
  allowDms: false,
  signature: [slashOptions.string({ name: "name", description: "Clan name", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualClanJoin(pluginData, interaction, interaction.user.id, options.name);
  },
});

export const ClanLeaveSlashCmd = economySlashCmd({
  name: "clan_leave",
  configPermission: "can_use",
  description: "Leave your clan",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualClanLeave(pluginData, interaction, interaction.user.id);
  },
});

export const ClanInfoSlashCmd = economySlashCmd({
  name: "clan",
  configPermission: "can_use",
  description: "Show your clan",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualClanInfo(pluginData, interaction, interaction.user.id);
  },
});
