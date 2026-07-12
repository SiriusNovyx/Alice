import { GuildPluginData } from "vety";
import { GenericCommandSource } from "../../../pluginUtils.js";
import { NsfwPluginType } from "../types.js";

const CATEGORY_MAP: Record<string, string[]> = {
  hentai: ["https://api.waifu.pics/nsfw/waifu", "https://nekos.best/api/v2/hentai"],
  neko: ["https://api.waifu.pics/nsfw/neko", "https://nekos.best/api/v2/neko"],
  waifu: ["https://api.waifu.pics/nsfw/waifu"],
  blowjob: ["https://api.waifu.pics/nsfw/blowjob"],
  trap: ["https://api.waifu.pics/nsfw/trap"],
};

async function fetchImageUrl(category: string): Promise<string | null> {
  const urls = CATEGORY_MAP[category] ?? CATEGORY_MAP.waifu!;
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data: any = await res.json();
      const image = data.url ?? data.results?.[0]?.url ?? null;
      if (typeof image === "string" && image.startsWith("http")) return image;
    } catch {
      // try next provider
    }
  }
  return null;
}

export async function requireNsfwChannel(
  pluginData: GuildPluginData<NsfwPluginType>,
  context: GenericCommandSource,
  channel: { nsfw?: boolean } | null,
): Promise<boolean> {
  if (!pluginData.config.get().enabled) {
    await pluginData.state.common.sendErrorMessage(context, "NSFW plugin is disabled.");
    return false;
  }
  if (!channel || !("nsfw" in channel) || !channel.nsfw) {
    await pluginData.state.common.sendErrorMessage(context, "This command only works in NSFW channels.");
    return false;
  }
  return true;
}

export async function actualNsfwImage(
  pluginData: GuildPluginData<NsfwPluginType>,
  context: GenericCommandSource,
  channel: { nsfw?: boolean } | null,
  category: string,
): Promise<void> {
  if (!(await requireNsfwChannel(pluginData, context, channel))) return;
  const key = category.toLowerCase();
  if (!CATEGORY_MAP[key]) {
    await pluginData.state.common.sendErrorMessage(
      context,
      `Unknown category. Try: ${Object.keys(CATEGORY_MAP).join(", ")}`,
    );
    return;
  }
  const url = await fetchImageUrl(key);
  if (!url) {
    await pluginData.state.common.sendErrorMessage(context, "Could not fetch an image right now.");
    return;
  }
  await pluginData.state.common.sendSuccessMessage(context, `${key}: ${url}`);
}
