import {
  GuildMember,
  Message,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import { GuildPluginData } from "vety";
import { TemplateParseError, TemplateSafeValueContainer, renderTemplate } from "../../../templateFormatter.js";
import {
  MessageContent,
  createChunkedMessage,
  renderRecursively,
  verboseChannelMention,
} from "../../../utils.js";
import {
  guildToTemplateSafeGuild,
  memberToTemplateSafeMember,
  userToTemplateSafeUser,
} from "../../../utils/templateSafeObjects.js";
import {
  errorPanel,
  infoPanel,
  PanelMessageOptions,
  successPanel,
} from "../../../utils/xeonStylePanels.js";
import { hasDiscordPermissions } from "../../../utils/hasDiscordPermissions.js";
import { DEFAULT_EMBED_WELCOME, resolveWelcomeContent } from "../functions/resolveWelcomeContent.js";
import { patchWelcomeConfig } from "../functions/patchWelcomeConfig.js";
import { WelcomeMessagePluginType } from "../types.js";

async function sendPanel(msg: Message, panel: PanelMessageOptions): Promise<void> {
  if (!msg.channel.isSendable()) return;
  await msg.channel.send(panel);
}

function buildTemplateValues(member: GuildMember) {
  return new TemplateSafeValueContainer({
    member: memberToTemplateSafeMember(member),
    user: userToTemplateSafeUser(member.user),
    guild: guildToTemplateSafeGuild(member.guild),
    memberCount: member.guild.memberCount ?? 0,
    userMention: (input: unknown) => {
      if (input && typeof input === "object" && "mention" in input) {
        return String((input as { mention: string }).mention);
      }
      return "";
    },
  });
}

export async function formatWelcomeContent(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  member: GuildMember,
): Promise<{ ok: true; formatted: MessageContent } | { ok: false; error: string }> {
  const config = pluginData.config.get();
  const raw = resolveWelcomeContent(config);
  if (raw == null) {
    return { ok: false, error: "No welcome message configured." };
  }

  const templateValues = buildTemplateValues(member);
  const renderMessageText = (str: string) => renderTemplate(str, templateValues);

  try {
    const formatted =
      typeof raw === "string"
        ? await renderMessageText(raw)
        : ((await renderRecursively(raw, renderMessageText)) as MessageContent);
    return { ok: true, formatted };
  } catch (e) {
    if (e instanceof TemplateParseError) {
      return { ok: false, error: `Template error: ${e.message}` };
    }
    throw e;
  }
}

async function sendFormattedWelcome(
  channel: TextChannel,
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  formatted: MessageContent,
  deleteAfterSec: number | null | undefined,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (
    !hasDiscordPermissions(
      channel.permissionsFor(pluginData.client.user!.id),
      PermissionsBitField.Flags.SendMessages | PermissionsBitField.Flags.ViewChannel,
    )
  ) {
    return { ok: false, error: `Missing permissions in ${verboseChannelMention(channel)}` };
  }

  if (
    typeof formatted === "object" &&
    formatted.embeds &&
    formatted.embeds.length > 0 &&
    !hasDiscordPermissions(
      channel.permissionsFor(pluginData.client.user!.id),
      PermissionsBitField.Flags.EmbedLinks,
    )
  ) {
    return {
      ok: false,
      error: `Missing Embed Links permission in ${verboseChannelMention(channel)}`,
    };
  }

  let sentMessage: Message | null = null;
  try {
    if (typeof formatted === "string") {
      // Prefer a single send so delete_after can target the welcome message.
      if (formatted.length <= 2000) {
        sentMessage = await channel.send({
          content: formatted,
          allowedMentions: { parse: ["users"] },
        });
      } else {
        await createChunkedMessage(channel, formatted, { parse: ["users"] });
      }
    } else {
      sentMessage = await channel.send({
        ...formatted,
        allowedMentions: { parse: ["users"] },
      });
    }
  } catch {
    return { ok: false, error: `Failed to send welcome message in ${verboseChannelMention(channel)}` };
  }

  const seconds = deleteAfterSec && deleteAfterSec > 0 ? deleteAfterSec : 0;
  if (seconds > 0 && sentMessage) {
    setTimeout(() => {
      void sentMessage!.delete().catch(() => null);
    }, seconds * 1000);
  }

  return { ok: true };
}

export async function actualGreetHelpCmd(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  msg: Message,
) {
  const prefix = pluginData.fullConfig.prefix || "!";
  await sendPanel(
    msg,
    infoPanel({
      title: "Welcome / Greet",
      body: [
        `\`${prefix}greet setup #channel\` — Quick setup with embed template`,
        `\`${prefix}greet channel #channel\` — Set welcome channel`,
        `\`${prefix}greet content <text>\` — Plain text with the embed`,
        `\`${prefix}greet title <text>\` — Embed title`,
        `\`${prefix}greet description <text>\` — Embed description`,
        `\`${prefix}greet color <#hex>\` — Embed accent color`,
        `\`${prefix}greet thumbnail <url>\` — Embed thumbnail`,
        `\`${prefix}greet image <url>\` — Embed image`,
        `\`${prefix}greet message <text>\` — Simple plain-text mode`,
        `\`${prefix}greet deleteafter <sec>\` — Auto-delete (0 = off)`,
        `\`${prefix}greet test\` — Send a test welcome here`,
        `\`${prefix}greet config\` — Show current settings`,
        `\`${prefix}greet variables\` — Template variables`,
        `\`${prefix}greet disable\` — Turn off welcome messages`,
      ].join("\n"),
      footer: "Alice is free for all guilds. True Components V2 welcome containers are deferred until builders are adopted.",
    }),
  );
}

export async function actualGreetConfigCmd(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  msg: Message,
) {
  const config = pluginData.config.get();
  const channelMention = config.send_to_channel
    ? `<#${config.send_to_channel}>`
    : "*(not set)*";
  const status = config.enabled ? "Enabled" : "Disabled";
  const deleteAfter =
    config.delete_after && config.delete_after > 0 ? `${config.delete_after}s` : "Never";

  const body = [
    `**Status:** ${status}`,
    `**Channel:** ${channelMention}`,
    `**DM:** ${config.send_dm ? "yes" : "no"}`,
    `**Auto-delete:** ${deleteAfter}`,
    `**Content:** ${config.content ?? "*(not set)*"}`,
    `**Title:** ${config.embed_title ?? "*(not set)*"}`,
    `**Description:** ${config.embed_description ? `\`${config.embed_description.slice(0, 200)}\`` : "*(not set)*"}`,
    `**Color:** ${config.embed_color ?? "*(default)*"}`,
    `**Thumbnail:** ${config.embed_thumbnail ?? "*(not set)*"}`,
    `**Image:** ${config.embed_image ?? "*(not set)*"}`,
    `**Simple message:** ${
      config.message == null
        ? "*(not set)*"
        : typeof config.message === "string"
          ? `\`${config.message.slice(0, 200)}\``
          : "*(embed/object)*"
    }`,
  ].join("\n");

  await sendPanel(
    msg,
    infoPanel({
      title: "Welcome Configuration",
      body,
      footer: "Use !greet variables for template placeholders. Components V2 containers are deferred.",
    }),
  );
}

export async function actualGreetVariablesCmd(msg: Message) {
  await sendPanel(
    msg,
    infoPanel({
      title: "Welcome template variables",
      body: [
        "Use these in message, content, title, description, thumbnail, and image fields:",
        "",
        "`{member.mention}` — ping the new member",
        "`{member.username}` / `{user.username}` — username",
        "`{member.id}` / `{user.id}` — user ID",
        "`{member.avatarURL}` / `{user.avatarURL}` — avatar URL",
        "`{member.guildAvatarURL}` — server avatar URL",
        "`{guild.name}` / `{guild.id}` — server",
        "`{memberCount}` — current member count",
        "`{userMention(member)}` — same as `{member.mention}`",
      ].join("\n"),
      footer: "Alice template syntax — free for all guilds.",
    }),
  );
}

export async function actualGreetTestCmd(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  msg: Message,
) {
  if (!msg.member || !msg.channel.isTextBased() || msg.channel.isDMBased()) return;
  const channel = msg.channel as TextChannel;

  const formatted = await formatWelcomeContent(pluginData, msg.member);
  if (!formatted.ok) {
    await sendPanel(msg, errorPanel({ title: "Welcome test failed", body: formatted.error }));
    return;
  }

  const result = await sendFormattedWelcome(
    channel,
    pluginData,
    formatted.formatted,
    pluginData.config.get().delete_after,
  );
  if (!result.ok) {
    await sendPanel(msg, errorPanel({ title: "Welcome test failed", body: result.error }));
    return;
  }

  await pluginData.state.common.sendSuccessMessage(msg, "Test welcome sent.");
}

async function applyPatch(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  msg: Message,
  patch: Record<string, unknown>,
  successBody: string,
) {
  const result = await patchWelcomeConfig(pluginData, patch, msg.author.id);
  if (!result.ok) {
    await sendPanel(msg, errorPanel({ title: "Could not update welcome config", body: result.error }));
    return;
  }
  await sendPanel(msg, successPanel({ title: "Welcome updated", body: successBody }));
}

export async function actualGreetSetupCmd(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  msg: Message,
  channelId: string,
) {
  const config = pluginData.config.get();
  const patch: Record<string, unknown> = {
    enabled: true,
    send_to_channel: channelId,
    send_dm: false,
  };

  const hasAnyTemplate =
    config.message != null ||
    config.content != null ||
    config.embed_title != null ||
    config.embed_description != null;

  if (!hasAnyTemplate) {
    Object.assign(patch, DEFAULT_EMBED_WELCOME);
    patch.message = null;
  }

  await applyPatch(
    pluginData,
    msg,
    patch,
    `Welcome channel set to <#${channelId}>.${
      hasAnyTemplate ? "" : " Applied the default embed template."
    } Use \`!greet test\` to preview.`,
  );
}

export async function actualGreetChannelCmd(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  msg: Message,
  channelId: string,
) {
  await applyPatch(pluginData, msg, { enabled: true, send_to_channel: channelId }, `Channel set to <#${channelId}>.`);
}

export async function actualGreetContentCmd(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  msg: Message,
  text: string,
) {
  await applyPatch(pluginData, msg, { content: text }, "Content updated.");
}

export async function actualGreetTitleCmd(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  msg: Message,
  text: string,
) {
  await applyPatch(pluginData, msg, { embed_title: text }, "Embed title updated.");
}

export async function actualGreetDescriptionCmd(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  msg: Message,
  text: string,
) {
  await applyPatch(pluginData, msg, { embed_description: text }, "Embed description updated.");
}

export async function actualGreetColorCmd(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  msg: Message,
  color: string,
) {
  const hex = color.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    await sendPanel(
      msg,
      errorPanel({ title: "Invalid color", body: "Use a 6-digit hex color, e.g. `#5865F2`." }),
    );
    return;
  }
  await applyPatch(pluginData, msg, { embed_color: `#${hex.toUpperCase()}` }, `Color set to \`#${hex.toUpperCase()}\`.`);
}

export async function actualGreetThumbnailCmd(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  msg: Message,
  url: string,
) {
  await applyPatch(pluginData, msg, { embed_thumbnail: url }, "Thumbnail updated.");
}

export async function actualGreetImageCmd(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  msg: Message,
  url: string,
) {
  await applyPatch(pluginData, msg, { embed_image: url }, "Image updated.");
}

export async function actualGreetMessageCmd(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  msg: Message,
  text: string,
) {
  await applyPatch(
    pluginData,
    msg,
    {
      message: text,
      content: null,
      embed_title: null,
      embed_description: null,
      embed_color: null,
      embed_thumbnail: null,
      embed_image: null,
    },
    "Simple message mode enabled (embed template fields cleared).",
  );
}

export async function actualGreetDeleteAfterCmd(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  msg: Message,
  seconds: number,
) {
  const value = seconds <= 0 ? null : seconds;
  await applyPatch(
    pluginData,
    msg,
    { delete_after: value },
    value == null ? "Auto-delete disabled." : `Welcome messages will delete after **${value}** seconds.`,
  );
}

export async function actualGreetDisableCmd(
  pluginData: GuildPluginData<WelcomeMessagePluginType>,
  msg: Message,
) {
  await applyPatch(
    pluginData,
    msg,
    { enabled: false, send_to_channel: null, send_dm: false },
    "Welcome messages disabled.",
  );
}
