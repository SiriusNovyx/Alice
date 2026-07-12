import {
  BasePluginType,
  guildPluginEventListener,
  guildPluginMessageCommand,
  guildPluginSlashCommand,
  guildPluginSlashGroup,
  pluginUtils,
} from "vety";
import { z } from "zod";
import { zSnowflake } from "../../utils.js";
import { CommonPlugin } from "../Common/CommonPlugin.js";

export const zVerifyConfig = z.strictObject({
  enabled: z.boolean().default(false),
  verified_role_id: zSnowflake.nullable().default(null),
  unverified_role_id: zSnowflake.nullable().default(null),
  channel_id: zSnowflake.nullable().default(null),
  /** button = one-click role grant; captcha = image challenge + modal/code submit */
  mode: z.enum(["button", "captcha"]).default("button"),
  /** When true and mode is captcha, DM a challenge on join (panel still works). */
  challenge_on_join: z.boolean().default(false),
  captcha_length: z.number().int().min(4).max(8).default(5),
  captcha_ttl_seconds: z.number().int().min(60).max(900).default(300),
  max_attempts: z.number().int().min(1).max(10).default(3),
  kick_on_fail: z.boolean().default(false),
  can_setup: z.boolean().default(false),
  can_submit: z.boolean().default(true),
});

export type VerifyChallenge = {
  code: string;
  attempts: number;
  expiresAt: number;
};

export interface VerifyPluginType extends BasePluginType {
  configSchema: typeof zVerifyConfig;
  state: {
    common: pluginUtils.PluginPublicInterface<typeof CommonPlugin>;
    /** userId -> challenge */
    challenges: Map<string, VerifyChallenge>;
  };
}

export const verifyCmd = guildPluginMessageCommand<VerifyPluginType>();
export const verifySlashGroup = guildPluginSlashGroup<VerifyPluginType>();
export const verifySlashCmd = guildPluginSlashCommand<VerifyPluginType>();
export const verifyEvt = guildPluginEventListener<VerifyPluginType>();
