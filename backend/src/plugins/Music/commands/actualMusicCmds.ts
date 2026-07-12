import { GuildPluginData } from "vety";
import { GenericCommandSource } from "../../../pluginUtils.js";
import {
  buildFiltersPayload,
  formatTrack,
  isLavalinkConfigured,
  loadTracks,
  pingLavalink,
} from "../functions/lavalink.js";
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

function advance(pluginData: GuildPluginData<MusicPluginType>): void {
  const next = pluginData.state.player.queue.shift() ?? null;
  pluginData.state.player.current = next;
  pluginData.state.player.paused = false;
}

export async function actualPlay(
  pluginData: GuildPluginData<MusicPluginType>,
  context: GenericCommandSource,
  query: string,
  textChannelId: string | null,
  voiceChannelId: string | null,
): Promise<void> {
  if (!(await ensureMusicReady(pluginData, context))) return;

  const result = await loadTracks(query);
  if (result.error || !result.tracks.length) {
    await pluginData.state.common.sendErrorMessage(
      context,
      result.error ?? "No tracks found for that query.",
    );
    return;
  }

  const player = pluginData.state.player;
  if (textChannelId) player.textChannelId = textChannelId;
  if (voiceChannelId) player.voiceChannelId = voiceChannelId;

  const added = result.tracks;
  if (!player.current) {
    player.current = added[0]!;
    if (added.length > 1) player.queue.push(...added.slice(1));
    await pluginData.state.common.sendSuccessMessage(
      context,
      `Now playing ${formatTrack(player.current)}` +
        (voiceChannelId
          ? "\n_(Audio transport requires a Lavalink session + voice gateway; queue/metadata are live.)_"
          : "\nJoin a voice channel so the bot can attach when a voice client is wired."),
    );
  } else {
    player.queue.push(...added);
    await pluginData.state.common.sendSuccessMessage(
      context,
      `Queued ${added.length === 1 ? formatTrack(added[0]!) : `**${added.length}** tracks`} (position ${player.queue.length}).`,
    );
  }
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
    await pluginData.state.common.sendSuccessMessage(context, `Skipped. Now playing ${formatTrack(player.current)}`);
  } else {
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
  if (!player.stay247) {
    player.current = null;
    player.queue = [];
    player.paused = false;
    player.voiceChannelId = null;
  } else {
    player.current = null;
    player.queue = [];
    player.paused = false;
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
  await pluginData.state.common.sendSuccessMessage(context, `Volume set to **${v}%**.`);
}

export async function actualFilters(
  pluginData: GuildPluginData<MusicPluginType>,
  context: GenericCommandSource,
  filter: string,
): Promise<void> {
  if (!(await ensureMusicReady(pluginData, context))) return;
  const key = filter.toLowerCase();
  const f = pluginData.state.player.filters;
  if (key === "off" || key === "clear" || key === "none") {
    f.bassboost = false;
    f.nightcore = false;
    f.vaporwave = false;
  } else if (key === "bassboost" || key === "bass") {
    f.bassboost = !f.bassboost;
  } else if (key === "nightcore") {
    f.nightcore = !f.nightcore;
    if (f.nightcore) f.vaporwave = false;
  } else if (key === "vaporwave") {
    f.vaporwave = !f.vaporwave;
    if (f.vaporwave) f.nightcore = false;
  } else {
    await pluginData.state.common.sendErrorMessage(
      context,
      "Unknown filter. Use `bassboost`, `nightcore`, `vaporwave`, or `off`.",
    );
    return;
  }
  const payload = buildFiltersPayload(f);
  const active = Object.entries(f)
    .filter(([, on]) => on)
    .map(([k]) => k);
  await pluginData.state.common.sendSuccessMessage(
    context,
    `Filters: ${active.length ? active.join(", ") : "none"}` +
      (Object.keys(payload).length ? ` _(payload ready for Lavalink player update)_` : ""),
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
      ? "24/7 mode **enabled** — bot will keep the voice session when the queue ends (when voice client is attached)."
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
