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
};

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
    filters: { bassboost: false, nightcore: false, vaporwave: false },
  };
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

/** Build Lavalink v4 filters payload from local toggle state. */
export function buildFiltersPayload(filters: MusicFilters): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (filters.bassboost) {
    payload.equalizer = [
      { band: 0, gain: 0.6 },
      { band: 1, gain: 0.45 },
      { band: 2, gain: 0.25 },
    ];
  }
  if (filters.nightcore) {
    payload.timescale = { speed: 1.2, pitch: 1.2, rate: 1 };
  }
  if (filters.vaporwave) {
    payload.timescale = { speed: 0.85, pitch: 0.85, rate: 1 };
    payload.equalizer = [
      { band: 0, gain: 0.3 },
      { band: 1, gain: 0.2 },
    ];
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
