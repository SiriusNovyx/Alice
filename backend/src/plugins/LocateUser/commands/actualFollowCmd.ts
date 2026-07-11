import { ChatInputCommandInteraction, GuildMember, Message } from "discord.js";
import { GuildPluginData } from "vety";
import moment from "moment-timezone";
import { registerExpiringVCAlert } from "../../../data/loops/expiringVCAlertsLoop.js";
import { humanizeDuration } from "../../../humanizeDuration.js";
import { MINUTES, SECONDS } from "../../../utils.js";
import { LocateUserPluginType } from "../types.js";

export async function actualFollowCmd(
  pluginData: GuildPluginData<LocateUserPluginType>,
  context: Message | ChatInputCommandInteraction,
  requestorId: string,
  channelId: string,
  member: GuildMember,
  reminder: string | null | undefined,
  duration: number | null | undefined,
  active: boolean,
) {
  const time = duration || 10 * MINUTES;
  const alertTime = moment.utc().add(time, "millisecond");
  const body = reminder || "None";

  if (time < 30 * SECONDS) {
    await pluginData.state.common.sendErrorMessage(context, "Sorry, but the minimum duration for an alert is 30 seconds!");
    return;
  }

  const alert = await pluginData.state.alerts.add(
    requestorId,
    member.id,
    channelId,
    alertTime.format("YYYY-MM-DD HH:mm:ss"),
    body,
    active,
  );
  registerExpiringVCAlert(alert);

  if (!pluginData.state.usersWithAlerts.includes(member.id)) {
    pluginData.state.usersWithAlerts.push(member.id);
  }

  if (active) {
    await pluginData.state.common.sendSuccessMessage(
      context,
      `Every time <@${member.id}> joins or switches VC in the next ${humanizeDuration(
        time,
      )} i will notify and move you.\nPlease make sure to be in a voice channel, otherwise i cannot move you!`,
    );
  } else {
    await pluginData.state.common.sendSuccessMessage(
      context,
      `Every time <@${member.id}> joins or switches VC in the next ${humanizeDuration(time)} i will notify you`,
    );
  }
}
