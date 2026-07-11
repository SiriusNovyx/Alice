import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { clearExpiringVCAlert } from "../../../data/loops/expiringVCAlertsLoop.js";
import { sorter } from "../../../utils.js";
import { LocateUserPluginType } from "../types.js";

export async function actualUnfollowCmd(
  pluginData: GuildPluginData<LocateUserPluginType>,
  context: Message | ChatInputCommandInteraction,
  userId: string,
  num: number,
) {
  const alerts = await pluginData.state.alerts.getAlertsByRequestorId(userId);
  alerts.sort(sorter("expires_at"));

  if (num > alerts.length || num <= 0) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown alert!");
    return;
  }

  const toDelete = alerts[num - 1];
  clearExpiringVCAlert(toDelete);
  await pluginData.state.alerts.delete(toDelete.id);

  await pluginData.state.common.sendSuccessMessage(context, "Alert deleted");
}
