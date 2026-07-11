import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { resolveMessageMember } from "../../../pluginUtils.js";
import { utilityCmd } from "../types.js";
import { actualVcdisconnectCmd } from "./actualVcdisconnectCmd.js";

export const VcdisconnectCmd = utilityCmd({
  trigger: ["vcdisconnect", "vcdisc", "vcdc", "vckick", "vck"],
  description: "Disconnect a member from their voice channel",
  usage: "!vcdc <user>",
  permission: "can_vckick",

  signature: {
    member: ct.resolvedMember(),
  },

  async run({ message: msg, args, pluginData }) {
    const authorMember = await resolveMessageMember(msg);
    await actualVcdisconnectCmd(pluginData, msg, authorMember, args.member);
  },
});
