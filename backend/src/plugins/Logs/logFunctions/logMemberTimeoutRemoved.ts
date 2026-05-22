import { PartialUser, User } from "discord.js";
import { GuildPluginData } from "vety";
import { LogType } from "../../../data/LogType.js";
import { createTypedTemplateSafeValueContainer } from "../../../templateFormatter.js";
import { UnknownUser } from "../../../utils.js";
import { userToTemplateSafeUser } from "../../../utils/templateSafeObjects.js";
import { LogsPluginType } from "../types.js";
import { log } from "../util/log.js";

export interface LogMemberTimeoutRemovedData {
  mod: User | UnknownUser | PartialUser | null;
  user: User | UnknownUser;
  caseNumber: number;
  reason: string;
}

export function logMemberTimeoutRemoved(pluginData: GuildPluginData<LogsPluginType>, data: LogMemberTimeoutRemovedData) {
  return log(
    pluginData,
    LogType.MEMBER_TIMEOUT_REMOVED,
    createTypedTemplateSafeValueContainer({
      mod: data.mod ? userToTemplateSafeUser(data.mod) : null,
      user: userToTemplateSafeUser(data.user),
      caseNumber: data.caseNumber,
      reason: data.reason,
    }),
    {
      userId: data.user.id,
      bot: data.user instanceof User ? data.user.bot : false,
    },
  );
}
