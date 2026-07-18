import { guildPlugin } from "vety";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import {
  FiltersCmd,
  FiltersSlashCmd,
  JoinCmd,
  JoinSlashCmd,
  LeaveCmd,
  LeaveSlashCmd,
  NowPlayingCmd,
  NowPlayingSlashCmd,
  PauseCmd,
  PauseSlashCmd,
  PlayCmd,
  PlaySlashCmd,
  QueueCmd,
  QueueSlashCmd,
  ResumeCmd,
  ResumeSlashCmd,
  SkipCmd,
  SkipSlashCmd,
  Stay247Cmd,
  Stay247SlashCmd,
  StopCmd,
  StopSlashCmd,
  VolumeCmd,
  VolumeSlashCmd,
} from "./commands/MusicCmds.js";
import { handleTrackFinished } from "./commands/actualMusicCmds.js";
import { createEmptyQueueState } from "./functions/lavalink.js";
import {
  destroyLavalinkPlayer,
  registerTrackEndHandler,
  unregisterTrackEndHandler,
} from "./functions/lavalinkNode.js";
import { leaveVoiceChannel } from "./functions/voiceConnection.js";
import { MusicPluginType, musicSlashGroup, zMusicConfig } from "./types.js";

export const MusicPlugin = guildPlugin<MusicPluginType>()({
  name: "music",
  configSchema: zMusicConfig,
  messageCommands: [
    PlayCmd,
    JoinCmd,
    LeaveCmd,
    SkipCmd,
    QueueCmd,
    StopCmd,
    PauseCmd,
    ResumeCmd,
    VolumeCmd,
    FiltersCmd,
    Stay247Cmd,
    NowPlayingCmd,
  ],
  slashCommands: [
    musicSlashGroup({
      name: "music",
      description: "Music (Lavalink)",
      subcommands: [
        PlaySlashCmd,
        JoinSlashCmd,
        LeaveSlashCmd,
        SkipSlashCmd,
        QueueSlashCmd,
        StopSlashCmd,
        PauseSlashCmd,
        ResumeSlashCmd,
        VolumeSlashCmd,
        FiltersSlashCmd,
        Stay247SlashCmd,
        NowPlayingSlashCmd,
      ],
    }),
  ],
  beforeLoad(pluginData) {
    const state = createEmptyQueueState();
    state.stay247 = pluginData.config.get().stay_247;
    state.volume = pluginData.config.get().default_volume;
    pluginData.state.player = state;
    pluginData.state.lavalinkUp = false;
  },
  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
    registerTrackEndHandler(pluginData.guild.id, (_guildId, reason) => {
      if (reason !== "finished") return;
      void handleTrackFinished(pluginData);
    });
  },
  beforeUnload(pluginData) {
    unregisterTrackEndHandler(pluginData.guild.id);
    const userId = pluginData.client.user?.id;
    if (userId) {
      void destroyLavalinkPlayer(pluginData.guild.id, userId);
    }
    leaveVoiceChannel(pluginData.guild);
  },
});
