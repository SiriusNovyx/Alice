import { slashOptions } from "vety";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { endPanicMode, triggerPanicMode } from "../functions/antiNukeHelpers.js";
import { antiNukeCmd, antiNukeSlashCmd } from "../types.js";

export const AnPanicCmd = antiNukeCmd({
  trigger: ["an-panic", "antinuke-panic"],
  usage: "!an-panic <on|off> [reason]",
  permission: "can_manage",
  signature: {
    mode: ct.string(),
    reason: ct.string({ catchAll: true, required: false }),
  },
  async run({ message: msg, args, pluginData }) {
    const on = ["on", "true", "1", "enable"].includes(args.mode.toLowerCase());
    if (on) {
      if (pluginData.state.panic) {
        await pluginData.state.common.sendErrorMessage(msg, "Panic mode is already active.");
        return;
      }
      await triggerPanicMode(pluginData, args.reason || "Manually triggered", msg.author.id);
      await pluginData.state.common.sendSuccessMessage(msg, "Panic mode enabled.");
    } else {
      if (!pluginData.state.panic) {
        await pluginData.state.common.sendErrorMessage(msg, "Panic mode is not active.");
        return;
      }
      await endPanicMode(pluginData, msg.author.id);
      await pluginData.state.common.sendSuccessMessage(msg, "Panic mode disabled; permissions restored where possible.");
    }
  },
});

export const AnWhitelistCmd = antiNukeCmd({
  trigger: ["an-whitelist"],
  usage: "!an-whitelist <user>",
  permission: "can_manage",
  signature: { user: ct.user() },
  async run({ message: msg, args, pluginData }) {
    await pluginData.state.common.sendSuccessMessage(
      msg,
      `Add \`${args.user.id}\` to \`antinuke.config.whitelist_user_ids\` in YAML (runtime config is not auto-written).`,
    );
  },
});

export const AnPanicSlashCmd = antiNukeSlashCmd({
  name: "panic",
  configPermission: "can_manage",
  description: "Enable or disable panic mode (strip dangerous perms + lock sends)",
  allowDms: false,
  signature: [
    slashOptions.boolean({ name: "enabled", description: "Enable panic mode", required: true }),
    slashOptions.string({ name: "reason", description: "Reason", required: false }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    if (options.enabled) {
      if (pluginData.state.panic) {
        await pluginData.state.common.sendErrorMessage(interaction, "Panic mode is already active.");
        return;
      }
      await triggerPanicMode(pluginData, options.reason || "Manually triggered", interaction.user.id);
      await pluginData.state.common.sendSuccessMessage(interaction, "Panic mode enabled.");
    } else {
      if (!pluginData.state.panic) {
        await pluginData.state.common.sendErrorMessage(interaction, "Panic mode is not active.");
        return;
      }
      await endPanicMode(pluginData, interaction.user.id);
      await pluginData.state.common.sendSuccessMessage(
        interaction,
        "Panic mode disabled; permissions restored where possible.",
      );
    }
  },
});

export const AnStatusSlashCmd = antiNukeSlashCmd({
  name: "status",
  configPermission: "can_manage",
  description: "Show AntiNuke status",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const c = pluginData.config.get();
    await pluginData.state.common.sendSuccessMessage(
      interaction,
      [
        `enabled: **${c.enabled}**`,
        `panic: **${pluginData.state.panic}**`,
        `auto_panic_on_violation: **${c.auto_panic_on_violation}**`,
        `quarantine_role: ${c.quarantine_role_id ? `<@&${c.quarantine_role_id}>` : "none"}`,
        `whitelist users: ${c.whitelist_user_ids.length}, roles: ${c.whitelist_role_ids.length}`,
        `limits: channel=${c.channel_limit} role=${c.role_limit} ban=${c.ban_limit} kick=${c.kick_limit} / ${c.window_seconds}s`,
        "",
        "_Scoped to audit-log mass channel/role/ban/kick rates — not message Automod._",
      ].join("\n"),
    );
  },
});
