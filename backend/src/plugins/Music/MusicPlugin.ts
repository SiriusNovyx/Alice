import { guildPlugin } from "vety";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import {
  FiltersCmd,
  FiltersSlashCmd,
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
import { createEmptyQueueState } from "./functions/lavalink.js";
import { MusicPluginType, musicSlashGroup, zMusicConfig } from "./types.js";

export const MusicPlugin = guildPlugin<MusicPluginType>()({
  name: "music",
  configSchema: zMusicConfig,
  messageCommands: [
    PlayCmd,
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
      defaultMemberPermissions: "0",
      subcommands: [
        PlaySlashCmd,
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
  },
});
