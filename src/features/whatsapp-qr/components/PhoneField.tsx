import React, { useId } from 'react';
import { Country } from '../constants/countries';
import { CountrySelect } from './CountrySelect';
import { handlePastedPhone, normalizeNationalNumber } from '../lib/phone';
import { AlertCircle } from 'lucide-react';

interface PhoneFieldProps {
  country: Country;
  onCountryChange: (country: Country) => void;
  nationalNumber: string;
  onNationalNumberChange: (value: string) => void;
  error?: string | null;
  touched: boolean;
  onBlur: () => void;
  disabled?: boolean;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  country,
  onCountryChange,
  nationalNumber,
  onNationalNumberChange,
  error,
  touched,
  onBlur,
  disabled = false,
}) => {
  const inputId = useId();
  const errorId = useId();
  const hintId = useId();

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData('text');
    if (!pastedData) return;

    // Check if pasted data contains international prefix with a different country
    const detected = handlePastedPhone(pastedData, country);
    if (detected) {
      e.preventDefault();
      onCountryChange(detected.country);
      onNationalNumberChange(detected.nationalNumber);
      return;
    }

    // Otherwise, normalize national number (strips spaces, symbols, leading 0, and current country dial code if present)
    const normalized = normalizeNationalNumber(pastedData, country);
    e.preventDefault();
    onNationalNumberChange(normalized);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow typing, normalizing spaces/symbols
    const normalized = normalizeNationalNumber(raw, country);
    onNationalNumberChange(normalized);
  };

  const hasError = touched && !!error;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-800">
          Phone Number <span className="text-emerald-700" aria-hidden="true">*</span>
        </label>
        <span className="text-xs text-slate-500" id={hintId}>
          {country.code === 'IN' ? '10 digits (starts with 6-9)' : 'Country code + digits'}
        </span>
      </div>

      <div className="flex items-center rounded-xl shadow-xs">
        <CountrySelect
          selectedCountry={country}
          onSelectCountry={onCountryChange}
          disabled={disabled}
        />

        <div className="relative flex-1">
          <input
            id={inputId}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            disabled={disabled}
            value={nationalNumber}
            onChange={handleChange}
            onPaste={handlePaste}
            onBlur={onBlur}
            placeholder={country.code === 'IN' ? '98765 43210' : 'National number'}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={`${hasError ? errorId : ''} ${hintId}`}
            className={`w-full h-11 px-3.5 bg-white border border-l-0 rounded-r-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-colors disabled:bg-slate-50 disabled:text-slate-500 ${
              hasError
                ? 'border-red-400 focus:ring-red-500 bg-red-50/20'
                : 'border-slate-300 hover:border-slate-400'
            }`}
          />
        </div>
      </div>

      {hasError && (
        <div
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-red-600 mt-0.5 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
