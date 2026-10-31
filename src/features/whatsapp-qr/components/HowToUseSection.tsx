import React from 'react';
import {
  PhoneCall,
  MessageSquarePlus,
  QrCode,
  Download,
  Store,
  CreditCard,
  Package,
  Share2,
  CheckCircle2,
} from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: PhoneCall,
    title: 'Enter Phone Number',
    description:
      'Select your country dial code from the searchable list and enter your WhatsApp number. The tool cleans up dashes, brackets, and extra leading zeros automatically.',
  },
  {
    step: '02',
    icon: MessageSquarePlus,
    title: 'Add Pre-filled Message',
    description:
      'Optionally craft a custom greeting (e.g. "Hi, I\'d like to ask about pricing"). When someone scans the QR, this message is automatically typed in their WhatsApp chat.',
  },
  {
    step: '03',
    icon: QrCode,
    title: 'Generate & Test Preview',
    description:
      'Click "Generate QR Code" to render your scannable code. You can test the chat link immediately in your browser to verify the phone and message format.',
  },
  {
    step: '04',
    icon: Download,
    title: 'Download & Share',
    description:
      'Export a high-resolution 1024×1024 px PNG with standard error correction and quiet margins—sharp and reliable for both print and digital displays.',
  },
];

const USE_CASES = [
  {
    icon: Store,
    title: 'Storefronts & Menus',
    description: 'Let walk-in customers scan table tents, windows, or counters to message your staff.',
  },
  {
    icon: CreditCard,
    title: 'Business Cards',
    description: 'Eliminate manual contact saving. Clients scan once to start a direct chat.',
  },
  {
    icon: Package,
    title: 'Product Packaging',
    description: 'Offer instant customer support, re-orders, or feedback right from the product box.',
  },
  {
    icon: Share2,
    title: 'Flyers & Social Media',
    description: 'Place your QR code on print flyers, presentations, banners, or Instagram stories.',
  },
];

export const HowToUseSection: React.FC = () => {
  return (
    <section
      aria-labelledby="how-to-use-heading"
      className="border-t border-slate-200/80 bg-white py-12 sm:py-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Simple 4-Step Process</span>
          </span>
          <h2
            id="how-to-use-heading"
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
          >
            How to Use This WhatsApp QR Generator
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Create high-contrast, scannable QR codes that let anyone message you on WhatsApp without saving your number first.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 sm:mb-16">
          {STEPS.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col hover:bg-slate-50 transition-colors shadow-xs"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-emerald-700">
                    <IconComponent className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800">
                    STEP {item.step}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Where to Use Your QR Code */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8">
          <div className="mb-6 text-center sm:text-left">
            <h3 className="text-lg font-bold text-slate-900">
              Popular Places to Display Your WhatsApp QR Code
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Anywhere customers or clients interact with your brand in print or on screens.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map((uc) => {
              const IconComp = uc.icon;
              return (
                <div
                  key={uc.title}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2 text-emerald-700">
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-semibold text-slate-900">{uc.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    {uc.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
