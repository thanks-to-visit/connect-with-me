import { isValidPhoneNumber, parsePhoneNumber, CountryCode } from 'libphonenumber-js';
import { Country, COUNTRIES } from '../constants/countries';

export interface PhoneValidationResult {
  isValid: boolean;
  error?: 'empty' | 'invalid';
  message?: string;
}

/**
 * Strips non-digits from string (keeps only 0-9)
 */
export function extractDigits(str: string): string {
  return str.replace(/\D/g, '');
}

/**
 * Normalizes user-entered national number:
 * - Strips spaces, dashes, brackets, and any non-numeric characters
 * - Removes leading national trunk '0' if present (e.g., 08964958940 -> 8964958940, 07911 123456 -> 7911123456)
 * - If user pasted dial code prefix for current country, strips it to avoid duplication
 */
export function normalizeNationalNumber(rawInput: string, currentCountry: Country): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return '';

  // Check if string contains letters
  if (/[a-zA-Z]/.test(trimmed)) {
    return trimmed; // keep so validator can flag as invalid rather than quietly stripping letters
  }

  let cleaned = extractDigits(trimmed);

  // If input started with + and the current country dial code, remove dial code
  if (trimmed.startsWith('+') && cleaned.startsWith(currentCountry.dialCode)) {
    cleaned = cleaned.slice(currentCountry.dialCode.length);
  } else if (
    currentCountry.code === 'IN' &&
    cleaned.length === 12 &&
    cleaned.startsWith('91') &&
    /^[6-9]/.test(cleaned.slice(2))
  ) {
    // Pasted 918964958940 without plus for India
    cleaned = cleaned.slice(2);
  }

  // Remove leading national trunk 0 (e.g. 08964958940 -> 8964958940, UK 07911... -> 7911...)
  if (cleaned.startsWith('0') && cleaned.length > 1) {
    cleaned = cleaned.replace(/^0+/, '');
  }

  return cleaned;
}

/**
 * Detects if pasted input contains a full international number with + or 00 prefix,
 * and finds the matching country. If matched, returns the new country and national digits.
 */
export function handlePastedPhone(
  pastedText: string,
  currentCountry: Country,
  allCountries: Country[] = COUNTRIES
): { country: Country; nationalNumber: string } | null {
  const trimmed = pastedText.trim();
  if (!trimmed) return null;

  let textToParse = trimmed;
  if (textToParse.startsWith('00')) {
    textToParse = '+' + textToParse.slice(2);
  }

  if (textToParse.startsWith('+')) {
    const rawDigits = extractDigits(textToParse);
    // Sort countries by dialCode length descending to match 3-digit codes (e.g. 971) before 1-digit
    const sorted = [...allCountries].sort((a, b) => b.dialCode.length - a.dialCode.length);
    const matched = sorted.find((c) => rawDigits.startsWith(c.dialCode));

    if (matched) {
      let national = rawDigits.slice(matched.dialCode.length);
      // Strip leading trunk 0 if present
      if (national.startsWith('0') && national.length > 1) {
        national = national.replace(/^0+/, '');
      }
      return {
        country: matched,
        nationalNumber: national,
      };
    }
  }

  return null;
}

/**
 * Validates a phone number based on country rules
 */
export function validatePhoneNumber(
  nationalNumber: string,
  country: Country
): PhoneValidationResult {
  const trimmed = nationalNumber.trim();

  // 1. Empty check
  if (!trimmed) {
    return {
      isValid: false,
      error: 'empty',
      message: 'Please enter a phone number to continue.',
    };
  }

  // 2. Letters or symbols check
  if (/[a-zA-Z]/.test(trimmed) || !/^\d+$/.test(extractDigits(trimmed))) {
    return {
      isValid: false,
      error: 'invalid',
      message: 'Please enter a valid phone number.',
    };
  }

  const digits = extractDigits(trimmed);

  // 3. Country-specific validation for India (+91)
  if (country.code === 'IN' || country.dialCode === '91') {
    // Exactly 10 national digits, first digit 6-9
    const isValidIndia = /^[6-9]\d{9}$/.test(digits);
    if (!isValidIndia) {
      return {
        isValid: false,
        error: 'invalid',
        message: 'Please enter a valid phone number.',
      };
    }
    return { isValid: true };
  }

  // 4. Validation using libphonenumber-js for other countries
  const fullE164 = `+${country.dialCode}${digits}`;
  try {
    const isValidLib = isValidPhoneNumber(fullE164, country.code as CountryCode);
    if (isValidLib) {
      return { isValid: true };
    }
  } catch {
    // fallback to E.164 rules below
  }

  // Fallback to standard E.164 validation:
  // Total digits (dialCode + national) must be between 8 and 15 digits
  // Dial code cannot start with 0
  const totalDigits = `${country.dialCode}${digits}`;
  const isE164Valid =
    !country.dialCode.startsWith('0') &&
    totalDigits.length >= 8 &&
    totalDigits.length <= 15 &&
    digits.length >= 4;

  if (isE164Valid) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: 'invalid',
    message: 'Please enter a valid phone number.',
  };
}

/**
 * Formats phone number for display (e.g. "+91 89649 58940" or "+1 415 555 2671")
 */
export function formatDisplayPhoneNumber(dialCode: string, nationalNumber: string, countryCode?: string): string {
  const digits = extractDigits(nationalNumber);
  if (!digits) return `+${dialCode}`;

  const fullNumber = `+${dialCode}${digits}`;
  try {
    const parsed = parsePhoneNumber(fullNumber, countryCode as CountryCode);
    if (parsed) {
      return parsed.formatInternational();
    }
  } catch {
    // Fallback format
  }

  // Chunking fallback
  if (digits.length === 10) {
    return `+${dialCode} ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return `+${dialCode} ${digits}`;
}
