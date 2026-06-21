import crypto from "crypto";

const SCRYPT_PREFIX = "s1:";
const SCRYPT_KEYLEN = 64;
const SCRYPT_OPTIONS: crypto.ScryptOptions = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function scryptAsync(password: string, salt: string, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, SCRYPT_OPTIONS, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(derivedKey);
    });
  });
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function hashApiTokenLegacy(loginId: string, token: string): string {
  return crypto.createHash("sha256").update(loginId + token).digest("hex");
}

export async function hashApiToken(loginId: string, token: string): Promise<string> {
  const derived = await scryptAsync(`${loginId}:${token}`, loginId, SCRYPT_KEYLEN);
  return `${SCRYPT_PREFIX}${derived.toString("hex")}`;
}

export async function verifyApiToken(loginId: string, token: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith(SCRYPT_PREFIX)) {
    const expected = storedHash.slice(SCRYPT_PREFIX.length);
    const derived = await scryptAsync(`${loginId}:${token}`, loginId, SCRYPT_KEYLEN);
    return timingSafeEqualHex(derived.toString("hex"), expected);
  }

  return timingSafeEqualHex(hashApiTokenLegacy(loginId, token), storedHash);
}
