import { automodMsgCmd } from "../types.js";
import { actualClearAntiraidCmd } from "./actualClearAntiraidCmd.js";

export const AntiraidClearCmd = automodMsgCmd({
  trigger: ["antiraid clear", "antiraid reset", "antiraid none", "antiraid off"],
  permission: "can_set_antiraid",

  async run({ pluginData, message }) {
    await actualClearAntiraidCmd(pluginData, message, message.author);
  },
});
