import {
  BasePluginType,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { CommonPlugin } from "../Common/CommonPlugin.js";

export const zSocialConfig = z.strictObject({
  enabled: z.boolean().default(true),
  can_use: z.boolean().default(true),
});

export interface SocialPluginType extends BasePluginType {
  configSchema: typeof zSocialConfig;
  state: {
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
  };
}

export const socialCmd = guildPluginMessageCommand<SocialPluginType>();
export const socialSlashGroup = guildPluginSlashGroup<SocialPluginType>();
export const socialSlashCmd = guildPluginSlashCommand<SocialPluginType>();
