import type { Client } from "discord.js";
import { env } from "./env.js";
import { logger } from "./logger.js";

/**
 * Applies experimental Discord display-name style fields (font / effect / colors)
 * to this bot's own guild member profile via REST PATCH.
 *
 * These are not part of the official Discord.js API surface and may fail without
 * the relevant entitlement, or if Discord changes/removes the fields.
 */

type FlatStylePayload = {
  display_name_font_id: number;
  display_name_effect_id: number;
  display_name_colors: number[];
};

type NestedStylePayload = {
  display_name_styles: {
    font_id: number;
    effect_id: number;
    colors: number[];
  };
};

const SNOWFLAKE_RE = /^\d{16,20}$/;

/** Resolve one or more guild IDs from env (comma-separated) or the first cached guild. */
function resolveGuildIds(client: Client): string[] {
  if (env.BOT_DISPLAY_NAME_STYLE_GUILD_ID) {
    return env.BOT_DISPLAY_NAME_STYLE_GUILD_ID.split(",")
      .map((s) => s.trim())
      .filter((id) => SNOWFLAKE_RE.test(id));
  }

  const first = client.guilds.cache.first()?.id;
  return first ? [first] : [];
}

function styleLooksApplied(
  body: unknown,
  fontId: number,
  effectId: number,
): boolean {
  if (!body || typeof body !== "object") {
    return false;
  }

  const obj = body as Record<string, unknown>;

  if (obj.display_name_font_id === fontId && obj.display_name_effect_id === effectId) {
    return true;
  }

  const nested = obj.display_name_styles;
  if (nested && typeof nested === "object") {
    const styles = nested as Record<string, unknown>;
    if (styles.font_id === fontId && styles.effect_id === effectId) {
      return true;
    }
  }

  const user = obj.user;
  if (user && typeof user === "object") {
    const userStyles = (user as Record<string, unknown>).display_name_styles;
    if (userStyles && typeof userStyles === "object") {
      const styles = userStyles as Record<string, unknown>;
      if (styles.font_id === fontId && styles.effect_id === effectId) {
        return true;
      }
    }
  }

  return false;
}

function discordErrorSummary(json: unknown): string {
  if (!json || typeof json !== "object") {
    return "";
  }
  const obj = json as Record<string, unknown>;
  const code = obj.code;
  const message = typeof obj.message === "string" ? obj.message : "";
  return JSON.stringify({
    code,
    message: message.slice(0, 200),
    hasErrors: obj.errors != null,
  });
}

async function patchCurrentMember(
  guildId: string,
  payload: FlatStylePayload | NestedStylePayload,
): Promise<{ ok: boolean; status: number; json: unknown }> {
  const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/@me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bot ${env.BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let json: unknown = null;
  try {
    const text = await res.text();
    if (text) {
      json = JSON.parse(text);
    }
  } catch {
    // Response body may be empty or non-JSON; ignore parse errors.
  }

  return { ok: res.ok, status: res.status, json };
}

function logPatchOutcome(
  guildId: string,
  shape: "flat" | "nested",
  result: { ok: boolean; status: number; json: unknown },
  fontId: number,
  effectId: number,
): void {
  if (!result.ok) {
    const detail = discordErrorSummary(result.json);
    logger.warn(
      `Bot display name style ${shape} PATCH failed (status ${result.status}) for guild ${guildId}${detail ? `: ${detail}` : ""}`,
    );
    return;
  }

  if (styleLooksApplied(result.json, fontId, effectId)) {
    logger.info(`Bot display name style applied (confirmed, ${shape}) for guild ${guildId}`);
  } else {
    logger.info(
      `Bot display name style PATCH succeeded (status ${result.status}, ${shape}) for guild ${guildId}`,
    );
  }
}

async function applyStyleToGuild(
  guildId: string,
  fontId: number,
  effectId: number,
  colors: number[],
): Promise<boolean> {
  const flatPayload: FlatStylePayload = {
    display_name_font_id: fontId,
    display_name_effect_id: effectId,
    display_name_colors: colors,
  };

  const flatResult = await patchCurrentMember(guildId, flatPayload);
  const flatVerified = flatResult.ok && styleLooksApplied(flatResult.json, fontId, effectId);

  if (flatVerified) {
    logPatchOutcome(guildId, "flat", flatResult, fontId, effectId);
    return true;
  }

  const nestedPayload: NestedStylePayload = {
    display_name_styles: {
      font_id: fontId,
      effect_id: effectId,
      colors,
    },
  };

  const nestedResult = await patchCurrentMember(guildId, nestedPayload);

  if (nestedResult.ok) {
    logPatchOutcome(guildId, "nested", nestedResult, fontId, effectId);
    return true;
  }

  if (flatResult.ok) {
    logPatchOutcome(guildId, "flat", flatResult, fontId, effectId);
    return true;
  }

  logger.warn(
    `Bot display name style skipped: both flat (${flatResult.status}) and nested (${nestedResult.status}) PATCH failed for guild ${guildId}`,
  );
  return false;
}

export async function applyBotDisplayNameStyle(client: Client): Promise<void> {
  if (!env.BOT_DISPLAY_NAME_STYLE_ENABLED) {
    return;
  }

  try {
    const guildIds = resolveGuildIds(client);
    if (guildIds.length === 0) {
      logger.warn("Bot display name style: no valid guild id available, skipping");
      return;
    }

    const fontId = env.BOT_DISPLAY_NAME_STYLE_FONT_ID;
    const effectId = env.BOT_DISPLAY_NAME_STYLE_EFFECT_ID;
    const colors = env.BOT_DISPLAY_NAME_STYLE_COLORS;

    let anyOk = false;
    for (const guildId of guildIds) {
      const ok = await applyStyleToGuild(guildId, fontId, effectId, colors);
      anyOk = anyOk || ok;
    }

    if (!anyOk) {
      logger.warn(`Bot display name style: no guild succeeded (${guildIds.length} attempted)`);
    }
  } catch (err: any) {
    logger.warn(`Bot display name style skipped: ${err?.message ?? err}`);
  }
}
