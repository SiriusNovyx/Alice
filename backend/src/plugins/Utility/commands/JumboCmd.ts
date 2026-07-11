import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { SECONDS } from "../../../utils.js";
import { utilityCmd } from "../types.js";
import { actualJumboCmd } from "./actualJumboCmd.js";

export const JumboCmd = utilityCmd({
  trigger: "jumbo",
  description: "Makes an emoji jumbo",
  permission: "can_jumbo",
  cooldown: 5 * SECONDS,

  signature: {
    emoji: ct.string(),
  },

  async run({ message: msg, args, pluginData }) {
    await actualJumboCmd(pluginData, msg, args.emoji);
  },
});
