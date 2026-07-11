import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { utilityCmd } from "../types.js";
import { actualServerInfoCmd } from "./actualInfoCmds.js";

export const ServerInfoCmd = utilityCmd({
  trigger: ["server", "serverinfo"],
  description: "Show server information",
  usage: "!server",
  permission: "can_server",

  signature: {
    serverId: ct.string({ required: false }),
  },

  async run({ message, pluginData, args }) {
    await actualServerInfoCmd(pluginData, message, args.serverId || pluginData.guild.id);
  },
});
