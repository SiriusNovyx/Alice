import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { applyAllRoleButtons } from "../functions/applyAllRoleButtons.js";
import { RoleButtonsPluginType } from "../types.js";

export async function actualResetButtonsCmd(
  pluginData: GuildPluginData<RoleButtonsPluginType>,
  context: Message | ChatInputCommandInteraction,
  name: string,
) {
  const config = pluginData.config.get();
  if (!config.buttons[name]) {
    await pluginData.state.common.sendErrorMessage(context, `Can't find role buttons with the name "${name}"`);
    return;
  }

  await pluginData.state.roleButtons.deleteRoleButtonItem(name);
  await applyAllRoleButtons(pluginData);
  await pluginData.state.common.sendSuccessMessage(context, "Done!");
}
