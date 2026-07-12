import { guildPlugin } from "vety";
import { CommonPlugin } from "../Common/CommonPlugin.js";
import {
  CatCmd,
  ChooseCmd,
  CoinflipCmd,
  DiceCmd,
  DogCmd,
  EightBallCmd,
  FactCmd,
  JokeCmd,
  MemeCmd,
} from "./commands/FunCmds.js";
import {
  CatSlashCmd,
  ChooseSlashCmd,
  CoinflipSlashCmd,
  DiceSlashCmd,
  DogSlashCmd,
  EightBallSlashCmd,
  FactSlashCmd,
  JokeSlashCmd,
  MemeSlashCmd,
} from "./commands/FunSlashCmds.js";
import { FunPluginType, funSlashGroup, zFunConfig } from "./types.js";

export const FunPlugin = guildPlugin<FunPluginType>()({
  name: "fun",
  configSchema: zFunConfig,
  // prettier-ignore
  messageCommands: [
    EightBallCmd,
    CoinflipCmd,
    DiceCmd,
    ChooseCmd,
    CatCmd,
    DogCmd,
    MemeCmd,
    JokeCmd,
    FactCmd,
  ],
  slashCommands: [
    funSlashGroup({
      name: "fun",
      description: "Fun commands",
      defaultMemberPermissions: "0",
      subcommands: [
        EightBallSlashCmd,
        CoinflipSlashCmd,
        DiceSlashCmd,
        ChooseSlashCmd,
        CatSlashCmd,
        DogSlashCmd,
        MemeSlashCmd,
        JokeSlashCmd,
        FactSlashCmd,
      ],
    }),
  ],
  beforeStart(pluginData) {
    pluginData.state.common = pluginData.getPlugin(CommonPlugin);
  },
});
