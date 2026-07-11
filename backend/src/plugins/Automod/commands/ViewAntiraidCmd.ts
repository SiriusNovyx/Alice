import { automodMsgCmd } from "../types.js";
import { actualViewAntiraidCmd } from "./actualViewAntiraidCmd.js";

export const ViewAntiraidCmd = automodMsgCmd({
  trigger: "antiraid",
  permission: "can_view_antiraid",

  async run({ pluginData, message }) {
    await actualViewAntiraidCmd(pluginData, message);
  },
});
