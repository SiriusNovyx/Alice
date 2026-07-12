import { GuildMember } from "discord.js";
import { GuildPluginData } from "vety";
import { GenericCommandSource } from "../../../pluginUtils.js";
import {
  buildVerifyPanel,
  getActiveChallenge,
  grantVerifiedRole,
} from "../functions/verifyFlow.js";
import { VerifyPluginType } from "../types.js";

export async function actualSetupPanelCmd(
  pluginData: GuildPluginData<VerifyPluginType>,
  context: GenericCommandSource,
  channelId: string,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.enabled) {
    await pluginData.state.common.sendErrorMessage(context, "Enable the verify plugin in config first.");
    return;
  }
  const channel = pluginData.guild.channels.cache.get(channelId);
  if (!channel || !channel.isTextBased() || !channel.isSendable()) {
    await pluginData.state.common.sendErrorMessage(context, "Provide a valid text channel.");
    return;
  }
  await channel.send(buildVerifyPanel(pluginData));
  await pluginData.state.common.sendSuccessMessage(context, `Verification panel sent to <#${channelId}>.`);
}

export async function actualSubmitCmd(
  pluginData: GuildPluginData<VerifyPluginType>,
  context: GenericCommandSource,
  member: GuildMember,
  code: string,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.enabled || config.mode !== "captcha") {
    await pluginData.state.common.sendErrorMessage(context, "Captcha verification is not enabled.");
    return;
  }

  const challenge = getActiveChallenge(pluginData, member.id);
  if (!challenge) {
    await pluginData.state.common.sendErrorMessage(
      context,
      "No active captcha. Click **Verify** on the verification panel first.",
    );
    return;
  }

  if (code.trim().toUpperCase() !== challenge.code) {
    challenge.attempts += 1;
    if (challenge.attempts >= config.max_attempts) {
      pluginData.state.challenges.delete(member.id);
      if (config.kick_on_fail) {
        await member
          .send("You were kicked for failing verification too many times. You may rejoin and try again.")
          .catch(() => null);
        await member.kick("Failed verification — exceeded retry limit").catch(() => null);
      }
      await pluginData.state.common.sendErrorMessage(
        context,
        config.kick_on_fail
          ? "Too many failed attempts. You have been kicked."
          : "Too many failed attempts. Request a new captcha from the Verify panel.",
      );
      return;
    }
    pluginData.state.challenges.set(member.id, challenge);
    await pluginData.state.common.sendErrorMessage(
      context,
      `Incorrect code. Attempts left: ${config.max_attempts - challenge.attempts}.`,
    );
    return;
  }

  const ok = await grantVerifiedRole(pluginData, member);
  await pluginData.state.common.sendSuccessMessage(
    context,
    ok ? "You have been verified." : "Verification role is not configured.",
  );
}
