import crypto from 'crypto';

/**
 * Configuration parameters for the scrypt key derivation function.
 */
export interface ScryptParams {
  /** CPU/memory cost parameter (N). Must be a power of 2. Default: 16384 (2^14) */
  cost: number;
  /** Block size parameter (r). Default: 8 */
  blockSize: number;
  /** Parallelization parameter (p). Default: 1 */
  parallelization: number;
  /** Length of the derived cryptographic key in bytes. Default: 64 */
  keyLength: number;
  /** Length of the cryptographically random salt in bytes. Default: 16 (128 bits) */
  saltLength: number;
}

/**
 * Standard scrypt parameters tailored for modern web applications.
 * - N=16384, r=8, p=1 (~16 MB memory, ~30-50ms CPU execution).
 * - 16-byte random salt, 64-byte derived key.
 * Compatible with serverless environments (e.g., Vercel) and resource-constrained runtimes.
 */
export const DEFAULT_SCRYPT_PARAMS: Readonly<ScryptParams> = Object.freeze({
  cost: 16384,
  blockSize: 8,
  parallelization: 1,
  keyLength: 64,
  saltLength: 16,
});

/** Supported hash format version identifier */
const CURRENT_VERSION = '1';

/** Maximum permissible password length in bytes to guard against DoS */
const MAX_PASSWORD_LENGTH = 1024;

/** Maximum permissible memory allocation (64 MiB) for scrypt operations */
const MAX_MEMORY_LIMIT = 64 * 1024 * 1024;

/**
 * Promisified wrapper around Node.js built-in crypto.scrypt.
 */
function scryptAsync(
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: crypto.ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(derivedKey);
      }
    });
  });
}

/**
 * Internal parsed representation of a stored scrypt password hash.
 */
interface ParsedHash {
  version: string;
  cost: number;
  blockSize: number;
  parallelization: number;
  salt: Buffer;
  key: Buffer;
}

/**
 * Parses and strictly validates a formatted scrypt hash string.
 * Supports:
 * - 5-part format: scrypt$v=1$n=16384,r=8,p=1$<salt_hex>$<key_hex>
 * - 4-part format: scrypt$v=1$<salt_hex>$<key_hex> (uses default parameters)
 *
 * Returns ParsedHash if valid, or null if malformed/unsupported.
 */
function parseHash(hashString: string): ParsedHash | null {
  if (typeof hashString !== 'string' || !hashString.startsWith('scrypt$')) {
    return null;
  }

  const parts = hashString.split('$');
  // Must be either 4 or 5 segments
  if (parts.length !== 4 && parts.length !== 5) {
    return null;
  }

  // 1. Algorithm check
  if (parts[0] !== 'scrypt') {
    return null;
  }

  // 2. Version check (e.g., "v=1")
  const versionPart = parts[1];
  if (!versionPart || !versionPart.startsWith('v=')) {
    return null;
  }
  const version = versionPart.substring(2);
  if (version !== CURRENT_VERSION) {
    // Unsupported hash version
    return null;
  }

  let cost = DEFAULT_SCRYPT_PARAMS.cost;
  let blockSize = DEFAULT_SCRYPT_PARAMS.blockSize;
  let parallelization = DEFAULT_SCRYPT_PARAMS.parallelization;
  let saltHex: string;
  let keyHex: string;

  if (parts.length === 5) {
    // Format: scrypt$v=1$n=16384,r=8,p=1$<salt_hex>$<key_hex>
    const paramsPart = parts[2] ?? '';
    const paramTokens = paramsPart.split(',');
    const parsedParams: Record<string, number> = {};

    for (const token of paramTokens) {
      const eqIdx = token.indexOf('=');
      if (eqIdx <= 0) return null;
      const key = token.substring(0, eqIdx).trim();
      const valStr = token.substring(eqIdx + 1).trim();

      // Require the complete parameter value to strictly match digits (/^\d+$/).
      // Rejects empty strings, negative numbers (-1), decimals (8.5), suffixes (16384extra), etc.
      if (!/^\d+$/.test(valStr)) {
        return null;
      }

      const val = parseInt(valStr, 10);
      if (!Number.isSafeInteger(val)) {
        return null;
      }
      parsedParams[key] = val;
    }

    if (
      typeof parsedParams.n !== 'number' ||
      typeof parsedParams.r !== 'number' ||
      typeof parsedParams.p !== 'number'
    ) {
      return null;
    }

    cost = parsedParams.n;
    blockSize = parsedParams.r;
    parallelization = parsedParams.p;
    saltHex = parts[3] ?? '';
    keyHex = parts[4] ?? '';
  } else {
    // Format: scrypt$v=1$<salt_hex>$<key_hex>
    saltHex = parts[2] ?? '';
    keyHex = parts[3] ?? '';
  }

  // 3. Parameter bounds validation:
  // - cost (N): must be a power of 2, 1024 <= N <= 1048576 (2^10 to 2^20)
  if (!Number.isInteger(cost) || cost < 1024 || cost > 1048576 || (cost & (cost - 1)) !== 0) {
    return null;
  }

  // - blockSize (r): 1 <= r <= 32
  if (!Number.isInteger(blockSize) || blockSize < 1 || blockSize > 32) {
    return null;
  }

  // - parallelization (p): 1 <= p <= 16
  if (!Number.isInteger(parallelization) || parallelization < 1 || parallelization > 16) {
    return null;
  }

  // - memory allocation guard: 128 * N * r * p must not exceed 64 MiB
  const estimatedMemory = 128 * cost * blockSize * parallelization;
  if (estimatedMemory > MAX_MEMORY_LIMIT) {
    return null;
  }

  // 4. Hex encoding and length checks:
  // Salt: exactly 16 bytes (32 hex characters)
  if (saltHex.length !== 32 || !/^[0-9a-fA-F]{32}$/.test(saltHex)) {
    return null;
  }

  // Key: exactly 64 bytes (128 hex characters)
  if (keyHex.length !== 128 || !/^[0-9a-fA-F]{128}$/.test(keyHex)) {
    return null;
  }

  try {
    const salt = Buffer.from(saltHex, 'hex');
    const key = Buffer.from(keyHex, 'hex');
    return {
      version,
      cost,
      blockSize,
      parallelization,
      salt,
      key,
    };
  } catch {
    return null;
  }
}

/**
 * Asynchronously derives a secure cryptographic password hash using Node.js crypto.scrypt.
 *
 * @param password The plaintext password to hash.
 * @param options Optional overrides for scrypt work factor and lengths.
 * @returns A formatted string: `scrypt$v=1$n=16384,r=8,p=1$<salt_hex>$<derived_key_hex>`
 * @throws TypeError if password is empty or not a string.
 * @throws RangeError if password exceeds maximum permitted length (1024 characters) or parameter bounds.
 */
export async function hashPassword(
  password: string,
  options?: Partial<ScryptParams>,
): Promise<string> {
  if (typeof password !== 'string' || password.length === 0) {
    throw new TypeError('Password must be a non-empty string.');
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new RangeError(
      `Password exceeds the maximum allowed length of ${MAX_PASSWORD_LENGTH} characters.`,
    );
  }

  const cost = options?.cost ?? DEFAULT_SCRYPT_PARAMS.cost;
  const blockSize = options?.blockSize ?? DEFAULT_SCRYPT_PARAMS.blockSize;
  const parallelization = options?.parallelization ?? DEFAULT_SCRYPT_PARAMS.parallelization;
  const keyLength = options?.keyLength ?? DEFAULT_SCRYPT_PARAMS.keyLength;
  const saltLength = options?.saltLength ?? DEFAULT_SCRYPT_PARAMS.saltLength;

  // Validate parameters before hashing
  if (!Number.isInteger(cost) || cost < 1024 || (cost & (cost - 1)) !== 0) {
    throw new RangeError('Cost parameter (N) must be a power of 2 and at least 1024.');
  }
  if (!Number.isInteger(blockSize) || blockSize < 1 || blockSize > 32) {
    throw new RangeError('Block size (r) must be an integer between 1 and 32.');
  }
  if (!Number.isInteger(parallelization) || parallelization < 1 || parallelization > 16) {
    throw new RangeError('Parallelization (p) must be an integer between 1 and 16.');
  }

  // Validate aggregate memory requirement to guard against excessive allocation / DoS:
  // OpenSSL scrypt scratchpad requires 128 * N * r * p bytes.
  // We cap total memory allocation at 64 MiB (67,108,864 bytes) consistently with parseHash().
  const estimatedMemory = 128 * cost * blockSize * parallelization;
  if (estimatedMemory > MAX_MEMORY_LIMIT) {
    throw new RangeError(
      `Requested scrypt parameters (cost=${cost}, blockSize=${blockSize}, parallelization=${parallelization}) require ${Math.round(
        estimatedMemory / (1024 * 1024),
      )} MiB, exceeding the maximum permissible allocation limit of 64 MiB.`,
    );
  }

  // Generate cryptographically secure random salt
  const salt = crypto.randomBytes(saltLength);

  // Compute scrypt key
  const maxmem = Math.max(32 * 1024 * 1024, 128 * cost * blockSize * 2);
  const derivedKey = await scryptAsync(password, salt, keyLength, {
    cost,
    blockSize,
    parallelization,
    maxmem,
  });

  const saltHex = salt.toString('hex');
  const keyHex = derivedKey.toString('hex');

  return `scrypt$v=${CURRENT_VERSION}$n=${cost},r=${blockSize},p=${parallelization}$${saltHex}$${keyHex}`;
}

/**
 * Asynchronously verifies a plaintext password against a formatted scrypt hash.
 *
 * Uses `crypto.timingSafeEqual()` for constant-time comparison to protect against
 * timing side-channel attacks.
 *
 * Unambiguous canonical signature:
 * - The first argument `password` must always be the plaintext password.
 * - The second argument `storedHash` must always be the stored hash string.
 *
 * @param password The plaintext password to verify.
 * @param storedHash The formatted scrypt hash string.
 * @returns `true` if password matches; `false` on mismatch, malformed hash, or invalid parameters.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (
    typeof password !== 'string' ||
    typeof storedHash !== 'string' ||
    password.length === 0 ||
    storedHash.length === 0
  ) {
    return false;
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return false;
  }

  const parsed = parseHash(storedHash);
  if (!parsed) {
    return false;
  }

  try {
    const maxmem = Math.max(32 * 1024 * 1024, 128 * parsed.cost * parsed.blockSize * 2);
    const candidateKey = await scryptAsync(password, parsed.salt, parsed.key.length, {
      cost: parsed.cost,
      blockSize: parsed.blockSize,
      parallelization: parsed.parallelization,
      maxmem,
    });

    if (candidateKey.length !== parsed.key.length) {
      return false;
    }

    return crypto.timingSafeEqual(candidateKey, parsed.key);
  } catch {
    // Any cryptographic error (e.g., parameter rejection by OpenSSL) safely evaluates to false
    return false;
  }
}

/**
 * Inspects whether a value is a structurally valid, supported scrypt password hash.
 */
export function isValidPasswordHash(hash: unknown): boolean {
  if (typeof hash !== 'string') {
    return false;
  }
  return parseHash(hash) !== null;
}
