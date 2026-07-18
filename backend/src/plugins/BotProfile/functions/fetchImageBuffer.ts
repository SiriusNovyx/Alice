import dns from "node:dns/promises";
import { isIP } from "node:net";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata",
  "metadata.internal",
]);

export function isValidImageUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    return ALLOWED_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

function ipv4ToInt(ip: string): number {
  const parts = ip.split(".").map((p) => Number(p));
  return ((parts[0]! << 24) | (parts[1]! << 16) | (parts[2]! << 8) | parts[3]!) >>> 0;
}

function isPrivateOrLocalIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    const n = ipv4ToInt(ip);
    return (
      (n >= ipv4ToInt("0.0.0.0") && n <= ipv4ToInt("0.255.255.255")) ||
      (n >= ipv4ToInt("10.0.0.0") && n <= ipv4ToInt("10.255.255.255")) ||
      (n >= ipv4ToInt("127.0.0.0") && n <= ipv4ToInt("127.255.255.255")) ||
      (n >= ipv4ToInt("169.254.0.0") && n <= ipv4ToInt("169.254.255.255")) ||
      (n >= ipv4ToInt("172.16.0.0") && n <= ipv4ToInt("172.31.255.255")) ||
      (n >= ipv4ToInt("192.168.0.0") && n <= ipv4ToInt("192.168.255.255")) ||
      (n >= ipv4ToInt("100.64.0.0") && n <= ipv4ToInt("100.127.255.255")) ||
      (n >= ipv4ToInt("192.0.0.0") && n <= ipv4ToInt("192.0.0.255")) ||
      (n >= ipv4ToInt("198.18.0.0") && n <= ipv4ToInt("198.19.255.255")) ||
      (n >= ipv4ToInt("224.0.0.0") && n <= ipv4ToInt("255.255.255.255"))
    );
  }
  if (version === 6) {
    const normalized = ip.toLowerCase();
    if (normalized === "::" || normalized === "::1") return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // unique local
    if (normalized.startsWith("fe80:")) return true; // link-local
    const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped?.[1]) return isPrivateOrLocalIp(mapped[1]);
    return false;
  }
  return true;
}

async function assertPublicHttpUrl(raw: string): Promise<string | null> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return "Invalid image URL.";
  }
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    return "URL must start with `http://` or `https://`.";
  }
  if (url.username || url.password) {
    return "Image URL must not include credentials.";
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    !hostname ||
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname === "0"
  ) {
    return "Image URL host is not allowed.";
  }

  if (isIP(hostname)) {
    if (isPrivateOrLocalIp(hostname)) {
      return "Image URL must not target a private or local network address.";
    }
    return null;
  }

  let addresses: string[];
  try {
    const lookedUp = await dns.lookup(hostname, { all: true, verbatim: true });
    addresses = lookedUp.map((a) => a.address);
  } catch {
    return "Could not resolve image URL host.";
  }
  if (addresses.length === 0 || addresses.some((addr) => isPrivateOrLocalIp(addr))) {
    return "Image URL must not target a private or local network address.";
  }
  return null;
}

/**
 * Validate an http(s) image URL and download its body as a Buffer.
 * Rejects private/local hosts (SSRF), non-image content types, and payloads over 8 MiB.
 */
export async function fetchImageBuffer(rawUrl: string): Promise<
  { ok: true; buffer: Buffer } | { ok: false; error: string }
> {
  let current = rawUrl.trim();
  if (!isValidImageUrl(current)) {
    return { ok: false, error: "URL must start with `http://` or `https://`." };
  }

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const blocked = await assertPublicHttpUrl(current);
    if (blocked) {
      return { ok: false, error: blocked };
    }

    let res: Response;
    try {
      res = await fetch(current, {
        signal: AbortSignal.timeout(15_000),
        headers: { Accept: "image/*", "User-Agent": "AliceBot/1.0" },
        redirect: "manual",
      });
    } catch {
      return { ok: false, error: "Failed to download image from that URL." };
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) {
        return { ok: false, error: "Image URL redirected without a Location header." };
      }
      try {
        current = new URL(location, current).toString();
      } catch {
        return { ok: false, error: "Image URL redirected to an invalid location." };
      }
      continue;
    }

    if (!res.ok) {
      return { ok: false, error: `Failed to download image (HTTP ${res.status}).` };
    }

    const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
    if (contentType && !contentType.startsWith("image/")) {
      return { ok: false, error: "URL must point to an image (PNG / JPG / GIF / WEBP)." };
    }

    const contentLength = Number(res.headers.get("content-length") ?? 0);
    if (contentLength > MAX_IMAGE_BYTES) {
      return { ok: false, error: "Image is too large (max 8 MB)." };
    }

    let buffer: Buffer;
    try {
      const ab = await res.arrayBuffer();
      buffer = Buffer.from(ab);
    } catch {
      return { ok: false, error: "Failed to read image data." };
    }

    if (buffer.byteLength === 0) {
      return { ok: false, error: "Downloaded image was empty." };
    }
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      return { ok: false, error: "Image is too large (max 8 MB)." };
    }

    return { ok: true, buffer };
  }

  return { ok: false, error: "Too many redirects while downloading image." };
}
