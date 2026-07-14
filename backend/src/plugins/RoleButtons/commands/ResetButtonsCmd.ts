import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { roleButtonsCmd } from "../types.js";
import { actualResetButtonsCmd } from "./actualResetButtonsCmd.js";

export const ResetButtonsCmd = roleButtonsCmd({
  trigger: "role_buttons reset",
  description:
    "In case of issues, you can run this command to have Alice 'forget' about specific role buttons and re-apply them. This will also repost the message, if not targeting an existing message.",
  usage: "!role_buttons reset <name>",
  permission: "can_reset",
  signature: {
    name: ct.string(),
  },
  async run({ pluginData, args, message }) {
    await actualResetButtonsCmd(pluginData, message, args.name);
  },
});
