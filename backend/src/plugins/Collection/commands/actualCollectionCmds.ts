import { GuildPluginData } from "vety";
import { GenericCommandSource } from "../../../pluginUtils.js";
import { CollectionPluginType } from "../types.js";

type PoolEntry = { key: string; weight: number; rarity: string };

function getRolls(
  pluginData: GuildPluginData<CollectionPluginType>,
  userId: string,
): { used: number; resetAt: number; left: number } {
  const config = pluginData.config.get();
  const now = Date.now();
  let entry = pluginData.state.rolls.get(userId);
  if (!entry || entry.resetAt <= now) {
    entry = { used: 0, resetAt: now + config.reset_hours * 3600_000 };
    pluginData.state.rolls.set(userId, entry);
  }
  return { ...entry, left: Math.max(0, config.rolls_per_reset - entry.used) };
}

function pickWeighted(pool: PoolEntry[]): PoolEntry {
  const total = pool.reduce((s, p) => s + p.weight, 0);
  let roll = Math.random() * total;
  for (const p of pool) {
    roll -= p.weight;
    if (roll <= 0) return p;
  }
  return pool[pool.length - 1]!;
}

export async function actualPull(
  pluginData: GuildPluginData<CollectionPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.enabled || config.pool.length === 0) {
    await pluginData.state.common.sendErrorMessage(context, "Collection is disabled or pool is empty.");
    return;
  }
  const rolls = getRolls(pluginData, userId);
  if (rolls.left <= 0) {
    const mins = Math.ceil((rolls.resetAt - Date.now()) / 60_000);
    await pluginData.state.common.sendErrorMessage(
      context,
      `No rolls left. Resets in about **${mins}** minute(s).`,
    );
    return;
  }
  const item = pickWeighted(config.pool);
  pluginData.state.rolls.set(userId, { used: rolls.used + 1, resetAt: rolls.resetAt });
  await pluginData.state.inventory.add(userId, item.key);
  await pluginData.state.common.sendSuccessMessage(
    context,
    `You pulled **${item.key}** (**${item.rarity}**)! Rolls left: **${rolls.left - 1}**.`,
  );
}

export async function actualInv(
  pluginData: GuildPluginData<CollectionPluginType>,
  context: GenericCommandSource,
  userId: string,
): Promise<void> {
  const items = await pluginData.state.inventory.list(userId);
  if (!items.length) {
    await pluginData.state.common.sendSuccessMessage(context, "Inventory empty. Try a pull.");
    return;
  }
  await pluginData.state.common.sendSuccessMessage(
    context,
    items.map((i) => `**${i.item_key}** ×${i.quantity}`).join("\n"),
  );
}

export async function actualGive(
  pluginData: GuildPluginData<CollectionPluginType>,
  context: GenericCommandSource,
  fromId: string,
  toId: string,
  itemKey: string,
  qty: number,
): Promise<void> {
  if (!pluginData.config.get().enabled) {
    await pluginData.state.common.sendErrorMessage(context, "Collection is disabled.");
    return;
  }
  if (fromId === toId || qty < 1) {
    await pluginData.state.common.sendErrorMessage(context, "Invalid give.");
    return;
  }
  const ok = await pluginData.state.inventory.transfer(fromId, toId, itemKey, Math.floor(qty));
  if (!ok) {
    await pluginData.state.common.sendErrorMessage(context, "You do not have enough of that item.");
    return;
  }
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Gave **${itemKey}** ×${Math.floor(qty)} to <@${toId}>.`,
  );
}

export async function actualTrade(
  pluginData: GuildPluginData<CollectionPluginType>,
  context: GenericCommandSource,
  userA: string,
  itemA: string,
  userB: string,
  itemB: string,
): Promise<void> {
  if (!pluginData.config.get().enabled) {
    await pluginData.state.common.sendErrorMessage(context, "Collection is disabled.");
    return;
  }
  const aHas = await pluginData.state.inventory.get(userA, itemA);
  const bHas = await pluginData.state.inventory.get(userB, itemB);
  if (!aHas || aHas.quantity < 1 || !bHas || bHas.quantity < 1) {
    await pluginData.state.common.sendErrorMessage(context, "Both sides must own the listed items.");
    return;
  }
  await pluginData.state.inventory.remove(userA, itemA, 1);
  await pluginData.state.inventory.remove(userB, itemB, 1);
  await pluginData.state.inventory.add(userA, itemB, 1);
  await pluginData.state.inventory.add(userB, itemA, 1);
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Trade complete: <@${userA}> **${itemA}** ↔ <@${userB}> **${itemB}**.`,
  );
}
