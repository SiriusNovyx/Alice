import { env } from "../../../env.js";

export type LavalinkTrackInfo = {
  identifier: string;
  title: string;
  author: string;
  length: number;
  uri: string | null;
  isStream: boolean;
};

export type LavalinkTrack = {
  encoded: string;
  info: LavalinkTrackInfo;
};

export type LoadResult = {
  loadType: string;
  data?: unknown;
  tracks: LavalinkTrack[];
  error?: string;
};

export type MusicFilters = {
  bassboost: boolean;
  nightcore: boolean;
  vaporwave: boolean;
  daycore: boolean;
  doubletime: boolean;
  slowmo: boolean;
  eightD: boolean;
  karaoke: boolean;
  tremolo: boolean;
  vibrato: boolean;
  soft: boolean;
  pop: boolean;
  treblebass: boolean;
};

export const MUSIC_FILTER_KEYS = [
  "bassboost",
  "nightcore",
  "vaporwave",
  "daycore",
  "doubletime",
  "slowmo",
  "eightD",
  "karaoke",
  "tremolo",
  "vibrato",
  "soft",
  "pop",
  "treblebass",
] as const satisfies ReadonlyArray<keyof MusicFilters>;

export type MusicFilterKey = (typeof MUSIC_FILTER_KEYS)[number];

const TIMESCALE_FILTERS: ReadonlyArray<MusicFilterKey> = [
  "nightcore",
  "vaporwave",
  "daycore",
  "doubletime",
  "slowmo",
];

const EQUALIZER_FILTERS: ReadonlyArray<MusicFilterKey> = [
  "bassboost",
  "vaporwave",
  "pop",
  "treblebass",
];

export function createEmptyFilters(): MusicFilters {
  return {
    bassboost: false,
    nightcore: false,
    vaporwave: false,
    daycore: false,
    doubletime: false,
    slowmo: false,
    eightD: false,
    karaoke: false,
    tremolo: false,
    vibrato: false,
    soft: false,
    pop: false,
    treblebass: false,
  };
}

export type GuildMusicQueueState = {
  queue: LavalinkTrack[];
  current: LavalinkTrack | null;
  volume: number;
  paused: boolean;
  stay247: boolean;
  textChannelId: string | null;
  voiceChannelId: string | null;
  filters: MusicFilters;
};

export function createEmptyQueueState(): GuildMusicQueueState {
  return {
    queue: [],
    current: null,
    volume: 100,
    paused: false,
    stay247: false,
    textChannelId: null,
    voiceChannelId: null,
    filters: createEmptyFilters(),
  };
}

/** Clear exclusive groups when enabling a timescale/eq preset. */
export function applyFilterToggle(filters: MusicFilters, key: MusicFilterKey): void {
  const enabling = !filters[key];
  if (enabling) {
    if (TIMESCALE_FILTERS.includes(key)) {
      for (const k of TIMESCALE_FILTERS) filters[k] = false;
    }
    if (EQUALIZER_FILTERS.includes(key)) {
      for (const k of EQUALIZER_FILTERS) filters[k] = false;
    }
  }
  filters[key] = enabling;
}

export function getLavalinkConfig(): { host: string; port: number; password: string } | null {
  const host = env.LAVALINK_HOST;
  const password = env.LAVALINK_PASSWORD;
  if (!host || !password) return null;
  const port = env.LAVALINK_PORT ?? 2333;
  return { host, port, password };
}

export function isLavalinkConfigured(): boolean {
  return getLavalinkConfig() !== null;
}

function baseUrl(cfg: { host: string; port: number }): string {
  const host = cfg.host.replace(/^https?:\/\//, "");
  return `http://${host}:${cfg.port}`;
}

export async function pingLavalink(): Promise<boolean> {
  const cfg = getLavalinkConfig();
  if (!cfg) return false;
  try {
    const res = await fetch(`${baseUrl(cfg)}/v4/info`, {
      headers: { Authorization: cfg.password },
      signal: AbortSignal.timeout(4000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function parseTrack(raw: any): LavalinkTrack | null {
  if (!raw?.encoded || !raw?.info) return null;
  return {
    encoded: raw.encoded,
    info: {
      identifier: String(raw.info.identifier ?? ""),
      title: String(raw.info.title ?? "Unknown"),
      author: String(raw.info.author ?? "Unknown"),
      length: Number(raw.info.length ?? 0),
      uri: raw.info.uri ?? null,
      isStream: Boolean(raw.info.isStream),
    },
  };
}

export async function loadTracks(query: string): Promise<LoadResult> {
  const cfg = getLavalinkConfig();
  if (!cfg) {
    return { loadType: "error", tracks: [], error: "Lavalink is not configured." };
  }
  const identifier = /^(https?:\/\/|ytsearch:|scsearch:)/i.test(query) ? query : `ytsearch:${query}`;
  try {
    const url = `${baseUrl(cfg)}/v4/loadtracks?identifier=${encodeURIComponent(identifier)}`;
    const res = await fetch(url, {
      headers: { Authorization: cfg.password },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      return { loadType: "error", tracks: [], error: `Lavalink HTTP ${res.status}` };
    }
    const body: any = await res.json();
    const loadType = String(body.loadType ?? "empty");
    const tracks: LavalinkTrack[] = [];

    if (loadType === "track" && body.data) {
      const t = parseTrack(body.data);
      if (t) tracks.push(t);
    } else if (loadType === "search" && Array.isArray(body.data)) {
      for (const row of body.data.slice(0, 1)) {
        const t = parseTrack(row);
        if (t) tracks.push(t);
      }
    } else if (loadType === "playlist" && body.data?.tracks) {
      for (const row of body.data.tracks.slice(0, 50)) {
        const t = parseTrack(row);
        if (t) tracks.push(t);
      }
    } else if (loadType === "error") {
      return {
        loadType,
        tracks: [],
        error: body.data?.message ?? "Lavalink load error",
      };
    }

    return { loadType, tracks, data: body.data };
  } catch (err: any) {
    return {
      loadType: "error",
      tracks: [],
      error: err?.message ?? "Failed to reach Lavalink",
    };
  }
}

/** Build Lavalink v4 filters payload from local toggle state. Null clears inactive filters. */
export function buildFiltersPayload(filters: MusicFilters): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    equalizer: null,
    timescale: null,
    rotation: null,
    karaoke: null,
    tremolo: null,
    vibrato: null,
    lowPass: null,
  };

  if (filters.bassboost) {
    payload.equalizer = [
      { band: 0, gain: 0.6 },
      { band: 1, gain: 0.45 },
      { band: 2, gain: 0.25 },
    ];
  } else if (filters.pop) {
    payload.equalizer = [
      { band: 0, gain: -0.25 },
      { band: 1, gain: 0.48 },
      { band: 2, gain: 0.59 },
      { band: 3, gain: 0.72 },
      { band: 4, gain: 0.56 },
      { band: 5, gain: 0.22 },
      { band: 6, gain: -0.18 },
      { band: 7, gain: -0.24 },
      { band: 8, gain: -0.26 },
      { band: 9, gain: -0.16 },
      { band: 10, gain: -0.16 },
      { band: 11, gain: 0 },
      { band: 12, gain: 0 },
      { band: 13, gain: 0 },
      { band: 14, gain: 0 },
    ];
  } else if (filters.treblebass) {
    payload.equalizer = [
      { band: 0, gain: 0.6 },
      { band: 1, gain: 0.67 },
      { band: 2, gain: 0.67 },
      { band: 3, gain: 0 },
      { band: 4, gain: -0.5 },
      { band: 5, gain: 0.15 },
      { band: 6, gain: -0.45 },
      { band: 7, gain: 0.23 },
      { band: 8, gain: 0.35 },
      { band: 9, gain: 0.45 },
      { band: 10, gain: 0.55 },
      { band: 11, gain: 0.6 },
      { band: 12, gain: 0.55 },
      { band: 13, gain: 0 },
      { band: 14, gain: 0 },
    ];
  } else if (filters.vaporwave) {
    payload.equalizer = [
      { band: 0, gain: 0.3 },
      { band: 1, gain: 0.2 },
    ];
  }

  if (filters.nightcore) {
    payload.timescale = { speed: 1.2, pitch: 1.2, rate: 1 };
  } else if (filters.vaporwave) {
    payload.timescale = { speed: 0.85, pitch: 0.85, rate: 1 };
  } else if (filters.daycore) {
    payload.timescale = { speed: 0.8, pitch: 0.8, rate: 1 };
  } else if (filters.doubletime) {
    payload.timescale = { speed: 1.5, pitch: 1, rate: 1 };
  } else if (filters.slowmo) {
    payload.timescale = { speed: 0.7, pitch: 1, rate: 1 };
  }

  if (filters.eightD) {
    payload.rotation = { rotationHz: 0.2 };
  }
  if (filters.karaoke) {
    payload.karaoke = {
      level: 1.0,
      monoLevel: 1.0,
      filterBand: 220.0,
      filterWidth: 100.0,
    };
  }
  if (filters.tremolo) {
    payload.tremolo = { frequency: 4.0, depth: 0.75 };
  }
  if (filters.vibrato) {
    payload.vibrato = { frequency: 4.0, depth: 0.75 };
  }
  if (filters.soft) {
    payload.lowPass = { smoothing: 20.0 };
  }

  return payload;
}

export function formatTrack(t: LavalinkTrack): string {
  const mins = Math.floor(t.info.length / 60000);
  const secs = Math.floor((t.info.length % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  const dur = t.info.isStream ? "LIVE" : `${mins}:${secs}`;
  return `**${t.info.title}** by ${t.info.author} (${dur})`;
}
