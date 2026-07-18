import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
  Message,
  PermissionFlagsBits,
} from "discord.js";
import { GuildPluginData } from "vety";
import { parseCustomId } from "../../../utils/parseCustomId.js";
import { errorPanel, successPanel } from "../../../utils/xeonStylePanels.js";
import { nowStamp } from "../commands/actualBotProfileCmds.js";
import { applyBotProfile } from "../functions/applyBotProfile.js";
import {
  BOT_PROFILE_NS,
  buildCustomBotPanel,
  buildProfileModal,
} from "../functions/buildCustomBotPanel.js";
import { fetchImageBuffer } from "../functions/fetchImageBuffer.js";
import { BotProfilePluginType, botProfileEvt } from "../types.js";

async function canManage(
  pluginData: GuildPluginData<BotProfilePluginType>,
  member: GuildMember | null,
): Promise<boolean> {
  if (!member?.permissions.has(PermissionFlagsBits.ManageGuild)) return false;
  const config = await pluginData.config.getForMember(member);
  return Boolean(config.enabled && config.can_manage);
}

async function replyError(
  interaction: { reply: (opts: object) => Promise<unknown>; replied: boolean; deferred: boolean },
  title: string,
  body: string,
): Promise<void> {
  const payload = { ephemeral: true, ...errorPanel({ title, body }) };
  if (interaction.replied || interaction.deferred) {
    // followUp is available on interactions that support it; callers only use replyable ones
    await (interaction as any).followUp(payload).catch(() => null);
  } else {
    await interaction.reply(payload).catch(() => null);
  }
}

async function refreshPanelMessage(
  pluginData: GuildPluginData<BotProfilePluginType>,
  message: Message | null | undefined,
  authorId: string,
): Promise<void> {
  if (!message?.editable) return;
  const cfg = await pluginData.state.botProfiles.get();
  await message.edit(buildCustomBotPanel(cfg, authorId, pluginData.guild.premiumTier)).catch(() => null);
}

export const BotProfileInteractionEvt = botProfileEvt({
  event: "interactionCreate",
  async listener({ pluginData, args: { interaction } }) {
    // ── Modal submit ──────────────────────────────────────────────
    if (interaction.isModalSubmit()) {
      const { namespace, data } = parseCustomId(interaction.customId);
      if (namespace !== BOT_PROFILE_NS) return;

      const authorId = data?.a as string | undefined;
      if (!authorId || interaction.user.id !== authorId) {
        await replyError(interaction, "Not allowed", "Only the command user can use this panel.");
        return;
      }

      const member =
        (interaction.member as GuildMember | null) ??
        (await pluginData.guild.members.fetch(interaction.user.id).catch(() => null));
      if (!(await canManage(pluginData, member))) {
        await replyError(
          interaction,
          "Missing permission",
          "You need **Manage Server** and bot profile manage access to customize the bot.",
        );
        return;
      }

      const action = String(data?.action ?? "");
      const value = interaction.fields.getTextInputValue("value").trim();
      const stamp = nowStamp();
      const panelMessage = interaction.message as Message | null;

      if (action === "modal_nick") {
        if (value.length < 1 || value.length > 32) {
          await replyError(interaction, "Invalid nickname", "Nickname must be 1–32 characters.");
          return;
        }
        try {
          await pluginData.guild.members.editMe({ nick: value, reason: "Alice custombot nickname" });
        } catch (err) {
          await replyError(interaction, "Update failed", `Couldn't update nickname: \`${String(err)}\``);
          return;
        }
        await pluginData.state.botProfiles.set({ nick: value, updated_at: stamp });
        await interaction.reply({
          ephemeral: true,
          ...successPanel({ title: "Nickname updated", body: `Nickname set to: \`${value}\`` }),
        });
        await refreshPanelMessage(pluginData, panelMessage, authorId);
        return;
      }

      if (action === "modal_bio") {
        if (value.length < 1 || value.length > 190) {
          await replyError(interaction, "Invalid bio", "Bio must be 1–190 characters.");
          return;
        }
        try {
          await pluginData.guild.members.editMe({ bio: value, reason: "Alice custombot bio" });
        } catch (err) {
          await replyError(interaction, "Update failed", `Couldn't update bio: \`${String(err)}\``);
          return;
        }
        await pluginData.state.botProfiles.set({ bio: value, updated_at: stamp });
        await interaction.reply({
          ephemeral: true,
          ...successPanel({ title: "Bio updated", body: "Server bio saved." }),
        });
        await refreshPanelMessage(pluginData, panelMessage, authorId);
        return;
      }

      if (action === "modal_avatar" || action === "modal_banner") {
        const kind = action === "modal_avatar" ? "avatar" : "banner";
        if (kind === "banner" && pluginData.guild.premiumTier < 2) {
          await replyError(
            interaction,
            "Boost Level 2 required",
            "This server needs **Discord Boost Level 2** to set a bot banner. " +
              "That is a Discord platform limit, not an Alice restriction.",
          );
          return;
        }

        const downloaded = await fetchImageBuffer(value);
        if (!downloaded.ok) {
          await replyError(interaction, "Invalid image", downloaded.error);
          return;
        }

        try {
          await pluginData.guild.members.editMe({
            [kind]: downloaded.buffer,
            reason: `Alice custombot ${kind}`,
          });
        } catch (err) {
          await replyError(interaction, "Update failed", `Couldn't update ${kind}: \`${String(err)}\``);
          return;
        }

        await pluginData.state.botProfiles.set({ [kind]: value, updated_at: stamp });
        await interaction.reply({
          ephemeral: true,
          ...successPanel({
            title: kind === "avatar" ? "Avatar updated" : "Banner updated",
            body: `**${kind[0]!.toUpperCase()}${kind.slice(1)}** saved for this server.`,
          }),
        });
        await refreshPanelMessage(pluginData, panelMessage, authorId);
        return;
      }

      return;
    }

    if (!interaction.isButton()) return;
    const { namespace, data } = parseCustomId(interaction.customId);
    if (namespace !== BOT_PROFILE_NS) return;

    const authorId = data?.a as string | undefined;
    if (!authorId || interaction.user.id !== authorId) {
      await replyError(interaction, "Not allowed", "Only the command user can use this panel.");
      return;
    }

    const member =
      (interaction.member as GuildMember | null) ??
      (await pluginData.guild.members.fetch(interaction.user.id).catch(() => null));
    if (!(await canManage(pluginData, member))) {
      await replyError(
        interaction,
        "Missing permission",
        "You need **Manage Server** and bot profile manage access to customize the bot.",
      );
      return;
    }

    const action = String(data?.action ?? "");

    if (action === "close") {
      await interaction.deferUpdate().catch(() => null);
      await interaction.message.delete().catch(() => null);
      return;
    }

    if (action === "nick" || action === "avatar" || action === "banner" || action === "bio") {
      if (action === "banner" && pluginData.guild.premiumTier < 2) {
        await replyError(
          interaction,
          "Boost Level 2 required",
          "This server needs **Discord Boost Level 2** to set a bot banner. " +
            "That is a Discord platform limit, not an Alice restriction.",
        );
        return;
      }
      await interaction.showModal(buildProfileModal(action, authorId));
      return;
    }

    if (action === "reset") {
      const confirmId = `bot_profile_reset_yes:${interaction.id}`;
      const cancelId = `bot_profile_reset_no:${interaction.id}`;
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(confirmId).setLabel("Confirm reset").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(cancelId).setLabel("Cancel").setStyle(ButtonStyle.Secondary),
      );

      await interaction.reply({
        ephemeral: true,
        ...errorPanel({
          title: "Reset CustomBot?",
          body: "This clears the saved nickname, avatar, banner, and bio for this server and resets the live profile.",
          footer: "Confirm to continue.",
        }),
        components: [row],
      });

      const reply = await interaction.fetchReply();
      const choice = await new Promise<"yes" | "no" | "timeout">((resolve) => {
        let settled = false;
        const finish = (value: "yes" | "no" | "timeout") => {
          if (settled) return;
          settled = true;
          resolve(value);
        };
        const collector = reply.createMessageComponentCollector({
          time: 15_000,
          filter: (i) => i.user.id === authorId && (i.customId === confirmId || i.customId === cancelId),
        });
        collector.on("collect", async (i) => {
          await i.deferUpdate().catch(() => null);
          finish(i.customId === confirmId ? "yes" : "no");
          collector.stop("chosen");
        });
        collector.on("end", (_c, reason) => {
          if (reason !== "chosen") finish("timeout");
        });
      });

      if (choice !== "yes") {
        await interaction.editReply({
          ...successPanel({ title: "Cancelled", body: "Reset cancelled." }),
          components: [],
        }).catch(() => null);
        return;
      }

      await pluginData.state.botProfiles.clear();
      await applyBotProfile(pluginData, null, { reset: true });

      await interaction.editReply({
        ...successPanel({
          title: "Reset complete",
          body: "All customizations cleared for this server.",
        }),
        components: [],
      }).catch(() => null);

      await refreshPanelMessage(pluginData, interaction.message, authorId);
    }
  },
});
