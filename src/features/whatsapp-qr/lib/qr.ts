import QRCode from 'qrcode';

export interface QrOptions {
  size?: number;
}

/**
 * Generates high-resolution QR code Data URL (PNG)
 * - Error correction level 'M' (or 'Q' if payload < 80 chars)
 * - Quiet zone / margin >= 4 modules
 * - High contrast: dark #111827 on white #FFFFFF
 * - Default size 1024px for crisp export
 * - Graceful fallback and capacity error handling
 */
export async function generateQrDataUrl(url: string, options: QrOptions = {}): Promise<string> {
  const size = options.size ?? 1024;
  const errorCorrectionLevel = url.length < 80 ? 'Q' : 'M';

  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: size,
      margin: 4,
      errorCorrectionLevel,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (err) {
    // Attempt fallback with 'L' error correction if payload is dense
    try {
      const fallbackUrl = await QRCode.toDataURL(url, {
        width: size,
        margin: 4,
        errorCorrectionLevel: 'L',
        color: {
          dark: '#111827',
          light: '#FFFFFF',
        },
      });
      return fallbackUrl;
    } catch {
      throw new Error('Unable to generate QR code. Please try again.');
    }
  }
}
