import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { utilityCmd } from "../types.js";
import { actualInviteInfoCmd } from "./actualInfoCmds.js";

export const InviteInfoCmd = utilityCmd({
  trigger: ["invite", "inviteinfo"],
  description: "Show information about an invite",
  usage: "!invite <code>",
  permission: "can_inviteinfo",

  signature: {
    inviteCode: ct.string(),
  },

  async run({ message, args, pluginData }) {
    await actualInviteInfoCmd(pluginData, message, args.inviteCode);
  },
});
