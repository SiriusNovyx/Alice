import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { pingableRolesCmd } from "../types.js";
import { actualPingableRoleDisableCmd } from "./actualPingableRoleDisableCmd.js";

export const PingableRoleDisableCmd = pingableRolesCmd({
  trigger: ["pingable_role disable", "pingable_role d"],
  permission: "can_manage",

  signature: {
    channelId: ct.channelId(),
    role: ct.role(),
  },

  async run({ message: msg, args, pluginData }) {
    await actualPingableRoleDisableCmd(pluginData, msg, args.channelId, args.role);
  },
});
