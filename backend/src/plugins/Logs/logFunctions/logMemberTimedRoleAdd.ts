import { GuildMember, Role, User } from "discord.js";
import { GuildPluginData } from "vety";
import { LogType } from "../../../data/LogType.js";
import { createTypedTemplateSafeValueContainer } from "../../../templateFormatter.js";
import { UnknownRole } from "../../../utils.js";
import { memberToTemplateSafeMember, userToTemplateSafeUser } from "../../../utils/templateSafeObjects.js";
import { LogsPluginType } from "../types.js";
import { log } from "../util/log.js";

export interface LogMemberTimedRoleAddData {
  mod: User;
  member: GuildMember;
  roles: Array<Role | UnknownRole>;
  time: string;
  reason: string;
}

export function logMemberTimedRoleAdd(pluginData: GuildPluginData<LogsPluginType>, data: LogMemberTimedRoleAddData) {
  return log(
    pluginData,
    LogType.MEMBER_TIMED_ROLE_ADD,
    createTypedTemplateSafeValueContainer({
      mod: userToTemplateSafeUser(data.mod),
      member: memberToTemplateSafeMember(data.member),
      roles: data.roles.map((r) => r.name).join(", "),
      time: data.time,
      reason: data.reason,
    }),
    {
      userId: data.member.id,
      roles: Array.from(data.member.roles.cache.keys()),
      bot: data.member.user.bot,
    },
  );
}
