import { GuildPluginData } from "vety";
import { GenericCommandSource } from "../../../pluginUtils.js";
import {
  applyFilterToggle,
  buildFiltersPayload,
  createEmptyFilters,
  formatTrack,
  isLavalinkConfigured,
  loadTracks,
  MUSIC_FILTER_KEYS,
  pingLavalink,
  type LavalinkTrack,
  type MusicFilterKey,
} from "../functions/lavalink.js";
import { destroyLavalinkPlayer, updateLavalinkPlayer } from "../functions/lavalinkNode.js";
import {
  joinVoiceChannel,
  leaveVoiceChannel,
  setVoiceCredentialsListener,
} from "../functions/voiceConnection.js";
import { MusicPluginType } from "../types.js";

async function ensureMusicReady(
  pluginData: GuildPluginData<MusicPluginType>,
  context: GenericCommandSource,
): Promise<boolean> {
  if (!pluginData.config.get().enabled) {
    await pluginData.state.common.sendErrorMessage(context, "Music plugin is disabled.");
    return false;
  }
  if (!isLavalinkConfigured()) {
    await pluginData.state.common.sendErrorMessage(
      context,
      "Music is unavailable: Lavalink is not configured (`LAVALINK_HOST` / `LAVALINK_PASSWORD`).",
    );
    return false;
  }
  const up = await pingLavalink();
  pluginData.state.lavalinkUp = up;
  if (!up) {
    await pluginData.state.common.sendErrorMessage(
      context,
      "Music is unavailable: Lavalink node is down or unreachable. Try again later.",
    );
    return false;
  }
  return true;
}

function botUserId(pluginData: GuildPluginData<MusicPluginType>): string {
  const id = pluginData.client.user?.id;
  if (!id) throw new Error("Bot user is not available.");
  return id;
}

async function ensureVoiceAndLavalink(
  pluginData: GuildPluginData<MusicPluginType>,
  voiceChannelId: string,
): Promise<void> {
  const userId = botUserId(pluginData);
  const guildId = pluginData.guild.id;
  const { credentials, reused } = await joinVoiceChannel(pluginData.guild, voiceChannelId);
  pluginData.state.player.voiceChannelId = voiceChannelId;

  // Keep Lavalink synced if Discord rotates voice endpoint/token mid-session.
  setVoiceCredentialsListener(guildId, (creds) => {
    void updateLavalinkPlayer(guildId, userId, {
      voice: {
        token: creds.token,
        endpoint: creds.endpoint,
        sessionId: creds.sessionId,
      },
    }).catch(() => {});
  });

  // Re-sending voice while already connected restarts playback on many Lavalink nodes.
  if (reused) return;

  // Lavalink v4 has no PlayerConnectedEvent; a successful voice PATCH is sufficient.
  await updateLavalinkPlayer(guildId, userId, {
    voice: {
      token: credentials.token,
      endpoint: credentials.endpoint,
      sessionId: credentials.sessionId,
    },
    volume: pluginData.state.player.volume,
  });
}

async function playCurrentOnNode(pluginData: GuildPluginData<MusicPluginType>): Promise<void> {
  const track = pluginData.state.player.current;
  if (!track) return;
  const userId = botUserId(pluginData);
  const filters = buildFiltersPayload(pluginData.state.player.filters);
  await updateLavalinkPlayer(pluginData.guild.id, userId, {
    track: { encoded: track.encoded },
    volume: pluginData.state.player.volume,
    paused: pluginData.state.player.paused,
    ...(Object.keys(filters).length ? { filters } : {}),
  });
}

function advance(pluginData: GuildPluginData<MusicPluginType>): LavalinkTrack | null {
  const next = pluginData.state.player.queue.shift() ?? null;
  pluginData.state.player.current = next;
  pluginData.state.player.paused = false;
  return next;
}

/** Called from Lavalink TrackEndEvent when a track finishes naturally. */
export async function handleTrackFinished(pluginData: GuildPluginData<MusicPluginType>): Promise<void> {
  const next = advance(pluginData);
  if (next) {
    try {
      await playCurrentOnNode(pluginData);
    } catch {
      // leave queue state; user can skip/stop
    }
    return;
  }
  if (!pluginData.state.player.stay247) {
    try {
      await destroyLavalinkPlayer(pluginData.guild.id, botUserId(pluginData));
    } catch {
      // ignore
    }
    leaveVoiceChannel(pluginData.guild);
    pluginData.state.player.voiceChannelId = null;
  }
}

export async function actualPlay(
  pluginData: GuildPluginData<MusicPluginType>,
  context: GenericCommandSource,
  query: string,
  textChannelId: string | null,
  voiceChannelId: string | null,
): Promise<void> {
  if (!(await ensureMusicReady(pluginData, context))) return;

  if (!voiceChannelId) {
    await pluginData.state.common.sendErrorMessage(
      context,
      "Join a voice channel first, then use play (or use `join`).",
    );
    return;
  }

  const result = await loadTracks(query);
  if (result.error || !result.tracks.length) {
    await pluginData.state.common.sendErrorMessage(
      context,
      result.error ?? "No tracks found for that query.",
    );
    return;
  }

  try {
    await ensureVoiceAndLavalink(pluginData, voiceChannelId);
  } catch (err: any) {
    await pluginData.state.common.sendErrorMessage(
      context,
      `Could not join voice: ${err?.message ?? "unknown error"}`,
    );
    return;
  }

  const player = pluginData.state.player;
  if (textChannelId) player.textChannelId = textChannelId;

  const added = result.tracks;
  if (!player.current) {
    player.current = added[0]!;
    if (added.length > 1) player.queue.push(...added.slice(1));
    try {
      await playCurrentOnNode(pluginData);
    } catch (err: any) {
      player.current = null;
      player.queue = [];
      await pluginData.state.common.sendErrorMessage(
        context,
        `Joined voice but failed to start playback: ${err?.message ?? "unknown error"}`,
      );
      return;
    }
    await pluginData.state.common.sendSuccessMessage(
      context,
      `Now playing ${formatTrack(player.current)}`,
    );
  } else {
    player.queue.push(...added);
    await pluginData.state.common.sendSuccessMessage(
      context,
      `Queued ${added.length === 1 ? formatTrack(added[0]!) : `**${added.length}** tracks`} (position ${player.queue.length}).`,
    );
  }
}

export async function actualJoin(
  pluginData: GuildPluginData<MusicPluginType>,
  context: GenericCommandSource,
  voiceChannelId: string | null,
): Promise<void> {
  if (!(await ensureMusicReady(pluginData, context))) return;
  if (!voiceChannelId) {
    await pluginData.state.common.sendErrorMessage(context, "Join a voice channel first.");
    return;
  }
  try {
    await ensureVoiceAndLavalink(pluginData, voiceChannelId);
  } catch (err: any) {
    await pluginData.state.common.sendErrorMessage(
      context,
      `Could not join voice: ${err?.message ?? "unknown error"}`,
    );
    return;
  }
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Joined <#${voiceChannelId}>.`,
  );
}

export async function actualLeave(
  pluginData: GuildPluginData<MusicPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  if (!(await ensureMusicReady(pluginData, context))) return;
  const player = pluginData.state.player;
  player.current = null;
  player.queue = [];
  player.paused = false;
  player.voiceChannelId = null;
  try {
    await destroyLavalinkPlayer(pluginData.guild.id, botUserId(pluginData));
  } catch {
    // ignore
  }
  setVoiceCredentialsListener(pluginData.guild.id, null);
  leaveVoiceChannel(pluginData.guild);
  await pluginData.state.common.sendSuccessMessage(context, "Left the voice channel.");
}

export async function actualSkip(
  pluginData: GuildPluginData<MusicPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  if (!(await ensureMusicReady(pluginData, context))) return;
  const player = pluginData.state.player;
  if (!player.current && !player.queue.length) {
    await pluginData.state.common.sendErrorMessage(context, "Nothing to skip.");
    return;
  }
  advance(pluginData);
  if (player.current) {
    try {
      await playCurrentOnNode(pluginData);
    } catch (err: any) {
      await pluginData.state.common.sendErrorMessage(
        context,
        `Skipped, but failed to play next: ${err?.message ?? "unknown error"}`,
      );
      return;
    }
    await pluginData.state.common.sendSuccessMessage(context, `Skipped. Now playing ${formatTrack(player.current)}`);
  } else {
    try {
      await updateLavalinkPlayer(pluginData.guild.id, botUserId(pluginData), {
        track: { encoded: null },
      });
    } catch {
      // ignore
    }
    if (!player.stay247) {
      try {
        await destroyLavalinkPlayer(pluginData.guild.id, botUserId(pluginData));
      } catch {
        // ignore
      }
      leaveVoiceChannel(pluginData.guild);
      player.voiceChannelId = null;
    }
    await pluginData.state.common.sendSuccessMessage(context, "Skipped. Queue is empty.");
  }
}

export async function actualQueue(
  pluginData: GuildPluginData<MusicPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  if (!(await ensureMusicReady(pluginData, context))) return;
  const player = pluginData.state.player;
  const lines: string[] = [];
  if (player.current) lines.push(`**Now:** ${formatTrack(player.current)}${player.paused ? " (paused)" : ""}`);
  if (player.queue.length) {
    lines.push(
      ...player.queue.slice(0, 15).map((t, i) => `**${i + 1}.** ${t.info.title}`),
    );
    if (player.queue.length > 15) lines.push(`…and ${player.queue.length - 15} more`);
  }
  await pluginData.state.common.sendSuccessMessage(
    context,
    lines.length ? lines.join("\n") : "Queue is empty.",
  );
}

export async function actualStop(
  pluginData: GuildPluginData<MusicPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  if (!(await ensureMusicReady(pluginData, context))) return;
  const player = pluginData.state.player;
  player.current = null;
  player.queue = [];
  player.paused = false;
  try {
    await updateLavalinkPlayer(pluginData.guild.id, botUserId(pluginData), {
      track: { encoded: null },
    });
  } catch {
    // ignore
  }
  if (!player.stay247) {
    player.voiceChannelId = null;
    try {
      await destroyLavalinkPlayer(pluginData.guild.id, botUserId(pluginData));
    } catch {
      // ignore
    }
    leaveVoiceChannel(pluginData.guild);
  }
  await pluginData.state.common.sendSuccessMessage(
    context,
    player.stay247 ? "Stopped playback (24/7 stay enabled)." : "Stopped and cleared the queue.",
  );
}

export async function actualPause(
  pluginData: GuildPluginData<MusicPluginType>,
  context: GenericCommandSource,
  pause: boolean,
): Promise<void> {
  if (!(await ensureMusicReady(pluginData, context))) return;
  if (!pluginData.state.player.current) {
    await pluginData.state.common.sendErrorMessage(context, "Nothing is playing.");
    return;
  }
  pluginData.state.player.paused = pause;
  try {
    await updateLavalinkPlayer(pluginData.guild.id, botUserId(pluginData), { paused: pause });
  } catch (err: any) {
    await pluginData.state.common.sendErrorMessage(
      context,
      `Failed to ${pause ? "pause" : "resume"}: ${err?.message ?? "unknown error"}`,
    );
    return;
  }
  await pluginData.state.common.sendSuccessMessage(context, pause ? "Paused." : "Resumed.");
}

export async function actualVolume(
  pluginData: GuildPluginData<MusicPluginType>,
  context: GenericCommandSource,
  volume: number,
): Promise<void> {
  if (!(await ensureMusicReady(pluginData, context))) return;
  const v = Math.max(1, Math.min(200, Math.floor(volume)));
  pluginData.state.player.volume = v;
  try {
    await updateLavalinkPlayer(pluginData.guild.id, botUserId(pluginData), { volume: v });
  } catch {
    // local state still updated; node may not have a player yet
  }
  await pluginData.state.common.sendSuccessMessage(context, `Volume set to **${v}%**.`);
}

const FILTER_ALIASES: Record<string, MusicFilterKey | "off"> = {
  off: "off",
  clear: "off",
  none: "off",
  bassboost: "bassboost",
  bass: "bassboost",
  nightcore: "nightcore",
  vaporwave: "vaporwave",
  daycore: "daycore",
  doubletime: "doubletime",
  slowmo: "slowmo",
  slow: "slowmo",
  "8d": "eightD",
  eightd: "eightD",
  karaoke: "karaoke",
  tremolo: "tremolo",
  vibrato: "vibrato",
  soft: "soft",
  pop: "pop",
  treblebass: "treblebass",
  treble: "treblebass",
};

export async function actualFilters(
  pluginData: GuildPluginData<MusicPluginType>,
  context: GenericCommandSource,
  filter: string,
): Promise<void> {
  if (!(await ensureMusicReady(pluginData, context))) return;
  const key = FILTER_ALIASES[filter.toLowerCase()];
  if (!key) {
    await pluginData.state.common.sendErrorMessage(
      context,
      `Unknown filter. Options: \`${MUSIC_FILTER_KEYS.join("`, `")}\`, or \`off\`.`,
    );
    return;
  }

  const f = pluginData.state.player.filters;
  if (key === "off") {
    Object.assign(f, createEmptyFilters());
  } else {
    applyFilterToggle(f, key);
  }

  const payload = buildFiltersPayload(f);
  try {
    await updateLavalinkPlayer(pluginData.guild.id, botUserId(pluginData), {
      filters: payload,
    });
  } catch {
    // ignore if no active player
  }
  const active = MUSIC_FILTER_KEYS.filter((k) => f[k]);
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Filters: ${active.length ? active.join(", ") : "none"}`,
  );
}

export async function actual247(
  pluginData: GuildPluginData<MusicPluginType>,
  context: GenericCommandSource,
  enable?: boolean | null,
): Promise<void> {
  if (!(await ensureMusicReady(pluginData, context))) return;
  const next = enable == null ? !pluginData.state.player.stay247 : enable;
  pluginData.state.player.stay247 = next;
  await pluginData.state.common.sendSuccessMessage(
    context,
    next
      ? "24/7 mode **enabled** — bot stays in voice when the queue ends."
      : "24/7 mode **disabled**.",
  );
}

export async function actualNowPlaying(
  pluginData: GuildPluginData<MusicPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  if (!(await ensureMusicReady(pluginData, context))) return;
  const cur = pluginData.state.player.current;
  if (!cur) {
    await pluginData.state.common.sendErrorMessage(context, "Nothing is playing.");
    return;
  }
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Now playing ${formatTrack(cur)}${pluginData.state.player.paused ? " (paused)" : ""}`,
  );
}
