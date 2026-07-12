import {
  BasePluginType,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { CommonPlugin } from "../Common/CommonPlugin.js";

export const zFunConfig = z.strictObject({
  enabled: z.boolean().default(true),
  can_use: z.boolean().default(true),
});

export interface FunPluginType extends BasePluginType {
  configSchema: typeof zFunConfig;
  state: {
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
  };
}

export const funCmd = guildPluginMessageCommand<FunPluginType>();
export const funSlashGroup = guildPluginSlashGroup<FunPluginType>();
export const funSlashCmd = guildPluginSlashCommand<FunPluginType>();
