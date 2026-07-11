import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { pingableRolesCmd } from "../types.js";
import { actualPingableRoleEnableCmd } from "./actualPingableRoleEnableCmd.js";

export const PingableRoleEnableCmd = pingableRolesCmd({
  trigger: "pingable_role",
  permission: "can_manage",

  signature: {
    channelId: ct.channelId(),
    role: ct.role(),
  },

  async run({ message: msg, args, pluginData }) {
    await actualPingableRoleEnableCmd(pluginData, msg, args.channelId, args.role);
  },
});
