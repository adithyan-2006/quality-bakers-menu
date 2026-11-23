/* eslint-disable */
import {
  hashPassword,
  verifyPassword,
  isValidPasswordHash,
  DEFAULT_SCRYPT_PARAMS,
} from '../src/password.ts';

console.log('====================================================');
console.log('   QUALITY BAKERS — PASSWORD UTILITY TEST SUITE     ');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function testAssert(condition, label) {
  if (condition) {
    console.log(`  ✓ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${label}`);
    failed++;
  }
}

async function runAllTests() {
  const samplePassword = 'CorrectHorseBatteryStaple123!';
  const wrongPassword = 'IncorrectPassword456!';

  // ------------------------------------------------------------------------
  // TEST 1: Unique Salt Generation (Hashing same password twice yields different hashes)
  // ------------------------------------------------------------------------
  console.log('\n--- 1. Unique Salt Generation ---');
  const hash1 = await hashPassword(samplePassword);
  const hash2 = await hashPassword(samplePassword);

  testAssert(typeof hash1 === 'string', 'hashPassword returns a string');
  testAssert(typeof hash2 === 'string', 'second hashPassword returns a string');
  testAssert(hash1 !== hash2, 'Hashing same password twice produces different salted hashes');
  testAssert(hash1.startsWith('scrypt$v=1$'), 'Hash has versioned prefix scrypt$v=1$');
  testAssert(isValidPasswordHash(hash1), 'hash1 is recognized by isValidPasswordHash');
  testAssert(isValidPasswordHash(hash2), 'hash2 is recognized by isValidPasswordHash');

  // ------------------------------------------------------------------------
  // TEST 2: Correct Password Verification (Unambiguous Signature)
  // ------------------------------------------------------------------------
  console.log('\n--- 2. Correct Password Verification ---');
  const verify1 = await verifyPassword(samplePassword, hash1);
  testAssert(verify1 === true, 'verifyPassword(password, hash1) succeeds');

  const verify2 = await verifyPassword(samplePassword, hash2);
  testAssert(verify2 === true, 'verifyPassword(password, hash2) succeeds');

  // Verify 4-part format: scrypt$v=1$<salt_hex>$<key_hex>
  const parts = hash1.split('$');
  const fourPartHash = `scrypt$v=1$${parts[3]}$${parts[4]}`;
  const verifyFourPart = await verifyPassword(samplePassword, fourPartHash);
  testAssert(
    verifyFourPart === true,
    'verifyPassword succeeds with 4-part format scrypt$v=1$<salt_hex>$<key_hex>',
  );

  // ------------------------------------------------------------------------
  // TEST 3: Passwords Starting with 'scrypt$' (Unambiguous Signature Regression)
  // ------------------------------------------------------------------------
  console.log('\n--- 3. Password Beginning with "scrypt$" ---');
  const prefixPassword = 'scrypt$SecretPassword123!';
  const prefixHash = await hashPassword(prefixPassword);
  testAssert(
    prefixHash.startsWith('scrypt$v=1$'),
    'Hash of password starting with scrypt$ generated successfully',
  );

  const verifyPrefix = await verifyPassword(prefixPassword, prefixHash);
  testAssert(
    verifyPrefix === true,
    'Legitimate password starting with "scrypt$" verifies successfully',
  );

  const verifyPrefixWrong = await verifyPassword('scrypt$WrongPassword123!', prefixHash);
  testAssert(
    verifyPrefixWrong === false,
    'Incorrect password starting with "scrypt$" fails verification',
  );

  // ------------------------------------------------------------------------
  // TEST 4: Unicode & Emoji Passwords
  // ------------------------------------------------------------------------
  console.log('\n--- 4. Unicode & Emoji Password Coverage ---');
  const unicodePassword = 'Pässwørd!🔑✨';
  const unicodeHash = await hashPassword(unicodePassword);
  testAssert(typeof unicodeHash === 'string', 'Hashing Unicode password succeeds');
  testAssert(isValidPasswordHash(unicodeHash), 'Unicode hash is structurally valid');

  const verifyUnicode = await verifyPassword(unicodePassword, unicodeHash);
  testAssert(verifyUnicode === true, 'Original Unicode password with accents & emojis verifies');

  const verifyUnicodeWrongEmoji = await verifyPassword('Pässwørd!🔑🌟', unicodeHash);
  testAssert(verifyUnicodeWrongEmoji === false, 'Unicode password with changed emoji fails');

  const verifyUnicodeWrongAccent = await verifyPassword('Passwørd!🔑✨', unicodeHash);
  testAssert(verifyUnicodeWrongAccent === false, 'Unicode password with stripped accent fails');

  // ------------------------------------------------------------------------
  // TEST 5: Incorrect Password Rejection
  // ------------------------------------------------------------------------
  console.log('\n--- 5. Incorrect Password Rejection ---');
  const verifyWrong = await verifyPassword(wrongPassword, hash1);
  testAssert(verifyWrong === false, 'Incorrect password returns false');

  const verifyCaseSensitive = await verifyPassword(samplePassword.toLowerCase(), hash1);
  testAssert(verifyCaseSensitive === false, 'Password verification is strictly case-sensitive');

  const verifyPartial = await verifyPassword(samplePassword.slice(0, -1), hash1);
  testAssert(verifyPartial === false, 'Truncated password returns false');

  // ------------------------------------------------------------------------
  // TEST 6: Strict Parameter Parsing Validation
  // ------------------------------------------------------------------------
  console.log('\n--- 6. Strict Parameter Parsing Validation ---');

  // Malformed suffix tokens (e.g., n=16384extra)
  const suffixNHash = hash1.replace('n=16384', 'n=16384extra');
  testAssert(
    (await verifyPassword(samplePassword, suffixNHash)) === false,
    'Rejects parameter with trailing suffix: n=16384extra',
  );

  const suffixRHash = hash1.replace('r=8', 'r=8abc');
  testAssert(
    (await verifyPassword(samplePassword, suffixRHash)) === false,
    'Rejects parameter with trailing suffix: r=8abc',
  );

  const suffixPHash = hash1.replace('p=1', 'p=1xyz');
  testAssert(
    (await verifyPassword(samplePassword, suffixPHash)) === false,
    'Rejects parameter with trailing suffix: p=1xyz',
  );

  // Negative values
  const negativeNHash = hash1.replace('n=16384', 'n=-16384');
  testAssert(
    (await verifyPassword(samplePassword, negativeNHash)) === false,
    'Rejects negative parameter: n=-16384',
  );

  const negativeRHash = hash1.replace('r=8', 'r=-8');
  testAssert(
    (await verifyPassword(samplePassword, negativeRHash)) === false,
    'Rejects negative parameter: r=-8',
  );

  // Decimal values
  const decimalNHash = hash1.replace('n=16384', 'n=16384.5');
  testAssert(
    (await verifyPassword(samplePassword, decimalNHash)) === false,
    'Rejects decimal parameter: n=16384.5',
  );

  const decimalRHash = hash1.replace('r=8', 'r=8.0');
  testAssert(
    (await verifyPassword(samplePassword, decimalRHash)) === false,
    'Rejects decimal parameter: r=8.0',
  );

  // Empty parameter value
  const emptyParamHash = hash1.replace('n=16384,r=8,p=1', 'n=,r=8,p=1');
  testAssert(
    (await verifyPassword(samplePassword, emptyParamHash)) === false,
    'Rejects empty parameter value: n=',
  );

  // ------------------------------------------------------------------------
  // TEST 7: Memory Limit Enforcement When Generating Hashes
  // ------------------------------------------------------------------------
  console.log('\n--- 7. Memory Limit Enforcement in hashPassword ---');

  // Unsafe combination: { cost: 1048576, blockSize: 32 } requires 4 GiB -> must throw RangeError
  let threwUnsafe1 = false;
  try {
    await hashPassword(samplePassword, { cost: 1048576, blockSize: 32 });
  } catch (err) {
    threwUnsafe1 = err instanceof RangeError && err.message.includes('64 MiB');
  }
  testAssert(
    threwUnsafe1,
    'hashPassword rejects { cost: 1048576, blockSize: 32 } with 64 MiB RangeError',
  );

  // Combination exceeding 64 MiB: { cost: 32768, blockSize: 32, parallelization: 1 } -> 128 MiB -> must throw
  let threwUnsafe2 = false;
  try {
    await hashPassword(samplePassword, { cost: 32768, blockSize: 32, parallelization: 1 });
  } catch (err) {
    threwUnsafe2 = err instanceof RangeError && err.message.includes('64 MiB');
  }
  testAssert(threwUnsafe2, 'hashPassword rejects parameters requiring 128 MiB with RangeError');

  // Safe custom combination: { cost: 8192, blockSize: 8, parallelization: 1 } -> 8 MiB -> succeeds
  const safeCustomHash = await hashPassword(samplePassword, {
    cost: 8192,
    blockSize: 8,
    parallelization: 1,
  });
  testAssert(
    typeof safeCustomHash === 'string',
    'hashPassword succeeds with safe custom options (8 MiB)',
  );
  testAssert(
    (await verifyPassword(samplePassword, safeCustomHash)) === true,
    'Safe custom hash verifies successfully',
  );

  // ------------------------------------------------------------------------
  // TEST 8: Malformed Hash Rejection
  // ------------------------------------------------------------------------
  console.log('\n--- 8. Malformed Hash Rejection ---');
  const malformedInputs = [
    'not_a_hash',
    'scrypt',
    'scrypt$',
    'scrypt$v=1',
    'scrypt$v=1$salt$key', // Non-hex salt and key
    'scrypt$v=1$1234$5678', // Salt and key too short
    'scrypt$v=1$n=16384,r=8,p=1$xyz$abc', // Non-hex salt
    `scrypt$v=1$n=16384,r=8,p=1$${parts[3]}g$${parts[4]}`, // Odd length salt
    `scrypt$v=1$n=16384,r=8,p=1$${parts[3]}${parts[4]}xyz`, // Invalid hex key
    'argon2$v=1$salt$key', // Wrong algorithm prefix
    'bcrypt$2a$10$invalid', // Wrong algorithm prefix
  ];

  for (const badHash of malformedInputs) {
    const res = await verifyPassword(samplePassword, badHash);
    testAssert(res === false, `Malformed hash "${badHash.slice(0, 30)}" returns false safely`);
    testAssert(
      isValidPasswordHash(badHash) === false,
      `isValidPasswordHash("${badHash.slice(0, 30)}") returns false`,
    );
  }

  // ------------------------------------------------------------------------
  // TEST 9: Unsupported Versions & Out-of-Bounds Parameters
  // ------------------------------------------------------------------------
  console.log('\n--- 9. Unsupported Versions & Out-of-Bounds Parameters ---');

  // Unsupported version: v=2
  const v2Hash = hash1.replace('v=1', 'v=2');
  testAssert(
    (await verifyPassword(samplePassword, v2Hash)) === false,
    'Unsupported version v=2 is rejected',
  );

  // Invalid N: not a power of 2 (n=1000)
  const badNHash = hash1.replace('n=16384', 'n=1000');
  testAssert(
    (await verifyPassword(samplePassword, badNHash)) === false,
    'Cost parameter n not a power of 2 is rejected',
  );

  // Cost too low (n < 1024)
  const lowNHash = hash1.replace('n=16384', 'n=512');
  testAssert(
    (await verifyPassword(samplePassword, lowNHash)) === false,
    'Cost parameter n < 1024 is rejected',
  );

  // Block size out of bounds (r=0)
  const badRHash = hash1.replace('r=8', 'r=0');
  testAssert(
    (await verifyPassword(samplePassword, badRHash)) === false,
    'Block size r=0 is rejected',
  );

  // Parallelization out of bounds (p=0)
  const badPHash = hash1.replace('p=1', 'p=0');
  testAssert(
    (await verifyPassword(samplePassword, badPHash)) === false,
    'Parallelization p=0 is rejected',
  );

  // ------------------------------------------------------------------------
  // TEST 10: Empty, Null, and Invalid Input Handling
  // ------------------------------------------------------------------------
  console.log('\n--- 10. Empty & Invalid Input Handling ---');

  let threwEmpty = false;
  try {
    await hashPassword('');
  } catch (err) {
    threwEmpty = err instanceof TypeError;
  }
  testAssert(threwEmpty, 'hashPassword rejects empty string with TypeError');

  let threwNonString = false;
  try {
    await hashPassword(null);
  } catch (err) {
    threwNonString = err instanceof TypeError;
  }
  testAssert(threwNonString, 'hashPassword rejects null with TypeError');

  let threwExcessive = false;
  try {
    await hashPassword('a'.repeat(1025));
  } catch (err) {
    threwExcessive = err instanceof RangeError;
  }
  testAssert(threwExcessive, 'hashPassword rejects passwords > 1024 chars with RangeError');

  testAssert(
    (await verifyPassword('', hash1)) === false,
    'verifyPassword with empty password returns false',
  );
  testAssert(
    (await verifyPassword(samplePassword, '')) === false,
    'verifyPassword with empty hash returns false',
  );
  testAssert(
    (await verifyPassword(null, hash1)) === false,
    'verifyPassword with null password returns false',
  );
  testAssert(
    (await verifyPassword(samplePassword, null)) === false,
    'verifyPassword with null hash returns false',
  );
  testAssert(
    (await verifyPassword(undefined, undefined)) === false,
    'verifyPassword with undefined returns false',
  );

  const shortKeyHash = hash1.slice(0, -2);
  testAssert(
    (await verifyPassword(samplePassword, shortKeyHash)) === false,
    'Hash with truncated key is safely rejected',
  );

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test runner caught unexpected error:', err);
  process.exit(1);
});
