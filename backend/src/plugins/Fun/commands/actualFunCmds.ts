import { EmbedBuilder } from "discord.js";
import { GuildPluginData } from "vety";
import { GenericCommandSource, sendContextResponse } from "../../../pluginUtils.js";
import { FunPluginType } from "../types.js";

const EIGHT_BALL = [
  "It is certain.",
  "It is decidedly so.",
  "Without a doubt.",
  "Yes definitely.",
  "You may rely on it.",
  "As I see it, yes.",
  "Most likely.",
  "Outlook good.",
  "Yes.",
  "Signs point to yes.",
  "Reply hazy, try again.",
  "Ask again later.",
  "Better not tell you now.",
  "Cannot predict now.",
  "Concentrate and ask again.",
  "Don't count on it.",
  "My reply is no.",
  "My sources say no.",
  "Outlook not so good.",
  "Very doubtful.",
];

const COIN = ["Heads", "Tails"];

async function fetchJson(url: string, timeoutMs = 8000): Promise<any> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { Accept: "application/json", "User-Agent": "AliceBot/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function assertEnabled(pluginData: GuildPluginData<FunPluginType>): boolean {
  return pluginData.config.get().enabled;
}

export async function actual8Ball(
  pluginData: GuildPluginData<FunPluginType>,
  context: GenericCommandSource,
  question: string,
): Promise<void> {
  if (!assertEnabled(pluginData)) {
    await pluginData.state.common.sendErrorMessage(context, "Fun commands are disabled.");
    return;
  }
  const answer = EIGHT_BALL[Math.floor(Math.random() * EIGHT_BALL.length)]!;
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("Magic 8-Ball")
    .addFields(
      { name: "Question", value: question.slice(0, 1000) },
      { name: "Answer", value: answer },
    );
  await sendContextResponse(context, { embeds: [embed] }, false);
}

export async function actualCoinflip(
  pluginData: GuildPluginData<FunPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  if (!assertEnabled(pluginData)) {
    await pluginData.state.common.sendErrorMessage(context, "Fun commands are disabled.");
    return;
  }
  const result = COIN[Math.floor(Math.random() * COIN.length)]!;
  await pluginData.state.common.sendSuccessMessage(context, `The coin landed on **${result}**.`);
}

export async function actualDice(
  pluginData: GuildPluginData<FunPluginType>,
  context: GenericCommandSource,
  sides: number,
): Promise<void> {
  if (!assertEnabled(pluginData)) {
    await pluginData.state.common.sendErrorMessage(context, "Fun commands are disabled.");
    return;
  }
  const n = Math.max(2, Math.min(1000, sides));
  const roll = Math.floor(Math.random() * n) + 1;
  await pluginData.state.common.sendSuccessMessage(context, `You rolled a **${roll}** (d${n}).`);
}

export async function actualChoose(
  pluginData: GuildPluginData<FunPluginType>,
  context: GenericCommandSource,
  optionsText: string,
): Promise<void> {
  if (!assertEnabled(pluginData)) {
    await pluginData.state.common.sendErrorMessage(context, "Fun commands are disabled.");
    return;
  }
  const options = optionsText
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  if (options.length < 2) {
    await pluginData.state.common.sendErrorMessage(context, "Provide at least two options separated by `|`.");
    return;
  }
  const pick = options[Math.floor(Math.random() * options.length)]!;
  await pluginData.state.common.sendSuccessMessage(context, `I choose **${pick}**.`);
}

export async function actualCat(
  pluginData: GuildPluginData<FunPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  if (!assertEnabled(pluginData)) {
    await pluginData.state.common.sendErrorMessage(context, "Fun commands are disabled.");
    return;
  }
  try {
    // cataas returns JSON with a relative or absolute url when ?json=true
    const data = await fetchJson("https://cataas.com/cat?json=true");
    const rawUrl = typeof data?.url === "string" ? data.url : "";
    const image = rawUrl.startsWith("http") ? rawUrl : `https://cataas.com${rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`}`;
    if (!rawUrl) throw new Error("no url");
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle("Meow!").setImage(image).setFooter({
      text: "Powered by cataas.com",
    });
    await sendContextResponse(context, { embeds: [embed] }, false);
  } catch {
    await pluginData.state.common.sendErrorMessage(context, "Failed to fetch a cat picture.");
  }
}

export async function actualDog(
  pluginData: GuildPluginData<FunPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  if (!assertEnabled(pluginData)) {
    await pluginData.state.common.sendErrorMessage(context, "Fun commands are disabled.");
    return;
  }
  try {
    const data = await fetchJson("https://dog.ceo/api/breeds/image/random");
    if (!data?.message) throw new Error("bad response");
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Woof!")
      .setImage(data.message)
      .setFooter({ text: "Powered by dog.ceo" });
    await sendContextResponse(context, { embeds: [embed] }, false);
  } catch {
    await pluginData.state.common.sendErrorMessage(context, "Failed to fetch a dog picture.");
  }
}

export async function actualMeme(
  pluginData: GuildPluginData<FunPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  if (!assertEnabled(pluginData)) {
    await pluginData.state.common.sendErrorMessage(context, "Fun commands are disabled.");
    return;
  }
  try {
    const data = await fetchJson("https://meme-api.com/gimme");
    if (!data?.url) throw new Error("bad response");
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(String(data.title ?? "Meme").slice(0, 250))
      .setImage(data.url)
      .setFooter({ text: `👍 ${data.ups ?? 0} | r/${data.subreddit ?? "memes"}` });
    if (typeof data.postLink === "string") {
      embed.setURL(data.postLink);
    }
    await sendContextResponse(context, { embeds: [embed] }, false);
  } catch {
    await pluginData.state.common.sendErrorMessage(context, "Failed to fetch a meme.");
  }
}

export async function actualJoke(
  pluginData: GuildPluginData<FunPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  if (!assertEnabled(pluginData)) {
    await pluginData.state.common.sendErrorMessage(context, "Fun commands are disabled.");
    return;
  }
  try {
    const data = await fetchJson("https://v2.jokeapi.dev/joke/Any?safe-mode");
    const jokeText =
      data?.type === "single"
        ? String(data.joke)
        : `${data?.setup ?? ""}\n\n*${data?.delivery ?? ""}*`;
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Random Joke")
      .setDescription(jokeText.slice(0, 4000) || "No joke returned.")
      .setFooter({ text: `Category: ${data?.category ?? "Any"}` });
    await sendContextResponse(context, { embeds: [embed] }, false);
  } catch {
    await pluginData.state.common.sendErrorMessage(context, "Failed to fetch a joke.");
  }
}

export async function actualFact(
  pluginData: GuildPluginData<FunPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  if (!assertEnabled(pluginData)) {
    await pluginData.state.common.sendErrorMessage(context, "Fun commands are disabled.");
    return;
  }
  try {
    const data = await fetchJson("https://uselessfacts.jsph.pl/api/v2/facts/random");
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Random Fact")
      .setDescription(String(data?.text ?? "No fact returned.").slice(0, 4000))
      .setFooter({ text: "Source: uselessfacts.jsph.pl" });
    await sendContextResponse(context, { embeds: [embed] }, false);
  } catch {
    await pluginData.state.common.sendErrorMessage(context, "Failed to fetch a fact.");
  }
}
