import { GuildMember } from "discord.js";
import { GuildPluginData } from "vety";
import moment from "moment-timezone";
import { LogType } from "../../../data/LogType.js";
import { humanizeDuration } from "../../../humanizeDuration.js";
import { createTypedTemplateSafeValueContainer } from "../../../templateFormatter.js";
import { memberToTemplateSafeMember } from "../../../utils/templateSafeObjects.js";
import { LogsPluginType } from "../types.js";
import { log } from "../util/log.js";

export interface LogMemberJoinData {
  member: GuildMember;
  /** How many milliseconds old an account must be before it's no longer considered "new". Defaults to 1 hour. */
  newAccountThresholdMs?: number;
}

export function logMemberJoin(pluginData: GuildPluginData<LogsPluginType>, data: LogMemberJoinData) {
  const thresholdMs = data.newAccountThresholdMs ?? 1000 * 60 * 60;
  const newThreshold = moment.utc().valueOf() - thresholdMs;
  const accountAge = humanizeDuration(moment.utc().valueOf() - data.member.user.createdTimestamp, {
    largest: 2,
    round: true,
  });

  return log(
    pluginData,
    LogType.MEMBER_JOIN,
    createTypedTemplateSafeValueContainer({
      member: memberToTemplateSafeMember(data.member),
      new: data.member.user.createdTimestamp >= newThreshold ? " :new:" : "",
      account_age: accountAge,
      account_age_ts: Math.round(data.member.user.createdTimestamp / 1000).toString(),
    }),
    {
      userId: data.member.id,
      bot: data.member.user.bot,
    },
  );
}
