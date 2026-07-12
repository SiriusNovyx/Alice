export type SocialGifResult = { url: string; provider: string };

type Provider = {
  name: string;
  categories: string[];
  buildUrl: (category: string) => string;
  parse: (data: any) => string | undefined;
};

const PROVIDERS: Provider[] = [
  {
    name: "waifu.pics",
    categories: [
      "hug",
      "kiss",
      "pat",
      "slap",
      "cuddle",
      "smug",
      "blush",
      "dance",
      "smile",
      "highfive",
      "wave",
      "bite",
      "nom",
      "kill",
      "lick",
    ],
    buildUrl: (category) => `https://api.waifu.pics/sfw/${category}`,
    parse: (data) => (typeof data?.url === "string" ? data.url : undefined),
  },
  {
    name: "nekos.best",
    categories: [
      "hug",
      "kiss",
      "pat",
      "slap",
      "cuddle",
      "poke",
      "tickle",
      "dance",
      "smile",
      "wave",
      "bite",
      "nom",
      "highfive",
    ],
    buildUrl: (category) => `https://nekos.best/api/v2/${category}`,
    parse: (data) => (typeof data?.results?.[0]?.url === "string" ? data.results[0].url : undefined),
  },
  {
    name: "purrbot",
    categories: ["hug", "kiss", "pat", "slap", "cuddle", "poke", "tickle", "dance", "smile", "bite", "blush"],
    buildUrl: (category) => `https://purrbot.site/api/img/sfw/${category}/gif`,
    parse: (data) => (typeof data?.link === "string" ? data.link : undefined),
  },
];

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(5000),
    headers: { Accept: "application/json", "User-Agent": "AliceBot/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Fetch an SFW social GIF with provider fallbacks (no TLS bypass). */
export async function fetchSocialGif(category: string): Promise<SocialGifResult> {
  for (const provider of PROVIDERS) {
    if (!provider.categories.includes(category)) continue;
    try {
      const data = await fetchJson(provider.buildUrl(category));
      const url = provider.parse(data);
      if (url?.startsWith("http")) {
        return { url, provider: provider.name };
      }
    } catch {
      // try next provider
    }
  }
  throw new Error(`All social GIF providers failed for: ${category}`);
}
