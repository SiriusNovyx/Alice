import { GuildChannel } from "discord.js";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { resolveMessageMember } from "../../../pluginUtils.js";
import { resolveRoleId } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { rolesCmd } from "../types.js";
import { actualRemoveTempRoleCmd } from "./actualRemoveTempRoleCmd.js";

export const RemoveTempRoleCmd = rolesCmd({
  trigger: "untemprole",
  permission: "can_assign_temp",
  description: "Remove a timed role from the specified member",
  usage: "!untemprole <user> <role>",

  signature: {
    member: ct.resolvedMember(),
    role: ct.string({ catchAll: true }),
  },

  async run({ message: msg, args, pluginData }) {
    const authorMember = await resolveMessageMember(msg);

    const roleId = await resolveRoleId(pluginData.client, pluginData.guild.id, args.role);
    if (!roleId) {
      void pluginData.state.common.sendErrorMessage(msg, "Invalid role id");
      return;
    }

    const config = await pluginData.config.getForMessage(msg);
    if (!config.assignable_roles.includes(roleId)) {
      void pluginData.state.common.sendErrorMessage(msg, "You cannot remove that role");
      return;
    }

    const role = (msg.channel as GuildChannel).guild.roles.cache.get(roleId);
    if (!role) {
      pluginData.getPlugin(LogsPlugin).logBotAlert({
        body: `Unknown role configured for 'roles' plugin: ${roleId}`,
      });
      void pluginData.state.common.sendErrorMessage(msg, "You cannot remove that role");
      return;
    }

    await actualRemoveTempRoleCmd(pluginData, msg, authorMember, msg.author, args.member, role);
  },
});
