import { guildPlugin } from "vety";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import {
  BiteCmd,
  BlushCmd,
  CuddleCmd,
  DanceCmd,
  HighfiveCmd,
  HugCmd,
  KissCmd,
  PatCmd,
  PokeCmd,
  SlapCmd,
  SmileCmd,
  TickleCmd,
  WaveCmd,
} from "./commands/SocialCmds.js";
import {
  BiteSlashCmd,
  BlushSlashCmd,
  CuddleSlashCmd,
  DanceSlashCmd,
  HighfiveSlashCmd,
  HugSlashCmd,
  KissSlashCmd,
  PatSlashCmd,
  PokeSlashCmd,
  SlapSlashCmd,
  SmileSlashCmd,
  TickleSlashCmd,
  WaveSlashCmd,
} from "./commands/SocialSlashCmds.js";
import { SocialPluginType, socialSlashGroup, zSocialConfig } from "./types.js";

export const SocialPlugin = guildPlugin<SocialPluginType>()({
  name: "social",
  configSchema: zSocialConfig,
  // prettier-ignore
  messageCommands: [
    HugCmd,
    PatCmd,
    SlapCmd,
    KissCmd,
    PokeCmd,
    HighfiveCmd,
    CuddleCmd,
    TickleCmd,
    DanceCmd,
    WaveCmd,
    BiteCmd,
    BlushCmd,
    SmileCmd,
  ],
  slashCommands: [
    socialSlashGroup({
      name: "social",
      description: "Social GIF commands",
      subcommands: [
        HugSlashCmd,
        PatSlashCmd,
        SlapSlashCmd,
        KissSlashCmd,
        PokeSlashCmd,
        HighfiveSlashCmd,
        CuddleSlashCmd,
        TickleSlashCmd,
        DanceSlashCmd,
        WaveSlashCmd,
        BiteSlashCmd,
        BlushSlashCmd,
        SmileSlashCmd,
      ],
    }),
  ],
  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },
});
