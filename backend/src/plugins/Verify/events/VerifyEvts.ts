import { GuildMember } from "discord.js";
import { parseCustomId } from "../../../utils/parseCustomId.js";
import {
  buildCaptchaAttachment,
  buildCaptchaPrompt,
  buildVerifyModal,
  deliverJoinCaptcha,
  getActiveChallenge,
  grantVerifiedRole,
  startCaptchaChallenge,
} from "../functions/verifyFlow.js";
import { verifyEvt } from "../types.js";

export const MemberAddEvt = verifyEvt({
  event: "guildMemberAdd",
  async listener({ pluginData, args: { member } }) {
    const config = pluginData.config.get();
    if (!config.enabled) return;

    if (config.unverified_role_id) {
      await member.roles.add(config.unverified_role_id).catch(() => null);
    }

    await deliverJoinCaptcha(pluginData, member);
  },
});

export const VerifyInteractionEvt = verifyEvt({
  event: "interactionCreate",
  async listener({ pluginData, args: { interaction } }) {
    const config = pluginData.config.get();

    // ── Modal submit ──────────────────────────────────────────────
    if (interaction.isModalSubmit()) {
      const { namespace, data } = parseCustomId(interaction.customId);
      if (namespace !== "verify" || data?.action !== "modal") return;

      if (!config.enabled || config.mode !== "captcha") {
        await interaction.reply({ ephemeral: true, content: "Captcha verification is not enabled." });
        return;
      }

      const member =
        (interaction.member as GuildMember | null) ??
        (await pluginData.guild.members.fetch(interaction.user.id).catch(() => null));
      if (!member) {
        await interaction.reply({ ephemeral: true, content: "Could not resolve member." });
        return;
      }

      const challenge = getActiveChallenge(pluginData, member.id);
      if (!challenge) {
        await interaction.reply({
          ephemeral: true,
          content: "No active captcha (or it expired). Click Verify again.",
        });
        return;
      }

      const answer = interaction.fields.getTextInputValue("captcha_answer").trim().toUpperCase();
      if (answer === challenge.code) {
        const ok = await grantVerifiedRole(pluginData, member);
        await interaction.reply({
          ephemeral: true,
          content: ok ? "You have been verified." : "Verification role is not configured.",
        });
        return;
      }

      challenge.attempts += 1;
      if (challenge.attempts >= config.max_attempts) {
        pluginData.state.challenges.delete(member.id);
        if (config.kick_on_fail) {
          await member
            .send("You were kicked for failing verification too many times. You may rejoin and try again.")
            .catch(() => null);
          await member.kick("Failed verification — exceeded retry limit").catch(() => null);
        }
        await interaction.reply({
          ephemeral: true,
          content: config.kick_on_fail
            ? "Too many failed attempts. You have been kicked."
            : "Too many failed attempts. Click Verify to request a new captcha.",
        });
        return;
      }

      pluginData.state.challenges.set(member.id, challenge);
      const code = startCaptchaChallenge(pluginData, member.id);
      const attachment = buildCaptchaAttachment(code);
      const prompt = buildCaptchaPrompt(config.max_attempts - challenge.attempts);
      await interaction.reply({
        ephemeral: true,
        content: `Incorrect code. Attempts left: **${config.max_attempts - challenge.attempts}**.`,
        embeds: prompt.embeds,
        components: prompt.components,
        files: [attachment],
      });
      return;
    }

    if (!interaction.isButton()) return;
    const { namespace, data } = parseCustomId(interaction.customId);
    if (namespace !== "verify") return;

    if (!config.enabled) {
      await interaction.reply({ ephemeral: true, content: "Verification is disabled." });
      return;
    }

    const member = interaction.member as GuildMember | null;
    if (!member) {
      await interaction.reply({ ephemeral: true, content: "Could not resolve member." });
      return;
    }

    // ── Enter code → show modal ───────────────────────────────────
    if (data?.action === "enter") {
      if (config.mode !== "captcha") {
        await interaction.reply({ ephemeral: true, content: "Captcha mode is not enabled." });
        return;
      }
      if (!getActiveChallenge(pluginData, member.id)) {
        await interaction.reply({
          ephemeral: true,
          content: "No active captcha. Click Verify first.",
        });
        return;
      }
      await interaction.showModal(buildVerifyModal());
      return;
    }

    if (data?.action !== "start") return;

    if (config.mode === "button") {
      const ok = await grantVerifiedRole(pluginData, member);
      await interaction.reply({
        ephemeral: true,
        content: ok ? "You have been verified." : "Verification role is not configured.",
      });
      return;
    }

    const code = startCaptchaChallenge(pluginData, member.id);
    const challenge = getActiveChallenge(pluginData, member.id)!;
    const attachment = buildCaptchaAttachment(code);
    const prompt = buildCaptchaPrompt(config.max_attempts - challenge.attempts);
    await interaction.reply({
      ephemeral: true,
      embeds: prompt.embeds,
      components: prompt.components,
      files: [attachment],
    });
  },
});
