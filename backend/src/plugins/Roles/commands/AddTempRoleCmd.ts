import { GuildChannel } from "discord.js";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { resolveMessageMember } from "../../../pluginUtils.js";
import { resolveRoleId } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { rolesCmd } from "../types.js";
import { actualAddTempRoleCmd } from "./actualAddTempRoleCmd.js";

export const AddTempRoleCmd = rolesCmd({
  trigger: "temprole",
  permission: "can_assign_temp",
  description: "Add a timed role to the specified member",
  usage: "!temprole <user> <duration> <role> [-reason]",

  signature: {
    member: ct.resolvedMember(),
    time: ct.delay(),
    role: ct.string({ catchAll: true }),
    reason: ct.string({ option: true }),
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

    await actualAddTempRoleCmd(
      pluginData,
      msg,
      authorMember,
      msg.author,
      args.member,
      role,
      args.time,
      args.reason,
    );
  },
});
