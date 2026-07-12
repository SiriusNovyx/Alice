import { slashOptions } from "vety";
import { funSlashCmd } from "../types.js";
import {
  actual8Ball,
  actualCat,
  actualChoose,
  actualCoinflip,
  actualDice,
  actualDog,
  actualFact,
  actualJoke,
  actualMeme,
} from "./actualFunCmds.js";

export const EightBallSlashCmd = funSlashCmd({
  name: "8ball",
  configPermission: "can_use",
  description: "Ask the magic 8-ball",
  allowDms: false,
  signature: [slashOptions.string({ name: "question", description: "Your question", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actual8Ball(pluginData, interaction, options.question);
  },
});

export const CoinflipSlashCmd = funSlashCmd({
  name: "coinflip",
  configPermission: "can_use",
  description: "Flip a coin",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualCoinflip(pluginData, interaction);
  },
});

export const DiceSlashCmd = funSlashCmd({
  name: "dice",
  configPermission: "can_use",
  description: "Roll a die",
  allowDms: false,
  signature: [slashOptions.integer({ name: "sides", description: "Number of sides", required: false })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualDice(pluginData, interaction, options.sides ?? 6);
  },
});

export const ChooseSlashCmd = funSlashCmd({
  name: "choose",
  configPermission: "can_use",
  description: "Choose between options separated by |",
  allowDms: false,
  signature: [slashOptions.string({ name: "options", description: "a | b | c", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualChoose(pluginData, interaction, options.options);
  },
});

export const CatSlashCmd = funSlashCmd({
  name: "cat",
  configPermission: "can_use",
  description: "Random cat picture",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualCat(pluginData, interaction);
  },
});

export const DogSlashCmd = funSlashCmd({
  name: "dog",
  configPermission: "can_use",
  description: "Random dog picture",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualDog(pluginData, interaction);
  },
});

export const MemeSlashCmd = funSlashCmd({
  name: "meme",
  configPermission: "can_use",
  description: "Random meme",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualMeme(pluginData, interaction);
  },
});

export const JokeSlashCmd = funSlashCmd({
  name: "joke",
  configPermission: "can_use",
  description: "Random joke",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualJoke(pluginData, interaction);
  },
});

export const FactSlashCmd = funSlashCmd({
  name: "fact",
  configPermission: "can_use",
  description: "Random useless fact",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply();
    await actualFact(pluginData, interaction);
  },
});
