import { slashOptions } from "vety";
import { socialSlashCmd } from "../types.js";
import { actualSocialAction, SocialAction } from "./actualSocialCmds.js";

function makeSlash(action: SocialAction, description: string) {
  return socialSlashCmd({
    name: action,
    configPermission: "can_use",
    description,
    allowDms: false,
    signature: [slashOptions.user({ name: "user", description: "Target member", required: true })],
    async run({ interaction, options, pluginData }) {
      await interaction.deferReply();
      await actualSocialAction(
        pluginData,
        interaction,
        action,
        interaction.user.username,
        options.user.username,
        interaction.user.id,
        options.user.id,
      );
    },
  });
}

export const HugSlashCmd = makeSlash("hug", "Hug someone");
export const PatSlashCmd = makeSlash("pat", "Pat someone");
export const SlapSlashCmd = makeSlash("slap", "Slap someone");
export const KissSlashCmd = makeSlash("kiss", "Kiss someone");
export const PokeSlashCmd = makeSlash("poke", "Poke someone");
export const HighfiveSlashCmd = makeSlash("highfive", "High-five someone");
export const CuddleSlashCmd = makeSlash("cuddle", "Cuddle someone");
export const TickleSlashCmd = makeSlash("tickle", "Tickle someone");
export const DanceSlashCmd = makeSlash("dance", "Dance with someone");
export const WaveSlashCmd = makeSlash("wave", "Wave at someone");
export const BiteSlashCmd = makeSlash("bite", "Bite someone");
export const BlushSlashCmd = makeSlash("blush", "Blush at someone");
export const SmileSlashCmd = makeSlash("smile", "Smile at someone");
