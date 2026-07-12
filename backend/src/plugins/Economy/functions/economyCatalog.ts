/** Default shop catalog — Vermeil-inspired, coin prices scaled for guild play. */
export type ShopItem = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: number;
  currency: "coins" | "gems";
  effect:
    | { type: "rob_protection"; duration_seconds: number }
    | { type: "bank_expansion"; amount: number }
    | { type: "consumable" };
};

export type ShopCategory = {
  name: string;
  emoji: string;
  items: ShopItem[];
};

export const DEFAULT_SHOP: ShopCategory[] = [
  {
    name: "Protection",
    emoji: "🛡️",
    items: [
      {
        id: "padlock",
        name: "Padlock",
        emoji: "🔒",
        description: "Protects your wallet from robberies for 1 hour.",
        price: 5000,
        currency: "coins",
        effect: { type: "rob_protection", duration_seconds: 3600 },
      },
      {
        id: "vault_lock",
        name: "Vault Lock",
        emoji: "🔐",
        description: "Protects your wallet from robberies for 24 hours.",
        price: 20000,
        currency: "coins",
        effect: { type: "rob_protection", duration_seconds: 86400 },
      },
    ],
  },
  {
    name: "Bank",
    emoji: "🏦",
    items: [
      {
        id: "banknote",
        name: "Banknote",
        emoji: "💵",
        description: "Expands bank limit by 50,000 coins.",
        price: 2500,
        currency: "coins",
        effect: { type: "bank_expansion", amount: 50000 },
      },
    ],
  },
  {
    name: "Misc",
    emoji: "📦",
    items: [
      {
        id: "lucky_charm",
        name: "Lucky Charm",
        emoji: "🍀",
        description: "A collectible charm (no combat effect yet).",
        price: 1000,
        currency: "coins",
        effect: { type: "consumable" },
      },
    ],
  },
];

export function findShopItem(itemId: string): ShopItem | null {
  for (const cat of DEFAULT_SHOP) {
    const item = cat.items.find((i) => i.id === itemId);
    if (item) return item;
  }
  return null;
}

export type HuntCreature = {
  id: string;
  name: string;
  emoji: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
};

export const HUNT_RARITIES: Array<{
  name: HuntCreature["rarity"];
  chance: number;
  coinReward: { min: number; max: number };
}> = [
  { name: "common", chance: 55, coinReward: { min: 50, max: 150 } },
  { name: "uncommon", chance: 25, coinReward: { min: 150, max: 350 } },
  { name: "rare", chance: 12, coinReward: { min: 350, max: 700 } },
  { name: "epic", chance: 6, coinReward: { min: 700, max: 1500 } },
  { name: "legendary", chance: 2, coinReward: { min: 1500, max: 4000 } },
];

export const HUNT_CREATURES: HuntCreature[] = [
  { id: "rabbit", name: "Rabbit", emoji: "🐰", rarity: "common" },
  { id: "squirrel", name: "Squirrel", emoji: "🐿️", rarity: "common" },
  { id: "chicken", name: "Chicken", emoji: "🐔", rarity: "common" },
  { id: "frog", name: "Frog", emoji: "🐸", rarity: "common" },
  { id: "fox", name: "Fox", emoji: "🦊", rarity: "uncommon" },
  { id: "deer", name: "Deer", emoji: "🦌", rarity: "uncommon" },
  { id: "owl", name: "Owl", emoji: "🦉", rarity: "uncommon" },
  { id: "wolf", name: "Wolf", emoji: "🐺", rarity: "rare" },
  { id: "bear", name: "Bear", emoji: "🐻", rarity: "rare" },
  { id: "shark", name: "Shark", emoji: "🦈", rarity: "rare" },
  { id: "lion", name: "Lion", emoji: "🦁", rarity: "epic" },
  { id: "tiger", name: "Tiger", emoji: "🐯", rarity: "epic" },
  { id: "dragon", name: "Dragon", emoji: "🐉", rarity: "legendary" },
  { id: "unicorn", name: "Unicorn", emoji: "🦄", rarity: "legendary" },
  { id: "phoenix", name: "Phoenix", emoji: "🔥", rarity: "legendary" },
];

export const ZOO_CAPACITY = 50;

export function rollCreature(): { creature: HuntCreature; reward: number; stats: { hp: number; attack: number; defense: number; speed: number } } {
  const roll = Math.random() * 100;
  let acc = 0;
  let rarity = HUNT_RARITIES[0]!;
  for (const r of HUNT_RARITIES) {
    acc += r.chance;
    if (roll <= acc) {
      rarity = r;
      break;
    }
  }
  const pool = HUNT_CREATURES.filter((c) => c.rarity === rarity.name);
  const creature = pool[Math.floor(Math.random() * pool.length)] ?? HUNT_CREATURES[0]!;
  const reward =
    Math.floor(Math.random() * (rarity.coinReward.max - rarity.coinReward.min + 1)) + rarity.coinReward.min;
  const mult =
    rarity.name === "legendary" ? 5 : rarity.name === "epic" ? 3.5 : rarity.name === "rare" ? 2.5 : rarity.name === "uncommon" ? 1.5 : 1;
  const stats = {
    hp: Math.floor(40 + Math.random() * 40 * mult),
    attack: Math.floor(8 + Math.random() * 12 * mult),
    defense: Math.floor(8 + Math.random() * 12 * mult),
    speed: Math.floor(8 + Math.random() * 12 * mult),
  };
  return { creature, reward, stats };
}
