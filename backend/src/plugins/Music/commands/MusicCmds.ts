import { slashOptions } from "vety";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { musicCmd, musicSlashCmd } from "../types.js";
import {
  actual247,
  actualFilters,
  actualJoin,
  actualLeave,
  actualNowPlaying,
  actualPause,
  actualPlay,
  actualQueue,
  actualSkip,
  actualStop,
  actualVolume,
} from "./actualMusicCmds.js";

function voiceChannelId(member: { voice?: { channelId: string | null } } | null | undefined): string | null {
  return member?.voice?.channelId ?? null;
}

export const PlayCmd = musicCmd({
  trigger: ["play", "p"],
  usage: "!play <query>",
  permission: "can_use",
  signature: { query: ct.string({ catchAll: true }) },
  async run({ message: msg, args, pluginData }) {
    await actualPlay(
      pluginData,
      msg,
      args.query,
      msg.channel.id,
      voiceChannelId(msg.member),
    );
  },
});

export const SkipCmd = musicCmd({
  trigger: "skip",
  usage: "!skip",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualSkip(pluginData, msg);
  },
});

export const QueueCmd = musicCmd({
  trigger: "queue",
  usage: "!queue",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualQueue(pluginData, msg);
  },
});

export const StopCmd = musicCmd({
  trigger: "stop",
  usage: "!stop",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualStop(pluginData, msg);
  },
});

export const JoinCmd = musicCmd({
  trigger: "join",
  usage: "!join",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualJoin(pluginData, msg, voiceChannelId(msg.member));
  },
});

export const LeaveCmd = musicCmd({
  trigger: "leave",
  usage: "!leave",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualLeave(pluginData, msg);
  },
});

export const PauseCmd = musicCmd({
  trigger: "pause",
  usage: "!pause",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualPause(pluginData, msg, true);
  },
});

export const ResumeCmd = musicCmd({
  trigger: "resume",
  usage: "!resume",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualPause(pluginData, msg, false);
  },
});

export const VolumeCmd = musicCmd({
  trigger: ["volume", "vol"],
  usage: "!volume <1-200>",
  permission: "can_use",
  signature: { volume: ct.number() },
  async run({ message: msg, args, pluginData }) {
    await actualVolume(pluginData, msg, args.volume);
  },
});

export const FiltersCmd = musicCmd({
  trigger: ["filter", "filters"],
  usage: "!filter <bassboost|nightcore|vaporwave|daycore|doubletime|slowmo|8d|karaoke|tremolo|vibrato|soft|pop|treblebass|off>",
  permission: "can_use",
  signature: { filter: ct.string() },
  async run({ message: msg, args, pluginData }) {
    await actualFilters(pluginData, msg, args.filter);
  },
});

export const Stay247Cmd = musicCmd({
  trigger: ["247", "stay247"],
  usage: "!247 [on|off]",
  permission: "can_use",
  signature: { mode: ct.string({ required: false }) },
  async run({ message: msg, args, pluginData }) {
    const m = args.mode?.toLowerCase();
    const enable = m === "on" || m === "true" ? true : m === "off" || m === "false" ? false : null;
    await actual247(pluginData, msg, enable);
  },
});

export const NowPlayingCmd = musicCmd({
  trigger: ["nowplaying", "np"],
  usage: "!np",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualNowPlaying(pluginData, msg);
  },
});

export const PlaySlashCmd = musicSlashCmd({
  name: "play",
  configPermission: "can_use",
  description: "Play or queue a track",
  allowDms: false,
  signature: [slashOptions.string({ name: "query", description: "Search or URL", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    const member = await pluginData.guild.members.fetch(interaction.user.id).catch(() => null);
    await actualPlay(
      pluginData,
      interaction,
      options.query,
      interaction.channelId,
      voiceChannelId(member),
    );
  },
});

export const SkipSlashCmd = musicSlashCmd({
  name: "skip",
  configPermission: "can_use",
  description: "Skip current track",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualSkip(pluginData, interaction);
  },
});

export const QueueSlashCmd = musicSlashCmd({
  name: "queue",
  configPermission: "can_use",
  description: "Show queue",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualQueue(pluginData, interaction);
  },
});

export const StopSlashCmd = musicSlashCmd({
  name: "stop",
  configPermission: "can_use",
  description: "Stop playback",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualStop(pluginData, interaction);
  },
});

export const JoinSlashCmd = musicSlashCmd({
  name: "join",
  configPermission: "can_use",
  description: "Join your voice channel",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    const member = await pluginData.guild.members.fetch(interaction.user.id).catch(() => null);
    await actualJoin(pluginData, interaction, voiceChannelId(member));
  },
});

export const LeaveSlashCmd = musicSlashCmd({
  name: "leave",
  configPermission: "can_use",
  description: "Leave the voice channel",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualLeave(pluginData, interaction);
  },
});

export const PauseSlashCmd = musicSlashCmd({
  name: "pause",
  configPermission: "can_use",
  description: "Pause playback",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualPause(pluginData, interaction, true);
  },
});

export const ResumeSlashCmd = musicSlashCmd({
  name: "resume",
  configPermission: "can_use",
  description: "Resume playback",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualPause(pluginData, interaction, false);
  },
});

export const VolumeSlashCmd = musicSlashCmd({
  name: "volume",
  configPermission: "can_use",
  description: "Set volume 1-200",
  allowDms: false,
  signature: [slashOptions.integer({ name: "level", description: "Volume", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualVolume(pluginData, interaction, options.level);
  },
});

export const FiltersSlashCmd = musicSlashCmd({
  name: "filter",
  configPermission: "can_use",
  description: "Toggle an audio filter preset",
  allowDms: false,
  signature: [
    slashOptions.string({
      name: "options",
      description: "Filter option to toggle",
      required: true,
      choices: [
        { name: "Off (clear all)", value: "off" },
        { name: "Bassboost", value: "bassboost" },
        { name: "Nightcore", value: "nightcore" },
        { name: "Vaporwave", value: "vaporwave" },
        { name: "Daycore", value: "daycore" },
        { name: "Doubletime", value: "doubletime" },
        { name: "Slowmo", value: "slowmo" },
        { name: "8D", value: "8d" },
        { name: "Karaoke", value: "karaoke" },
        { name: "Tremolo", value: "tremolo" },
        { name: "Vibrato", value: "vibrato" },
        { name: "Soft", value: "soft" },
        { name: "Pop", value: "pop" },
        { name: "Treblebass", value: "treblebass" },
      ],
    }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualFilters(pluginData, interaction, options.options);
  },
});

export const Stay247SlashCmd = musicSlashCmd({
  name: "stay247",
  configPermission: "can_use",
  description: "Toggle 24/7 stay-in-voice",
  allowDms: false,
  signature: [slashOptions.boolean({ name: "enabled", description: "Enable 24/7", required: false })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actual247(pluginData, interaction, options.enabled ?? null);
  },
});

export const NowPlayingSlashCmd = musicSlashCmd({
  name: "np",
  configPermission: "can_use",
  description: "Show now playing",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualNowPlaying(pluginData, interaction);
  },
});
