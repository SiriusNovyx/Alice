import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { automodMsgCmd } from "../types.js";
import { actualSetAntiraidCmd } from "./actualSetAntiraidCmd.js";

export const SetAntiraidCmd = automodMsgCmd({
  trigger: "antiraid",
  permission: "can_set_antiraid",

  signature: {
    level: ct.string(),
  },

  async run({ pluginData, message, args }) {
    await actualSetAntiraidCmd(pluginData, message, message.author, args.level);
  },
});
