import { GuildChannel } from "discord.js";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { resolveMessageMember } from "../../../pluginUtils.js";
import { resolveRoleId } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { rolesCmd } from "../types.js";
import { actualAddRoleCmd } from "./actualAddRoleCmd.js";

export const AddRoleCmd = rolesCmd({
  trigger: "addrole",
  permission: "can_assign",
  description: "Add a role to the specified member",
  usage: "!addrole <user> <role> [-reason]",

  signature: {
    member: ct.resolvedMember(),
    role: ct.string({ catchAll: true }),
    reason: ct.string({ option: true }),
  },

  async run({ message: msg, args, pluginData }) {
    const member = await resolveMessageMember(msg);

    const roleId = await resolveRoleId(pluginData.client, pluginData.guild.id, args.role);
    if (!roleId) {
      void pluginData.state.common.sendErrorMessage(msg, "Invalid role id");
      return;
    }

    const config = await pluginData.config.getForMessage(msg);
    if (!config.assignable_roles.includes(roleId)) {
      void pluginData.state.common.sendErrorMessage(msg, "You cannot assign that role");
      return;
    }

    const role = (msg.channel as GuildChannel).guild.roles.cache.get(roleId);
    if (!role) {
      pluginData.getPlugin(LogsPlugin).logBotAlert({
        body: `Unknown role configured for 'roles' plugin: ${roleId}`,
      });
      void pluginData.state.common.sendErrorMessage(msg, "You cannot assign that role");
      return;
    }

    await actualAddRoleCmd(pluginData, msg, member, msg.author, args.member, role, args.reason);
  },
});
