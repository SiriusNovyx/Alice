import { EmbedBuilder } from "discord.js";
import { GuildPluginData } from "vety";
import { GenericCommandSource, sendContextResponse } from "../../../pluginUtils.js";
import { fetchSocialGif } from "../functions/fetchSocialGif.js";
import { SocialPluginType } from "../types.js";

export const SOCIAL_ACTIONS = [
  "hug",
  "pat",
  "slap",
  "kiss",
  "poke",
  "highfive",
  "cuddle",
  "tickle",
  "dance",
  "wave",
  "bite",
  "blush",
  "smile",
] as const;

export type SocialAction = (typeof SOCIAL_ACTIONS)[number];

const LABELS: Record<SocialAction, (a: string, b: string) => string> = {
  hug: (a, b) => `**${a}** hugs **${b}**!`,
  pat: (a, b) => `**${a}** pats **${b}**.`,
  slap: (a, b) => `**${a}** slaps **${b}**!`,
  kiss: (a, b) => `**${a}** kisses **${b}**.`,
  poke: (a, b) => `**${a}** pokes **${b}**.`,
  highfive: (a, b) => `**${a}** high-fives **${b}**!`,
  cuddle: (a, b) => `**${a}** cuddles **${b}**.`,
  tickle: (a, b) => `**${a}** tickles **${b}**!`,
  dance: (a, b) => `**${a}** dances with **${b}**!`,
  wave: (a, b) => `**${a}** waves at **${b}**.`,
  bite: (a, b) => `**${a}** bites **${b}**!`,
  blush: (a, b) => `**${a}** blushes at **${b}**.`,
  smile: (a, b) => `**${a}** smiles at **${b}**.`,
};

export async function actualSocialAction(
  pluginData: GuildPluginData<SocialPluginType>,
  context: GenericCommandSource,
  action: SocialAction,
  actorName: string,
  targetName: string,
  actorId: string,
  targetId: string,
): Promise<void> {
  if (!pluginData.config.get().enabled) {
    await pluginData.state.common.sendErrorMessage(context, "Social commands are disabled.");
    return;
  }

  if (actorId === targetId) {
    await pluginData.state.common.sendErrorMessage(context, `You can't ${action} yourself!`);
    return;
  }

  const label = LABELS[action];
  if (!label) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown action.");
    return;
  }

  try {
    const { url, provider } = await fetchSocialGif(action);
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setDescription(label(actorName, targetName))
      .setImage(url)
      .setFooter({ text: `Source: ${provider}` });
    await sendContextResponse(context, { embeds: [embed] }, false);
  } catch {
    // Soft-fail to text-only so the command still works if APIs are down
    await pluginData.state.common.sendSuccessMessage(context, label(actorName, targetName));
  }
}
