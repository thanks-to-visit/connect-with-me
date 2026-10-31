import { extractDigits } from './phone';

export interface WhatsAppUrlParams {
  dialCode: string;
  nationalNumber: string;
  message?: string;
}

/**
 * Builds the official WhatsApp wa.me URL
 * Rules:
 * - https://wa.me/{digits} when message is empty (after trim)
 * - https://wa.me/{digits}?text={encodeURIComponent(message.trim())} otherwise
 * - Preserves newlines, emojis, &, #, ?, %, and non-Latin scripts via encodeURIComponent
 * - Does not double-encode
 */
export function buildWhatsAppUrl({ dialCode, nationalNumber, message }: WhatsAppUrlParams): string {
  const dialDigits = extractDigits(dialCode);
  const nationalDigits = extractDigits(nationalNumber);
  const fullDigits = `${dialDigits}${nationalDigits}`;

  const trimmedMessage = message ? message.trim() : '';

  if (!trimmedMessage) {
    return `https://wa.me/${fullDigits}`;
  }

  const encodedMessage = encodeURIComponent(trimmedMessage);
  return `https://wa.me/${fullDigits}?text=${encodedMessage}`;
}
