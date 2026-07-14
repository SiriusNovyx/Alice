import { utilityCmd } from "../types.js";
import { actualAboutCmd } from "./actualAboutCmd.js";

export const AboutCmd = utilityCmd({
  trigger: "about",
  description: "Show information about Alice's status on the server",
  permission: "can_about",

  async run({ message: msg, pluginData }) {
    await actualAboutCmd(pluginData, msg);
  },
});
