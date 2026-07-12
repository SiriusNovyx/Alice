import {
  BasePluginType,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { CommonPlugin } from "../Common/CommonPlugin.js";

export const zNsfwConfig = z.strictObject({
  enabled: z.boolean().default(false),
  can_use: z.boolean().default(true),
});

export interface NsfwPluginType extends BasePluginType {
  configSchema: typeof zNsfwConfig;
  state: {
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
  };
}

export const nsfwCmd = guildPluginMessageCommand<NsfwPluginType>();
export const nsfwSlashGroup = guildPluginSlashGroup<NsfwPluginType>();
export const nsfwSlashCmd = guildPluginSlashCommand<NsfwPluginType>();
