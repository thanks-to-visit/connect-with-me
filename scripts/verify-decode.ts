import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import QRCode from 'qrcode';
import { buildWhatsAppUrl } from '../src/features/whatsapp-qr/lib/whatsappUrl';

async function verifyQrDecoding() {
  const testCases = [
    {
      dialCode: '91',
      nationalNumber: '8964958940',
      message: 'Hello, I want to connect!',
    },
    {
      dialCode: '1',
      nationalNumber: '4155552671',
      message: 'Hi! 😊 Special cost: 50% & #tag? \nNext line.',
    },
    {
      dialCode: '44',
      nationalNumber: '7911123456',
      message: '',
    },
  ];

  console.log('--- QR CODE DECODE VERIFICATION ---');

  for (const tc of testCases) {
    const expectedUrl = buildWhatsAppUrl(tc);
    // Generate PNG buffer
    const pngBuffer = await QRCode.toBuffer(expectedUrl, {
      width: 1024,
      margin: 4,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    });

    // Parse PNG buffer with pngjs
    const parsedPng = PNG.sync.read(pngBuffer);
    const code = jsQR(new Uint8ClampedArray(parsedPng.data), parsedPng.width, parsedPng.height);

    if (!code) {
      console.error(`[FAIL] Could not decode QR code for ${expectedUrl}`);
      process.exit(1);
    }

    if (code.data === expectedUrl) {
      console.log(`[PASS] Decoded URL matches generated URL:`);
      console.log(`       Decoded:  ${code.data}`);
      console.log(`       Size:     ${parsedPng.width}x${parsedPng.height} px`);
    } else {
      console.error(`[FAIL] Mismatch! Expected: ${expectedUrl}, Got: ${code.data}`);
      process.exit(1);
    }
  }

  console.log('All QR decoding tests passed!\n');
}

verifyQrDecoding();
