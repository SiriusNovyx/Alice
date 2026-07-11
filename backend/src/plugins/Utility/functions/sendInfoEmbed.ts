import { APIEmbed, ChatInputCommandInteraction, Message } from "discord.js";
import { isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";

/** Reply with an info embed via CommonPlugin-compatible context (message channel or slash edit/followUp). */
export async function sendInfoEmbed(
  context: Message | ChatInputCommandInteraction,
  embed: APIEmbed,
  ephemeral = false,
): Promise<void> {
  if (isContextInteraction(context)) {
    await sendContextResponse(context, { embeds: [embed] }, ephemeral);
    return;
  }

  if (context.channel.isSendable()) {
    await context.channel.send({ embeds: [embed] });
  }
}
