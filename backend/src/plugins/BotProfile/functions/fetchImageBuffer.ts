const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export function isValidImageUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    return ALLOWED_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate an http(s) image URL and download its body as a Buffer.
 * Rejects non-image content types and payloads over 8 MiB.
 */
export async function fetchImageBuffer(rawUrl: string): Promise<
  { ok: true; buffer: Buffer } | { ok: false; error: string }
> {
  const url = rawUrl.trim();
  if (!isValidImageUrl(url)) {
    return { ok: false, error: "URL must start with `http://` or `https://`." };
  }

  let res: Response;
  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      headers: { Accept: "image/*", "User-Agent": "AliceBot/1.0" },
      redirect: "follow",
    });
  } catch {
    return { ok: false, error: "Failed to download image from that URL." };
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
