import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { funCmd } from "../types.js";
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

export const EightBallCmd = funCmd({
  trigger: ["8ball", "eightball"],
  usage: "!8ball <question>",
  permission: "can_use",
  signature: { question: ct.string({ catchAll: true }) },
  async run({ message: msg, args, pluginData }) {
    await actual8Ball(pluginData, msg, args.question);
  },
});

export const CoinflipCmd = funCmd({
  trigger: ["coinflip", "flip"],
  usage: "!coinflip",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualCoinflip(pluginData, msg);
  },
});

export const DiceCmd = funCmd({
  trigger: ["dice", "roll"],
  usage: "!dice [sides]",
  permission: "can_use",
  signature: { sides: ct.number({ required: false }) },
  async run({ message: msg, args, pluginData }) {
    await actualDice(pluginData, msg, args.sides ?? 6);
  },
});

export const ChooseCmd = funCmd({
  trigger: ["choose", "pick"],
  usage: "!choose a | b | c",
  permission: "can_use",
  signature: { options: ct.string({ catchAll: true }) },
  async run({ message: msg, args, pluginData }) {
    await actualChoose(pluginData, msg, args.options);
  },
});

export const CatCmd = funCmd({
  trigger: ["cat", "meow"],
  usage: "!cat",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualCat(pluginData, msg);
  },
});

export const DogCmd = funCmd({
  trigger: ["dog", "woof", "doggo"],
  usage: "!dog",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualDog(pluginData, msg);
  },
});

export const MemeCmd = funCmd({
  trigger: ["meme"],
  usage: "!meme",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualMeme(pluginData, msg);
  },
});

export const JokeCmd = funCmd({
  trigger: ["joke"],
  usage: "!joke",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualJoke(pluginData, msg);
  },
});

export const FactCmd = funCmd({
  trigger: ["fact"],
  usage: "!fact",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualFact(pluginData, msg);
  },
});
