import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  GuildMember,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { GuildPluginData } from "vety";
import { buildCustomId } from "../../../utils/buildCustomId.js";
import { generateCaptchaCode, renderCaptchaPng } from "./captcha.js";
import { VerifyPluginType } from "../types.js";

export async function grantVerifiedRole(
  pluginData: GuildPluginData<VerifyPluginType>,
  member: GuildMember,
): Promise<boolean> {
  const config = pluginData.config.get();
  if (!config.verified_role_id) return false;

  if (config.unverified_role_id && member.roles.cache.has(config.unverified_role_id)) {
    await member.roles.remove(config.unverified_role_id).catch(() => null);
  }
  await member.roles.add(config.verified_role_id).catch(() => null);
  pluginData.state.challenges.delete(member.id);
  return true;
}

export function getActiveChallenge(pluginData: GuildPluginData<VerifyPluginType>, userId: string) {
  const challenge = pluginData.state.challenges.get(userId);
  if (!challenge) return null;
  if (Date.now() > challenge.expiresAt) {
    pluginData.state.challenges.delete(userId);
    return null;
  }
  return challenge;
}

export function startCaptchaChallenge(pluginData: GuildPluginData<VerifyPluginType>, userId: string): string {
  const config = pluginData.config.get();
  const existing = getActiveChallenge(pluginData, userId);
  const code = generateCaptchaCode(config.captcha_length);
  pluginData.state.challenges.set(userId, {
    code,
    attempts: existing?.attempts ?? 0,
    expiresAt: Date.now() + config.captcha_ttl_seconds * 1000,
  });
  return code;
}

export function buildCaptchaAttachment(code: string): AttachmentBuilder {
  return new AttachmentBuilder(renderCaptchaPng(code), { name: "captcha.png" });
}

export function buildCaptchaPrompt(attemptsLeft: number) {
  const embed = new EmbedBuilder()
    .setTitle("Complete the captcha")
    .setDescription(
      `Solve the captcha image below, then click **Enter code**.\n\nAttempts left: **${attemptsLeft}**`,
    )
    .setImage("attachment://captcha.png")
    .setColor(0x5865f2);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId("verify", { action: "enter" }))
      .setLabel("Enter code")
      .setStyle(ButtonStyle.Secondary),
  );

  return { embeds: [embed], components: [row], files: [] as AttachmentBuilder[] };
}

export function buildVerifyModal() {
  const modal = new ModalBuilder()
    .setCustomId(buildCustomId("verify", { action: "modal" }))
    .setTitle("Verification captcha");
  const input = new TextInputBuilder()
    .setCustomId("captcha_answer")
    .setLabel("Enter the captcha code")
    .setStyle(TextInputStyle.Short)
    .setMinLength(4)
    .setMaxLength(8)
    .setRequired(true);
  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
  return modal;
}

export function buildVerifyPanel(pluginData: GuildPluginData<VerifyPluginType>) {
  const config = pluginData.config.get();
  const embed = new EmbedBuilder()
    .setTitle("Verification")
    .setDescription(
      config.mode === "captcha"
        ? "Click **Verify** to receive a captcha image, then enter the code to unlock the server."
        : "Click **Verify** to get access to the server.",
    )
    .setColor(0x5865f2);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId("verify", { action: "start" }))
      .setLabel("Verify")
      .setStyle(ButtonStyle.Primary),
  );

  return { embeds: [embed], components: [row] };
}

export async function deliverJoinCaptcha(
  pluginData: GuildPluginData<VerifyPluginType>,
  member: GuildMember,
): Promise<void> {
  const config = pluginData.config.get();
  if (!config.enabled || config.mode !== "captcha" || !config.challenge_on_join) return;

  const code = startCaptchaChallenge(pluginData, member.id);
  const attachment = buildCaptchaAttachment(code);

  const embed = new EmbedBuilder()
    .setTitle("Complete the captcha")
    .setDescription(
      `Welcome to **${pluginData.guild.name}**!\n\nSolve the captcha image, then submit the code in the server with \`/verify submit\` or \`!verify <code>\`.\n\nAttempts allowed: **${config.max_attempts}**`,
    )
    .setImage("attachment://captcha.png")
    .setColor(0x5865f2);

  await member
    .send({
      embeds: [embed],
      files: [attachment],
    })
    .catch(async () => {
      // DMs closed — nudge in verify channel if configured
      if (!config.channel_id) return;
      const channel = pluginData.guild.channels.cache.get(config.channel_id);
      if (!channel?.isTextBased() || !channel.isSendable()) return;
      await channel
        .send({
          content: `${member}, I couldn't DM you — use the Verify panel in this channel.`,
        })
        .catch(() => null);
    });
}
