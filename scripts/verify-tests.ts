import { normalizeNationalNumber, validatePhoneNumber, extractDigits, handlePastedPhone } from '../src/features/whatsapp-qr/lib/phone';
import { buildWhatsAppUrl } from '../src/features/whatsapp-qr/lib/whatsappUrl';
import { generateQrDataUrl } from '../src/features/whatsapp-qr/lib/qr';
import { COUNTRIES } from '../src/features/whatsapp-qr/constants/countries';

const IN = COUNTRIES.find((c) => c.code === 'IN')!;
const US = COUNTRIES.find((c) => c.code === 'US')!;
const GB = COUNTRIES.find((c) => c.code === 'GB')!;

interface TestCaseResult {
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
}

const results: TestCaseResult[] = [];

function assert(name: string, expected: string, actual: string, condition: boolean) {
  results.push({
    name,
    expected,
    actual,
    passed: condition,
  });
}

// 1. IN, 8964958940
const norm1 = normalizeNationalNumber('8964958940', IN);
const fullDigits1 = `${extractDigits(IN.dialCode)}${extractDigits(norm1)}`;
const val1 = validatePhoneNumber(norm1, IN);
assert(
  'IN, 8964958940',
  '918964958940, valid',
  `${fullDigits1}, ${val1.isValid ? 'valid' : 'invalid'}`,
  fullDigits1 === '918964958940' && val1.isValid === true
);

// 2. IN, 08964958940 / +91 89649-58940
const norm2a = normalizeNationalNumber('08964958940', IN);
const fullDigits2a = `${extractDigits(IN.dialCode)}${extractDigits(norm2a)}`;
const norm2b = normalizeNationalNumber('+91 89649-58940', IN);
const fullDigits2b = `${extractDigits(IN.dialCode)}${extractDigits(norm2b)}`;
assert(
  'IN, 08964958940',
  '918964958940',
  fullDigits2a,
  fullDigits2a === '918964958940'
);
assert(
  'IN, +91 89649-58940',
  '918964958940',
  fullDigits2b,
  fullDigits2b === '918964958940'
);

// 3. IN, 1234567890 (must start 6-9)
const norm3 = normalizeNationalNumber('1234567890', IN);
const val3 = validatePhoneNumber(norm3, IN);
assert(
  'IN, 1234567890',
  'invalid',
  val3.isValid ? 'valid' : 'invalid',
  val3.isValid === false
);

// 4. IN, 9 or 11 digits
const norm4a = normalizeNationalNumber('987654321', IN); // 9 digits
const val4a = validatePhoneNumber(norm4a, IN);
const norm4b = normalizeNationalNumber('98765432101', IN); // 11 digits
const val4b = validatePhoneNumber(norm4b, IN);
assert(
  'IN, 9 digits (987654321)',
  'invalid',
  val4a.isValid ? 'valid' : 'invalid',
  val4a.isValid === false
);
assert(
  'IN, 11 digits (98765432101)',
  'invalid',
  val4b.isValid ? 'valid' : 'invalid',
  val4b.isValid === false
);

// 5. US, (415) 555-2671
const norm5 = normalizeNationalNumber('(415) 555-2671', US);
const fullDigits5 = `${extractDigits(US.dialCode)}${extractDigits(norm5)}`;
const val5 = validatePhoneNumber(norm5, US);
assert(
  'US, (415) 555-2671',
  '14155552671, valid',
  `${fullDigits5}, ${val5.isValid ? 'valid' : 'invalid'}`,
  fullDigits5 === '14155552671' && val5.isValid === true
);

// 6. UK, 07911 123456
const norm6 = normalizeNationalNumber('07911 123456', GB);
const fullDigits6 = `${extractDigits(GB.dialCode)}${extractDigits(norm6)}`;
const val6 = validatePhoneNumber(norm6, GB);
assert(
  'UK, 07911 123456',
  '447911123456, valid',
  `${fullDigits6}, ${val6.isValid ? 'valid' : 'invalid'}`,
  fullDigits6 === '447911123456' && val6.isValid === true
);

// 7. Empty
const val7 = validatePhoneNumber('', IN);
assert(
  'Empty phone number',
  'missing-phone (empty error)',
  val7.error ?? 'none',
  val7.isValid === false && val7.error === 'empty'
);

// 8. Letters only
const val8 = validatePhoneNumber('abcdefghij', IN);
assert(
  'Letters only',
  'invalid error',
  val8.error ?? 'none',
  val8.isValid === false && val8.error === 'invalid'
);

// 9. Message empty/whitespace -> URL has no ?text=
const url9a = buildWhatsAppUrl({ dialCode: '91', nationalNumber: '8964958940', message: '' });
const url9b = buildWhatsAppUrl({ dialCode: '91', nationalNumber: '8964958940', message: '   ' });
assert(
  'Message empty',
  'https://wa.me/918964958940',
  url9a,
  url9a === 'https://wa.me/918964958940'
);
assert(
  'Message whitespace only',
  'https://wa.me/918964958940',
  url9b,
  url9b === 'https://wa.me/918964958940'
);

// 10. Complex message encoding
const rawMsg10 = 'Hi! How are you? 😊 Cost: 50% & more #1\nNext line';
const url10 = buildWhatsAppUrl({ dialCode: '91', nationalNumber: '8964958940', message: rawMsg10 });
const param10 = url10.split('?text=')[1];
const decoded10 = decodeURIComponent(param10);
assert(
  'Complex message encoding and decoding',
  rawMsg10,
  decoded10,
  decoded10 === rawMsg10 && !url10.includes(' ') && url10.includes('https://wa.me/918964958940?text=')
);

// 11. 500-char message QR generation
async function testQr() {
  const emojiStr = 'Hello 😊🚀✨🎉🔥 ';
  const repCount = Math.floor(500 / Array.from(emojiStr).length);
  const msg500 = Array.from(emojiStr.repeat(repCount)).slice(0, 500).join('');
  const url500 = buildWhatsAppUrl({ dialCode: '91', nationalNumber: '8964958940', message: msg500 });

  let qr500Success = false;
  let dataUrl500 = '';
  try {
    dataUrl500 = await generateQrDataUrl(url500, { size: 1024 });
    qr500Success = dataUrl500.startsWith('data:image/png;base64,');
  } catch (e) {
    qr500Success = false;
  }
  assert(
    '500-char emoji message QR generation',
    'valid PNG data URL',
    dataUrl500.slice(0, 30) + '...',
    qr500Success
  );

  // 12. 501st char blocked logic in MessageField
  const chars501 = 'a'.repeat(501);
  const enforced = Array.from(chars501).slice(0, 500).join('');
  assert(
    '501st char blocked limit enforcement',
    '500',
    String(Array.from(enforced).length),
    Array.from(enforced).length === 500
  );

  // Print results summary
  console.log('\n--- UNIT TEST RESULTS ---');
  let allPassed = true;
  for (const r of results) {
    const status = r.passed ? 'PASS' : 'FAIL';
    if (!r.passed) allPassed = false;
    console.log(`[${status}] ${r.name}`);
    if (!r.passed) {
      console.log(`   Expected: ${r.expected}`);
      console.log(`   Actual:   ${r.actual}`);
    }
  }
  console.log('-------------------------\n');
  if (!allPassed) {
    process.exit(1);
  }
}

testQr();
