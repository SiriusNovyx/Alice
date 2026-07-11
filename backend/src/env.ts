import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { rootDir } from "./paths.js";

const envType = z.object({
  KEY: z.string().length(32),

  CLIENT_ID: z.string().min(16),
  CLIENT_SECRET: z.string().length(32),
  BOT_TOKEN: z.string().min(50),

  DASHBOARD_URL: z.string().url(),
  API_URL: z.string().url(),

  STAFF: z
    .preprocess(
      (v) =>
        String(v)
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== ""),
      z.array(z.string()),
    )
    .optional(),

  DEFAULT_ALLOWED_SERVERS: z
    .preprocess(
      (v) =>
        String(v)
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== ""),
      z.array(z.string()),
    )
    .optional(),

  PHISHERMAN_API_KEY: z.string().optional(),
  FISHFISH_API_KEY: z.string().optional(),

  DEFAULT_SUCCESS_EMOJI: z.string().optional().default("✅"),
  DEFAULT_ERROR_EMOJI: z.string().optional().default("❌"),

  DB_HOST: z.string().optional(),
  DB_PORT: z.preprocess((v) => Number(v), z.number()).optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_DATABASE: z.string().optional(),

  REDIS_URL: z.string().default("redis://redis:6379"),

  DEVELOPMENT_MYSQL_PASSWORD: z.string().optional(),

  API_PATH_PREFIX: z.string().optional(),

  DEBUG: z
    .string()
    .optional()
    .transform((str) => str === "true"),

  NODE_ENV: z.string().default("development"),

  BOT_DISPLAY_NAME_STYLE_ENABLED: z
    .string()
    .optional()
    .default("false")
    .transform((str) => str === "true"),

  BOT_DISPLAY_NAME_STYLE_GUILD_ID: z.string().optional(),

  BOT_DISPLAY_NAME_STYLE_FONT_ID: z.preprocess(
    (v) => (v === undefined || v === "" ? 10 : Number(v)),
    z.number().int().min(1).max(12),
  ),

  BOT_DISPLAY_NAME_STYLE_EFFECT_ID: z.preprocess(
    (v) => (v === undefined || v === "" ? 3 : Number(v)),
    z.number().int().min(1).max(6),
  ),

  BOT_DISPLAY_NAME_STYLE_COLORS: z.preprocess((v) => {
    const raw = v === undefined || v === "" ? "16777215" : String(v);
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map((s) => Number(s));
  }, z.array(z.number().int()).min(1).max(2)),
});

let toValidate = { ...process.env };
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
  const buf = fs.readFileSync(envPath);
  toValidate = { ...toValidate, ...dotenv.parse(buf) };
}

export const env = envType.parse(toValidate);
