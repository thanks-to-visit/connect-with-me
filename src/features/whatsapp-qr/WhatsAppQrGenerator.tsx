import React, { useState, useRef, useMemo, useCallback } from 'react';
import { DEFAULT_COUNTRY, Country } from './constants/countries';
import { PhoneField } from './components/PhoneField';
import { MessageField } from './components/MessageField';
import { EmptyState } from './components/EmptyState';
import { QrPreview, QrSnapshot } from './components/QrPreview';
import { useToast } from './components/ToastContext';
import { validatePhoneNumber, formatDisplayPhoneNumber, extractDigits } from './lib/phone';
import { buildWhatsAppUrl } from './lib/whatsappUrl';
import { generateQrDataUrl } from './lib/qr';
import {
  QrCode,
  Sparkles,
  Loader2,
  ShieldCheck,
  Zap,
  Menu,
  Github,
  Linkedin,
  Globe,
  Mail,
} from 'lucide-react';
import { ShareMenuDrawer } from './components/ShareMenuDrawer';
import { HowToUseSection } from './components/HowToUseSection';
import { FaqSection } from './components/FaqSection';

interface WhatsAppQrGeneratorProps {
  onNavigate?: (path: string) => void;
}

export const WhatsAppQrGenerator: React.FC<WhatsAppQrGeneratorProps> = ({ onNavigate }) => {
  const { showToast } = useToast();

  // Form State
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [nationalNumber, setNationalNumber] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Interaction & Validation State
  const [isPhoneTouched, setIsPhoneTouched] = useState<boolean>(false);
  const [inlinePhoneError, setInlinePhoneError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Snapshot of generated payload (guarantees Download/Copy uses the exact snapshot)
  const [snapshot, setSnapshot] = useState<QrSnapshot | null>(null);

  // Hamburger / Share Drawer state
  const [isShareMenuOpen, setIsShareMenuOpen] = useState<boolean>(false);

  // Reference for generation request sequencing to prevent race conditions
  const generationIdRef = useRef(0);
  const previewRef = useRef<HTMLDivElement>(null);

  // Check if current form inputs differ from the generated snapshot (Stale state)
  const isStale = useMemo(() => {
    if (!snapshot) return false;
    const currentDigits = `${extractDigits(country.dialCode)}${extractDigits(nationalNumber)}`;
    return currentDigits !== snapshot.digits || message.trim() !== snapshot.message;
  }, [snapshot, country.dialCode, nationalNumber, message]);

  // Handle phone blur for soft inline validation (only after user interacted)
  const handlePhoneBlur = useCallback(() => {
    setIsPhoneTouched(true);
    if (!nationalNumber.trim()) {
      // Don't show error immediately on empty blur, but clear existing error
      setInlinePhoneError(null);
      return;
    }
    const result = validatePhoneNumber(nationalNumber, country);
    if (!result.isValid) {
      setInlinePhoneError(result.message || 'Please enter a valid phone number.');
    } else {
      setInlinePhoneError(null);
    }
  }, [nationalNumber, country]);

  // Main generation handler
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGenerating) return;

    setIsPhoneTouched(true);

    // Validate phone number
    const validation = validatePhoneNumber(nationalNumber, country);

    if (!validation.isValid) {
      if (validation.error === 'empty') {
        showToast({
          id: 'toast-missing-phone',
          variant: 'warning',
          message: 'Please enter a phone number to continue.',
        });
        setInlinePhoneError(null);
      } else {
        showToast({
          id: 'toast-invalid-phone',
          variant: 'error',
          message: 'Please enter a valid phone number.',
        });
        setInlinePhoneError(validation.message || 'Please enter a valid phone number.');
      }
      return;
    }

    setInlinePhoneError(null);
    setIsGenerating(true);

    const currentReqId = ++generationIdRef.current;

    try {
      const dialDigits = extractDigits(country.dialCode);
      const cleanNational = extractDigits(nationalNumber);
      const fullDigits = `${dialDigits}${cleanNational}`;
      const trimmedMessage = message.trim();

      const url = buildWhatsAppUrl({
        dialCode: country.dialCode,
        nationalNumber: cleanNational,
        message: trimmedMessage,
      });

      const phoneDisplay = formatDisplayPhoneNumber(country.dialCode, cleanNational, country.code);
      const dataUrl = await generateQrDataUrl(url, { size: 1024 });

      // Guard against race conditions: only update state if this is still the newest request
      if (generationIdRef.current === currentReqId) {
        setSnapshot({
          url,
          dataUrl,
          phoneDisplay,
          digits: fullDigits,
          message: trimmedMessage,
        });

        showToast({
          id: 'toast-qr-generated',
          variant: 'success',
          message: 'QR code generated successfully!',
        });

        // On mobile/tablet, smoothly scroll preview into view
        if (window.innerWidth < 1024 && previewRef.current) {
          setTimeout(() => {
            previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    } catch {
      if (generationIdRef.current === currentReqId) {
        showToast({
          id: 'toast-generation-failed',
          variant: 'error',
          message: 'Unable to generate QR code. Please try again.',
        });
      }
    } finally {
      if (generationIdRef.current === currentReqId) {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <QrCode className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                WhatsApp QR Generator
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Create and share scannable QR codes for WhatsApp chats
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Client-Side</span>
            </span>

            {/* Hamburger / Share Menu Button */}
            <button
              type="button"
              onClick={() => setIsShareMenuOpen(true)}
              aria-label="Open menu and share app"
              aria-expanded={isShareMenuOpen}
              className="flex items-center gap-2 h-10 px-3 sm:px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              <Menu className="w-4 h-4 text-slate-700" />
              <span className="hidden xs:inline">Share App</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Intro Banner */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Generate WhatsApp Chat QR Code
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-1.5 max-w-2xl">
            Create a custom, high-resolution QR code that opens a direct WhatsApp chat with your phone number and optional pre-filled message.
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form (Left Column) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7">
            <form onSubmit={handleGenerate} className="flex flex-col gap-6" noValidate>
              {/* Phone Field */}
              <PhoneField
                country={country}
                onCountryChange={(newCountry) => {
                  setCountry(newCountry);
                  if (inlinePhoneError) setInlinePhoneError(null);
                }}
                nationalNumber={nationalNumber}
                onNationalNumberChange={(newNumber) => {
                  setNationalNumber(newNumber);
                  if (inlinePhoneError) setInlinePhoneError(null);
                }}
                error={inlinePhoneError}
                touched={isPhoneTouched}
                onBlur={handlePhoneBlur}
                disabled={isGenerating}
              />

              {/* Message Field */}
              <MessageField
                message={message}
                onMessageChange={setMessage}
                disabled={isGenerating}
              />

              {/* Tips block */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
                <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Tip: Test your QR code by scanning with your phone’s camera or the WhatsApp camera to verify the chat loads instantly.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating QR Code...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{snapshot ? 'Update QR Code' : 'Generate QR Code'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Preview (Right Column) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24" ref={previewRef}>
            {snapshot ? (
              <QrPreview
                snapshot={snapshot}
                isStale={isStale}
                onRegenerate={() => handleGenerate()}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>

      {/* How to Use Section */}
      <HowToUseSection />

      {/* Frequently Asked Questions */}
      <FaqSection />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-5">
          {/* Brand */}
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <QrCode className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span>WhatsApp QR Generator</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            Create and share QR codes that make starting WhatsApp conversations effortless.
          </p>

          {/* Social & Contact Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <a
              href="https://github.com/thanks-to-visit/connect-with-me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-950 border border-slate-200 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>

            <a
              href="https://linkedin.com/in/gitanuj993"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-950 border border-slate-200 transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
              <span>LinkedIn</span>
            </a>

            <a
              href="https://anuj-tanwar.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-950 border border-slate-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Website</span>
            </a>

            <a
              href="mailto:anujtawar42@gmail.com"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-950 border border-slate-200 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span>Email</span>
            </a>
          </div>

          <p className="text-xs text-slate-500 max-w-xl">
            Your phone number and message are processed locally in your browser. We do not store your information.
          </p>

          <p className="text-[11px] text-slate-400 max-w-xl">
            This tool is independent and not affiliated with, authorized, maintained, sponsored, or endorsed by WhatsApp Inc. or Meta Platforms, Inc.
          </p>

          {/* Bottom Copyright & Made with in India */}
          <div className="pt-4 border-t border-slate-100 w-full max-w-md flex flex-col items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium text-slate-600">
              Made with 🧡 in India
            </span>
            <span>
              &copy; 2026 Anuj Tanwar. All rights reserved.
            </span>
          </div>
        </div>
      </footer>

      {/* Share / Hamburger Menu Drawer */}
      <ShareMenuDrawer
        isOpen={isShareMenuOpen}
        onClose={() => setIsShareMenuOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
