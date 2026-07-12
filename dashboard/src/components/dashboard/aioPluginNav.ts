/**
 * Catalog of AIO plugins for dashboard / docs navigation.
 * YAML remains the source of truth — these pages link to setup guides + the config editor.
 */
export type AioPluginPhase = 1 | 2 | 3 | 4;

export interface AioPluginNavItem {
  id: string;
  name: string;
  phase: AioPluginPhase;
  pluginKey: string;
  docsPath: string;
  setupPath: string;
  summary: string;
}

export const AIO_PLUGIN_NAV: AioPluginNavItem[] = [
  {
    id: "voicemaster",
    name: "VoiceMaster",
    phase: 1,
    pluginKey: "voicemaster",
    docsPath: "/docs/plugins/voicemaster",
    setupPath: "/docs/setup-guides/voicemaster",
    summary: "Join-to-create temporary voice channels",
  },
  {
    id: "tickets",
    name: "Tickets",
    phase: 1,
    pluginKey: "tickets",
    docsPath: "/docs/plugins/tickets",
    setupPath: "/docs/setup-guides/tickets",
    summary: "Panels, claim/close, HTML transcripts",
  },
  {
    id: "giveaways",
    name: "Giveaways",
    phase: 1,
    pluginKey: "giveaways",
    docsPath: "/docs/plugins/giveaways",
    setupPath: "/docs/setup-guides/giveaways",
    summary: "Timed giveaways with button entry",
  },
  {
    id: "leveling",
    name: "Leveling",
    phase: 2,
    pluginKey: "leveling",
    docsPath: "/docs/plugins/leveling",
    setupPath: "/docs/setup-guides/leveling",
    summary: "XP, rewards, leaderboard",
  },
  {
    id: "verify",
    name: "Verify",
    phase: 2,
    pluginKey: "verify",
    docsPath: "/docs/plugins/verify",
    setupPath: "/docs/setup-guides/verify",
    summary: "Button / captcha gate",
  },
  {
    id: "fun-social",
    name: "Fun & Social",
    phase: 2,
    pluginKey: "fun",
    docsPath: "/docs/plugins/fun",
    setupPath: "/docs/setup-guides/fun-social",
    summary: "Light fun and social commands",
  },
  {
    id: "modmail",
    name: "Modmail",
    phase: 3,
    pluginKey: "modmail",
    docsPath: "/docs/plugins/modmail",
    setupPath: "/docs/setup-guides/modmail",
    summary: "DM ↔ staff thread with transcripts",
  },
  {
    id: "antinuke",
    name: "AntiNuke",
    phase: 3,
    pluginKey: "antinuke",
    docsPath: "/docs/plugins/antinuke",
    setupPath: "/docs/setup-guides/antinuke",
    summary: "Audit-log rate limits & quarantine",
  },
  {
    id: "economy",
    name: "Economy",
    phase: 4,
    pluginKey: "economy",
    docsPath: "/docs/plugins/economy",
    setupPath: "/docs/setup-guides/economy",
    summary: "Work / crime / daily / gamble / bank",
  },
  {
    id: "music",
    name: "Music",
    phase: 4,
    pluginKey: "music",
    docsPath: "/docs/plugins/music",
    setupPath: "/docs/setup-guides/music",
    summary: "Lavalink playback (fails soft if unset)",
  },
  {
    id: "collection-nsfw-booster",
    name: "Collection / Nsfw / BoosterRoles",
    phase: 4,
    pluginKey: "collection",
    docsPath: "/docs/plugins/collection",
    setupPath: "/docs/setup-guides/collection-nsfw-booster",
    summary: "Gacha, NSFW gate, booster color roles",
  },
];
