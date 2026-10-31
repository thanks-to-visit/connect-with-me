import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-save-contact',
    question: 'Does the person scanning need to save my phone number first?',
    answer:
      'No! That is the main advantage of a WhatsApp QR code. Anyone who scans your QR code with their mobile phone camera or WhatsApp scanner is taken directly into a chat with you, without needing to add your number to their address book first.',
  },
  {
    id: 'faq-expiration',
    question: 'Will my generated QR code ever expire?',
    answer:
      'No, your QR code will never expire. It encodes a standard, direct WhatsApp link (https://wa.me/...). As long as your phone number remains registered on WhatsApp, the QR code remains active indefinitely.',
  },
  {
    id: 'faq-privacy',
    question: 'Are my phone number and message kept private?',
    answer:
      'Yes, 100%. All QR code generation is processed entirely in your web browser (client-side). Your phone number and pre-filled message are never sent to a server, logged, stored in databases, or shared with third parties.',
  },
  {
    id: 'faq-print-quality',
    question: 'Can I print this QR code on business cards, menus, or posters?',
    answer:
      'Yes. The downloaded PNG exports at a crisp 1024 × 1024 pixels with Level M error correction and standard quiet zone margins. This provides sharp, scannable clarity on business cards, flyers, packaging, storefront stickers, and signage.',
  },
  {
    id: 'faq-prefilled-message',
    question: 'How does the pre-filled message work?',
    answer:
      'When someone scans your QR code, your optional pre-filled message is automatically loaded into their WhatsApp text input. They only need to tap "Send" to start the chat, saving them time and letting you know where they found your code.',
  },
  {
    id: 'faq-update-code',
    question: 'Can I change my phone number or message after downloading?',
    answer:
      'Because these are static QR codes containing the direct link within the graphic itself, changing your phone number or text requires generating and downloading a new QR code. There are no fees or limits on how many you can create.',
  },
];

export const FaqSection: React.FC = () => {
  // First item open by default
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['faq-save-contact']));

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section
      aria-labelledby="faq-heading"
      className="border-t border-slate-200/80 bg-slate-50/50 py-12 sm:py-16"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Got Questions?</span>
          </span>
          <h2
            id="faq-heading"
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Everything you need to know about generating and using WhatsApp QR codes.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((faq) => {
            const isOpen = openIds.has(faq.id);
            const buttonId = `faq-btn-${faq.id}`;
            const panelId = `faq-panel-${faq.id}`;

            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-5 sm:px-6 py-4.5 flex items-center justify-between text-left gap-4 hover:bg-slate-50/80 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-inset cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-emerald-100/80 text-emerald-700' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150"
                  >
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust Highlight Box */}
        <div className="mt-10 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                100% Free & Privacy-Friendly
              </h3>
              <p className="text-xs text-slate-500">
                No sign-up required, no watermarks on your QR codes, and zero data collected.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-700 text-white">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unlimited Scans</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
