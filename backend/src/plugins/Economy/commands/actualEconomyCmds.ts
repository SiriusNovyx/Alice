import moment from "moment-timezone";
import { GuildPluginData } from "vety";
import { GenericCommandSource } from "../../../pluginUtils.js";
import {
  DEFAULT_SHOP,
  findShopItem,
  rollCreature,
  ZOO_CAPACITY,
} from "../functions/economyCatalog.js";
import { EconomyPluginType } from "../types.js";

function onCooldown(last: string | null, seconds: number): number {
  if (!last || seconds <= 0) return 0;
  const elapsed = moment.utc().diff(moment.utc(last), "seconds");
  return elapsed >= seconds ? 0 : seconds - elapsed;
}

function roll(min: number, max: number): number {
  return Math.floor(Math.random() * (Math.max(min, max) - Math.min(min, max) + 1)) + Math.min(min, max);
}

function requireEnabled(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
): boolean {
  if (!pluginData.config.get().enabled) {
    void pluginData.state.common.sendErrorMessage(context, "Economy is disabled.");
    return false;
  }
  return true;
}

export async function actualBalance(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  const row = await pluginData.state.profiles.getOrCreate(userId);
  const name = pluginData.config.get().currency_name;
  const married = row.married_to ? ` · married to <@${row.married_to}>` : "";
  await pluginData.state.common.sendSuccessMessage(
    context,
    `<@${userId}> — **${row.cash}** ${name} · bank **${row.bank}**/${row.bank_limit} · gems **${row.gems}**${married}`,
  );
}

export async function actualWork(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.enabled) {
    await pluginData.state.common.sendErrorMessage(context, "Economy is disabled.");
    return;
  }
  const row = await pluginData.state.profiles.getOrCreate(userId);
  const left = onCooldown(row.last_work, config.work_cooldown_seconds);
  if (left > 0) {
    await pluginData.state.common.sendErrorMessage(context, `Work cooldown: **${left}s** remaining.`);
    return;
  }
  const amount = roll(config.work_min, config.work_max);
  await pluginData.state.profiles.addCash(userId, amount, {
    last_work: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
  });
  await pluginData.state.common.sendSuccessMessage(
    context,
    `You worked and earned **${amount}** ${config.currency_name}.`,
  );
}

export async function actualCrime(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.enabled) {
    await pluginData.state.common.sendErrorMessage(context, "Economy is disabled.");
    return;
  }
  const row = await pluginData.state.profiles.getOrCreate(userId);
  const left = onCooldown(row.last_crime, config.crime_cooldown_seconds);
  if (left > 0) {
    await pluginData.state.common.sendErrorMessage(context, `Crime cooldown: **${left}s** remaining.`);
    return;
  }
  const now = moment.utc().format("YYYY-MM-DD HH:mm:ss");
  if (Math.random() < config.crime_fail_chance) {
    const fine = Math.min(Number(row.cash), roll(config.crime_min, config.crime_max));
    await pluginData.state.profiles.addCash(userId, -fine, { last_crime: now });
    await pluginData.state.common.sendErrorMessage(
      context,
      `You got caught and lost **${fine}** ${config.currency_name}.`,
    );
    return;
  }
  const amount = roll(config.crime_min, config.crime_max);
  await pluginData.state.profiles.addCash(userId, amount, { last_crime: now });
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Crime paid off: **${amount}** ${config.currency_name}.`,
  );
}

export async function actualDaily(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.enabled) {
    await pluginData.state.common.sendErrorMessage(context, "Economy is disabled.");
    return;
  }
  const row = await pluginData.state.profiles.getOrCreate(userId);
  const left = onCooldown(row.last_daily, 86400);
  if (left > 0) {
    await pluginData.state.common.sendErrorMessage(context, `Daily already claimed. Wait **${left}s**.`);
    return;
  }
  await pluginData.state.profiles.addCash(userId, config.daily_amount, {
    last_daily: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
  });
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Daily reward: **${config.daily_amount}** ${config.currency_name}.`,
  );
}

export async function actualPay(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  fromId: string,
  toId: string,
  amount: number,
): Promise<void> {
  if (amount <= 0 || fromId === toId) {
    await pluginData.state.common.sendErrorMessage(context, "Invalid payment.");
    return;
  }
  const ok = await pluginData.state.profiles.transfer(fromId, toId, Math.floor(amount));
  if (!ok) {
    await pluginData.state.common.sendErrorMessage(context, "Insufficient funds.");
    return;
  }
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Paid **${Math.floor(amount)}** ${pluginData.config.get().currency_name} to <@${toId}>.`,
  );
}

export async function actualEcoLb(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  const rows = await pluginData.state.profiles.getLeaderboard(10);
  const name = pluginData.config.get().currency_name;
  if (!rows.length) {
    await pluginData.state.common.sendSuccessMessage(context, "No economy data yet.");
    return;
  }
  const lines = rows.map((r, i) => `**#${i + 1}** <@${r.user_id}> — **${r.cash}** ${name}`);
  await pluginData.state.common.sendSuccessMessage(context, lines.join("\n"));
}

export async function actualGamble(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
  amount: number,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.enabled) {
    await pluginData.state.common.sendErrorMessage(context, "Economy is disabled.");
    return;
  }
  const bet = Math.floor(amount);
  if (bet < config.gamble_min) {
    await pluginData.state.common.sendErrorMessage(
      context,
      `Minimum bet is **${config.gamble_min}** ${config.currency_name}.`,
    );
    return;
  }
  const row = await pluginData.state.profiles.getOrCreate(userId);
  const cash = Number(row.cash);
  const maxBet = Math.floor(cash * config.gamble_max_pct);
  if (bet > cash || bet > maxBet) {
    await pluginData.state.common.sendErrorMessage(
      context,
      `You can bet at most **${Math.min(cash, maxBet)}** ${config.currency_name}.`,
    );
    return;
  }
  const win = Math.random() < 0.5;
  if (win) {
    await pluginData.state.profiles.addCash(userId, bet);
    await pluginData.state.common.sendSuccessMessage(
      context,
      `You won **${bet}** ${config.currency_name}!`,
    );
  } else {
    await pluginData.state.profiles.addCash(userId, -bet);
    await pluginData.state.common.sendErrorMessage(
      context,
      `You lost **${bet}** ${config.currency_name}.`,
    );
  }
}

export async function actualDeposit(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
  amount: number,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.enabled) {
    await pluginData.state.common.sendErrorMessage(context, "Economy is disabled.");
    return;
  }
  const n = Math.floor(amount);
  if (n <= 0) {
    await pluginData.state.common.sendErrorMessage(context, "Invalid amount.");
    return;
  }
  const ok = await pluginData.state.profiles.deposit(userId, n);
  if (!ok) {
    await pluginData.state.common.sendErrorMessage(context, "Insufficient cash.");
    return;
  }
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Deposited **${n}** ${config.currency_name} to your bank.`,
  );
}

export async function actualWithdraw(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
  amount: number,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.enabled) {
    await pluginData.state.common.sendErrorMessage(context, "Economy is disabled.");
    return;
  }
  const n = Math.floor(amount);
  if (n <= 0) {
    await pluginData.state.common.sendErrorMessage(context, "Invalid amount.");
    return;
  }
  const ok = await pluginData.state.profiles.withdraw(userId, n);
  if (!ok) {
    await pluginData.state.common.sendErrorMessage(context, "Insufficient bank balance.");
    return;
  }
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Withdrew **${n}** ${config.currency_name} from your bank.`,
  );
}

export async function actualWeekly(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  const config = pluginData.config.get();
  if (!requireEnabled(pluginData, context)) return;
  const row = await pluginData.state.profiles.getOrCreate(userId);
  const left = onCooldown(row.last_weekly, 604800);
  if (left > 0) {
    await pluginData.state.common.sendErrorMessage(context, `Weekly already claimed. Wait **${left}s**.`);
    return;
  }
  await pluginData.state.profiles.addCash(userId, config.weekly_amount, {
    last_weekly: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
  });
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Weekly reward: **${config.weekly_amount}** ${config.currency_name}.`,
  );
}

export async function actualBeg(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  const config = pluginData.config.get();
  if (!requireEnabled(pluginData, context)) return;
  const row = await pluginData.state.profiles.getOrCreate(userId);
  const left = onCooldown(row.last_beg, config.beg_cooldown_seconds);
  if (left > 0) {
    await pluginData.state.common.sendErrorMessage(context, `Beg cooldown: **${left}s**.`);
    return;
  }
  const amount = roll(config.beg_min, config.beg_max);
  await pluginData.state.profiles.addCash(userId, amount, {
    last_beg: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
  });
  await pluginData.state.common.sendSuccessMessage(
    context,
    amount > 0
      ? `Someone took pity on you and gave **${amount}** ${config.currency_name}.`
      : "Nobody gave you anything.",
  );
}

export async function actualRob(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  fromId: string,
  targetId: string,
): Promise<void> {
  const config = pluginData.config.get();
  if (!requireEnabled(pluginData, context)) return;
  if (fromId === targetId) {
    await pluginData.state.common.sendErrorMessage(context, "You cannot rob yourself.");
    return;
  }
  const row = await pluginData.state.profiles.getOrCreate(fromId);
  const left = onCooldown(row.last_rob, config.rob_cooldown_seconds);
  if (left > 0) {
    await pluginData.state.common.sendErrorMessage(context, `Rob cooldown: **${left}s**.`);
    return;
  }
  const target = await pluginData.state.profiles.getOrCreate(targetId);
  const now = moment.utc();
  if (target.rob_protection_until && moment.utc(target.rob_protection_until).isAfter(now)) {
    await pluginData.state.profiles.addCash(fromId, 0, {
      last_rob: now.format("YYYY-MM-DD HH:mm:ss"),
    });
    await pluginData.state.common.sendErrorMessage(context, "Target is protected by a padlock.");
    return;
  }
  const targetCash = Number(target.cash);
  if (targetCash < 50) {
    await pluginData.state.common.sendErrorMessage(context, "Target is too poor to rob.");
    return;
  }
  const stamp = now.format("YYYY-MM-DD HH:mm:ss");
  if (Math.random() > config.rob_success_chance) {
    const fine = Math.min(Number(row.cash), Math.floor(targetCash * 0.1) || 10);
    await pluginData.state.profiles.addCash(fromId, -fine, { last_rob: stamp });
    await pluginData.state.common.sendErrorMessage(
      context,
      `You got caught and paid **${fine}** ${config.currency_name}.`,
    );
    return;
  }
  const stolen = Math.max(1, Math.floor(targetCash * config.rob_max_pct * Math.random()));
  await pluginData.state.profiles.addCash(targetId, -stolen);
  await pluginData.state.profiles.addCash(fromId, stolen, { last_rob: stamp });
  await pluginData.state.common.sendSuccessMessage(
    context,
    `You stole **${stolen}** ${config.currency_name} from <@${targetId}>.`,
  );
}

export async function actualSlots(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
  amount: number,
): Promise<void> {
  const config = pluginData.config.get();
  if (!requireEnabled(pluginData, context)) return;
  const bet = Math.floor(amount);
  if (bet < config.gamble_min) {
    await pluginData.state.common.sendErrorMessage(
      context,
      `Minimum bet is **${config.gamble_min}** ${config.currency_name}.`,
    );
    return;
  }
  const row = await pluginData.state.profiles.getOrCreate(userId);
  const left = onCooldown(row.last_slots, config.slots_cooldown_seconds);
  if (left > 0) {
    await pluginData.state.common.sendErrorMessage(context, `Slots cooldown: **${left}s**.`);
    return;
  }
  if (BigInt(row.cash) < BigInt(bet)) {
    await pluginData.state.common.sendErrorMessage(context, "Insufficient cash.");
    return;
  }
  const symbols = ["🍒", "🍋", "🔔", "⭐", "💎"];
  const a = symbols[Math.floor(Math.random() * symbols.length)]!;
  const b = symbols[Math.floor(Math.random() * symbols.length)]!;
  const c = symbols[Math.floor(Math.random() * symbols.length)]!;
  const stamp = moment.utc().format("YYYY-MM-DD HH:mm:ss");
  let payout = -bet;
  let msg = `${a} | ${b} | ${c}\n`;
  if (a === b && b === c) {
    payout = bet * (a === "💎" ? 10 : 5);
    msg += `Jackpot! You won **${payout}** ${config.currency_name}.`;
  } else if (a === b || b === c || a === c) {
    payout = Math.floor(bet * 1.5);
    msg += `Two match! You won **${payout}** ${config.currency_name}.`;
  } else {
    msg += `You lost **${bet}** ${config.currency_name}.`;
  }
  await pluginData.state.profiles.addCash(userId, payout, { last_slots: stamp });
  if (payout > 0) {
    await pluginData.state.common.sendSuccessMessage(context, msg);
  } else {
    await pluginData.state.common.sendErrorMessage(context, msg);
  }
}

export async function actualShop(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  category?: string | null,
): Promise<void> {
  if (!requireEnabled(pluginData, context)) return;
  if (category) {
    const cat = DEFAULT_SHOP.find(
      (c) => c.name.toLowerCase() === category.toLowerCase() || c.name.toLowerCase().startsWith(category.toLowerCase()),
    );
    if (!cat) {
      await pluginData.state.common.sendErrorMessage(
        context,
        `Unknown category. Try: ${DEFAULT_SHOP.map((c) => c.name).join(", ")}`,
      );
      return;
    }
    const lines = cat.items.map(
      (i) =>
        `${i.emoji} **${i.name}** (\`${i.id}\`) — **${i.price}** ${i.currency}\n${i.description}`,
    );
    await pluginData.state.common.sendSuccessMessage(context, `${cat.emoji} **${cat.name}**\n\n${lines.join("\n\n")}`);
    return;
  }
  const lines = DEFAULT_SHOP.map(
    (c) => `${c.emoji} **${c.name}** — ${c.items.length} item(s)`,
  );
  await pluginData.state.common.sendSuccessMessage(
    context,
    `**Item Shop**\n${lines.join("\n")}\nUse shop with a category, or \`buy <item_id>\`.`,
  );
}

export async function actualBuy(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
  itemId: string,
): Promise<void> {
  if (!requireEnabled(pluginData, context)) return;
  const item = findShopItem(itemId.toLowerCase());
  if (!item) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown item. Browse the shop first.");
    return;
  }
  const row = await pluginData.state.profiles.getOrCreate(userId);
  if (item.currency === "coins") {
    if (BigInt(row.cash) < BigInt(item.price)) {
      await pluginData.state.common.sendErrorMessage(context, "Insufficient cash.");
      return;
    }
    await pluginData.state.profiles.addCash(userId, -item.price);
  } else {
    if (BigInt(row.gems) < BigInt(item.price)) {
      await pluginData.state.common.sendErrorMessage(context, "Insufficient gems.");
      return;
    }
    await pluginData.state.profiles.addGems(userId, -item.price);
  }

  if (item.effect.type === "rob_protection") {
    const until = moment.utc().add(item.effect.duration_seconds, "seconds").format("YYYY-MM-DD HH:mm:ss");
    await pluginData.state.profiles.setRobProtection(userId, until);
    await pluginData.state.common.sendSuccessMessage(
      context,
      `Bought ${item.emoji} **${item.name}**. Rob protection until **${until}** UTC.`,
    );
    return;
  }
  if (item.effect.type === "bank_expansion") {
    await pluginData.state.profiles.expandBank(userId, item.effect.amount);
    await pluginData.state.common.sendSuccessMessage(
      context,
      `Bought ${item.emoji} **${item.name}**. Bank limit +**${item.effect.amount}**.`,
    );
    return;
  }
  await pluginData.state.inventory.add(userId, item.id, 1);
  await pluginData.state.common.sendSuccessMessage(context, `Bought ${item.emoji} **${item.name}** ×1.`);
}

export async function actualInventory(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  if (!requireEnabled(pluginData, context)) return;
  const items = await pluginData.state.inventory.list(userId);
  if (!items.length) {
    await pluginData.state.common.sendSuccessMessage(context, "Inventory empty.");
    return;
  }
  await pluginData.state.common.sendSuccessMessage(
    context,
    items.map((i) => `**${i.item_id}** ×${i.quantity}`).join("\n"),
  );
}

export async function actualHunt(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  const config = pluginData.config.get();
  if (!requireEnabled(pluginData, context)) return;
  const row = await pluginData.state.profiles.getOrCreate(userId);
  const left = onCooldown(row.last_hunt, config.hunt_cooldown_seconds);
  if (left > 0) {
    await pluginData.state.common.sendErrorMessage(context, `Hunt cooldown: **${left}s**.`);
    return;
  }
  const zooCount = await pluginData.state.creatures.count(userId);
  if (zooCount >= ZOO_CAPACITY) {
    await pluginData.state.common.sendErrorMessage(
      context,
      `Zoo full (${zooCount}/${ZOO_CAPACITY}). Release a creature first.`,
    );
    return;
  }
  const { creature, reward, stats } = rollCreature();
  await pluginData.state.creatures.catch(userId, {
    creature_key: creature.id,
    name: creature.name,
    rarity: creature.rarity,
    ...stats,
  });
  await pluginData.state.profiles.addCash(userId, reward, {
    last_hunt: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
  });
  await pluginData.state.common.sendSuccessMessage(
    context,
    `You caught a **${creature.rarity}** ${creature.emoji} **${creature.name}**!\n` +
      `HP ${stats.hp} · ATK ${stats.attack} · DEF ${stats.defense} · SPD ${stats.speed}\n` +
      `+**${reward}** ${config.currency_name} · Zoo ${zooCount + 1}/${ZOO_CAPACITY}`,
  );
}

export async function actualZoo(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  if (!requireEnabled(pluginData, context)) return;
  const list = await pluginData.state.creatures.list(userId);
  if (!list.length) {
    await pluginData.state.common.sendSuccessMessage(context, "Zoo empty. Try `hunt`.");
    return;
  }
  const lines = list.slice(0, 25).map(
    (c) =>
      `\`${c.id.slice(0, 8)}\` ${c.name} (**${c.rarity}**)${c.is_team ? " ★team" : ""} — HP${c.hp}/ATK${c.attack}`,
  );
  await pluginData.state.common.sendSuccessMessage(
    context,
    `**Zoo** (${list.length}/${ZOO_CAPACITY})\n${lines.join("\n")}${list.length > 25 ? "\n…" : ""}`,
  );
}

export async function actualTeamAdd(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
  creatureIdPrefix: string,
): Promise<void> {
  if (!requireEnabled(pluginData, context)) return;
  const list = await pluginData.state.creatures.list(userId);
  const match = list.find((c) => c.id.startsWith(creatureIdPrefix) || c.id === creatureIdPrefix);
  if (!match) {
    await pluginData.state.common.sendErrorMessage(context, "Creature not found. Use the id prefix from `zoo`.");
    return;
  }
  const team = await pluginData.state.creatures.team(userId);
  if (team.length >= 3 && !match.is_team) {
    await pluginData.state.common.sendErrorMessage(context, "Team is full (max 3). Remove one first.");
    return;
  }
  await pluginData.state.creatures.setTeam(userId, match.id, true);
  await pluginData.state.common.sendSuccessMessage(context, `Added **${match.name}** to your battle team.`);
}

export async function actualRelease(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
  creatureIdPrefix: string,
): Promise<void> {
  if (!requireEnabled(pluginData, context)) return;
  const list = await pluginData.state.creatures.list(userId);
  const match = list.find((c) => c.id.startsWith(creatureIdPrefix) || c.id === creatureIdPrefix);
  if (!match) {
    await pluginData.state.common.sendErrorMessage(context, "Creature not found.");
    return;
  }
  await pluginData.state.creatures.release(userId, match.id);
  await pluginData.state.common.sendSuccessMessage(context, `Released **${match.name}**.`);
}

export async function actualBattle(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  const config = pluginData.config.get();
  if (!requireEnabled(pluginData, context)) return;
  const row = await pluginData.state.profiles.getOrCreate(userId);
  const left = onCooldown(row.last_battle, config.battle_cooldown_seconds);
  if (left > 0) {
    await pluginData.state.common.sendErrorMessage(context, `Battle cooldown: **${left}s**.`);
    return;
  }
  let team = await pluginData.state.creatures.team(userId);
  if (!team.length) {
    const zoo = await pluginData.state.creatures.list(userId);
    if (!zoo.length) {
      await pluginData.state.common.sendErrorMessage(context, "Catch creatures with `hunt` first.");
      return;
    }
    team = [zoo[0]!];
  }
  const wild = rollCreature();
  const allyPower = team.reduce((s, c) => s + c.attack + c.defense + c.speed + c.hp / 4, 0);
  const enemyPower = wild.stats.attack + wild.stats.defense + wild.stats.speed + wild.stats.hp / 4;
  const winChance = allyPower / (allyPower + enemyPower);
  const won = Math.random() < winChance;
  const stamp = moment.utc().format("YYYY-MM-DD HH:mm:ss");
  if (won) {
    const reward = roll(config.battle_win_min, config.battle_win_max);
    await pluginData.state.profiles.addCash(userId, reward, { last_battle: stamp });
    await pluginData.state.common.sendSuccessMessage(
      context,
      `Victory vs wild ${wild.creature.emoji} **${wild.creature.name}**!\n+**${reward}** ${config.currency_name}`,
    );
  } else {
    await pluginData.state.profiles.addCash(userId, 0, { last_battle: stamp });
    await pluginData.state.common.sendErrorMessage(
      context,
      `Defeat vs wild ${wild.creature.emoji} **${wild.creature.name}**. Better luck next time.`,
    );
  }
}

export async function actualMarry(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  fromId: string,
  toId: string,
): Promise<void> {
  if (!requireEnabled(pluginData, context)) return;
  if (fromId === toId) {
    await pluginData.state.common.sendErrorMessage(context, "You cannot marry yourself.");
    return;
  }
  const ok = await pluginData.state.marriages.marry(fromId, toId);
  if (!ok) {
    await pluginData.state.common.sendErrorMessage(context, "One of you is already married.");
    return;
  }
  await pluginData.state.profiles.setMarried(fromId, toId);
  await pluginData.state.profiles.setMarried(toId, fromId);
  await pluginData.state.common.sendSuccessMessage(context, `<@${fromId}> and <@${toId}> are now married!`);
}

export async function actualDivorce(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  if (!requireEnabled(pluginData, context)) return;
  const m = await pluginData.state.marriages.findForUser(userId);
  if (!m) {
    await pluginData.state.common.sendErrorMessage(context, "You are not married.");
    return;
  }
  const partner = m.user1_id === userId ? m.user2_id : m.user1_id;
  await pluginData.state.marriages.divorce(userId);
  await pluginData.state.profiles.setMarried(userId, null);
  await pluginData.state.profiles.setMarried(partner, null);
  await pluginData.state.common.sendSuccessMessage(context, `You divorced <@${partner}>.`);
}

export async function actualClanCreate(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
  name: string,
  tag: string,
): Promise<void> {
  if (!requireEnabled(pluginData, context)) return;
  const profile = await pluginData.state.profiles.getOrCreate(userId);
  if (profile.clan_id) {
    await pluginData.state.common.sendErrorMessage(context, "Leave your current clan first.");
    return;
  }
  if (await pluginData.state.clans.findByName(name)) {
    await pluginData.state.common.sendErrorMessage(context, "That clan name is taken.");
    return;
  }
  const clan = await pluginData.state.clans.create(userId, name.slice(0, 32), tag);
  await pluginData.state.profiles.setClan(userId, clan.id);
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Created clan **[${clan.tag}] ${clan.name}**.`,
  );
}

export async function actualClanJoin(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
  name: string,
): Promise<void> {
  if (!requireEnabled(pluginData, context)) return;
  const profile = await pluginData.state.profiles.getOrCreate(userId);
  if (profile.clan_id) {
    await pluginData.state.common.sendErrorMessage(context, "Leave your current clan first.");
    return;
  }
  const clan = await pluginData.state.clans.findByName(name);
  if (!clan) {
    await pluginData.state.common.sendErrorMessage(context, "Clan not found.");
    return;
  }
  const ok = await pluginData.state.clans.join(clan.id, userId);
  if (!ok) {
    await pluginData.state.common.sendErrorMessage(context, "Could not join clan.");
    return;
  }
  await pluginData.state.profiles.setClan(userId, clan.id);
  await pluginData.state.common.sendSuccessMessage(context, `Joined **[${clan.tag}] ${clan.name}**.`);
}

export async function actualClanLeave(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  if (!requireEnabled(pluginData, context)) return;
  const membership = await pluginData.state.clans.findMember(userId);
  if (!membership) {
    await pluginData.state.common.sendErrorMessage(context, "You are not in a clan.");
    return;
  }
  if (membership.role === "owner") {
    await pluginData.state.common.sendErrorMessage(context, "Owners cannot leave. Transfer ownership first (not yet implemented).");
    return;
  }
  await pluginData.state.clans.leave(userId);
  await pluginData.state.profiles.setClan(userId, null);
  await pluginData.state.common.sendSuccessMessage(context, "You left the clan.");
}

export async function actualClanInfo(
  pluginData: GuildPluginData<EconomyPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  if (!requireEnabled(pluginData, context)) return;
  const membership = await pluginData.state.clans.findMember(userId);
  if (!membership) {
    await pluginData.state.common.sendErrorMessage(context, "You are not in a clan.");
    return;
  }
  const clan = await pluginData.state.clans.findById(membership.clan_id);
  if (!clan) {
    await pluginData.state.common.sendErrorMessage(context, "Clan data missing.");
    return;
  }
  const members = await pluginData.state.clans.listMembers(clan.id);
  await pluginData.state.common.sendSuccessMessage(
    context,
    `**[${clan.tag}] ${clan.name}** · Lv.${clan.level} · Bank **${clan.bank}**\n` +
      `Owner <@${clan.owner_id}> · Members: ${members.length}`,
  );
}
