import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { automodMsgCmd } from "../types.js";
import { actualDebugAutomodCmd } from "./actualDebugAutomodCmd.js";

export const DebugAutomodCmd = automodMsgCmd({
  trigger: "debug_automod",
  permission: "can_debug_automod",

  signature: {
    messageId: ct.string(),
  },

  async run({ pluginData, message, args }) {
    await actualDebugAutomodCmd(pluginData, message, args.messageId);
  },
});
