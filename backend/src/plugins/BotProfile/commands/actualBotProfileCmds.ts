import moment from "moment-timezone";
import { GuildPluginData } from "vety";
import { GenericCommandSource, sendContextResponse } from "../../../pluginUtils.js";
import { errorPanel } from "../../../utils/xeonStylePanels.js";
import { BotProfilePluginType } from "../types.js";
import { buildCustomBotPanel } from "../functions/buildCustomBotPanel.js";

export async function actualCustomBotCmd(
  pluginData: GuildPluginData<BotProfilePluginType>,
  context: GenericCommandSource,
  authorId: string,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.enabled) {
    await sendContextResponse(
      context,
      errorPanel({
        title: "CustomBot unavailable",
        body: "Bot profile customization is disabled for this server.",
      }),
      true,
    );
    return;
  }

  const cfg = await pluginData.state.botProfiles.get();
  const panel = buildCustomBotPanel(cfg, authorId, pluginData.guild.premiumTier);
  await sendContextResponse(context, panel, false);
}

export function nowStamp(): string {
  return moment.utc().format("YYYY-MM-DD HH:mm:ss");
}
