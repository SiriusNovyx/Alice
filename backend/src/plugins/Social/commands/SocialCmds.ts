import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { socialCmd } from "../types.js";
import { actualSocialAction, SocialAction } from "./actualSocialCmds.js";

function makeSocialCmd(action: SocialAction, triggers: string[]) {
  return socialCmd({
    trigger: triggers,
    usage: `!${triggers[0]} <user>`,
    permission: "can_use",
    signature: { user: ct.resolvedUser() },
    async run({ message: msg, args, pluginData }) {
      await actualSocialAction(
        pluginData,
        msg,
        action,
        msg.author.username,
        args.user.username,
        msg.author.id,
        args.user.id,
      );
    },
  });
}

export const HugCmd = makeSocialCmd("hug", ["hug"]);
export const PatCmd = makeSocialCmd("pat", ["pat"]);
export const SlapCmd = makeSocialCmd("slap", ["slap"]);
export const KissCmd = makeSocialCmd("kiss", ["kiss"]);
export const PokeCmd = makeSocialCmd("poke", ["poke"]);
export const HighfiveCmd = makeSocialCmd("highfive", ["highfive", "high-five"]);
export const CuddleCmd = makeSocialCmd("cuddle", ["cuddle"]);
export const TickleCmd = makeSocialCmd("tickle", ["tickle"]);
export const DanceCmd = makeSocialCmd("dance", ["dance"]);
export const WaveCmd = makeSocialCmd("wave", ["wave"]);
export const BiteCmd = makeSocialCmd("bite", ["bite"]);
export const BlushCmd = makeSocialCmd("blush", ["blush"]);
export const SmileCmd = makeSocialCmd("smile", ["smile"]);
