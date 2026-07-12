import { deflateSync } from "zlib";
import { randomInt } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** 5x7 bitmap glyphs for captcha alphabet (row-major, 1 = ink). */
const GLYPHS: Record<string, number[]> = {
  A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  B: [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  C: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  D: [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  E: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  F: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  G: [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01110],
  H: [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  J: [0b00111, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b01100],
  K: [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  M: [0b10001, 0b11011, 0b10101, 0b10001, 0b10001, 0b10001, 0b10001],
  N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  P: [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  Q: [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
  R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  S: [0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  U: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  V: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  W: [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b10101, 0b01010],
  X: [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
  Y: [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  Z: [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
  "2": [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111],
  "3": [0b11110, 0b00001, 0b00001, 0b01110, 0b00001, 0b00001, 0b11110],
  "4": [0b10001, 0b10001, 0b10001, 0b11111, 0b00001, 0b00001, 0b00001],
  "5": [0b11111, 0b10000, 0b10000, 0b11110, 0b00001, 0b00001, 0b11110],
  "6": [0b01110, 0b10000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  "7": [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  "8": [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  "9": [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00001, 0b01110],
};

export function generateCaptchaCode(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[randomInt(ALPHABET.length)]!;
  }
  return out;
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]!;
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

/** Non-crypto PRNG for decorative captcha noise only. */
function noiseInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

/**
 * Render a simple noise-backed captcha PNG (no extra deps).
 * Discord embeds require raster images, not SVG.
 */
export function renderCaptchaPng(code: string): Buffer {
  const scale = 6;
  const padX = 16;
  const padY = 18;
  const gap = 4;
  const glyphW = 5;
  const glyphH = 7;
  const width = padX * 2 + code.length * (glyphW * scale + gap) - gap;
  const height = padY * 2 + glyphH * scale;

  // RGBA raw rows with filter byte 0
  const raw = Buffer.alloc((width * 4 + 1) * height);
  const setPx = (x: number, y: number, r: number, g: number, b: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    const i = rowStart + 1 + x * 4;
    raw[i] = r;
    raw[i + 1] = g;
    raw[i + 2] = b;
    raw[i + 3] = 255;
  };

  // Background
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      setPx(x, y, 30, 30, 46);
    }
  }

  // Noise dots (decorative — Math.random is fine)
  for (let n = 0; n < 180; n++) {
    const x = noiseInt(width);
    const y = noiseInt(height);
    setPx(x, y, 80 + noiseInt(100), 80 + noiseInt(100), 120);
  }

  // Noise lines
  for (let n = 0; n < 6; n++) {
    const x0 = noiseInt(width);
    const y0 = noiseInt(height);
    const x1 = noiseInt(width);
    const y1 = noiseInt(height);
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(x0 + ((x1 - x0) * s) / steps);
      const y = Math.round(y0 + ((y1 - y0) * s) / steps);
      setPx(x, y, 100, 140, 200);
    }
  }

  // Glyphs
  for (let ci = 0; ci < code.length; ci++) {
    const ch = code[ci]!;
    const glyph = GLYPHS[ch];
    if (!glyph) continue;
    const ox = padX + ci * (glyphW * scale + gap) + noiseInt(3) - 1;
    const oy = padY + noiseInt(5) - 2;
    const inkR = 180 + noiseInt(60);
    const inkG = 180 + noiseInt(60);
    const inkB = 220;
    for (let gy = 0; gy < glyphH; gy++) {
      const row = glyph[gy]!;
      for (let gx = 0; gx < glyphW; gx++) {
        if (((row >> (glyphW - 1 - gx)) & 1) === 0) continue;
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            setPx(ox + gx * scale + sx, oy + gy * scale + sy, inkR, inkG, inkB);
          }
        }
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}
