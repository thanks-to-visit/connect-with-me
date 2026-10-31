import React, { useId } from 'react';

interface MessageFieldProps {
  message: string;
  onMessageChange: (value: string) => void;
  disabled?: boolean;
}

const MAX_LENGTH = 500;
const WARNING_THRESHOLD = 450; // 90% of 500

export const MessageField: React.FC<MessageFieldProps> = ({
  message,
  onMessageChange,
  disabled = false,
}) => {
  const textareaId = useId();
  const counterId = useId();
  const hintId = useId();

  // Count characters as the user perceives them (emojis count as 1)
  const charCount = Array.from(message).length;
  const isNearLimit = charCount >= WARNING_THRESHOLD;
  const isAtLimit = charCount >= MAX_LENGTH;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    const count = Array.from(nextVal).length;

    // Enforce 500 perceived character limit even with emojis
    if (count <= MAX_LENGTH) {
      onMessageChange(nextVal);
    } else {
      // Truncate to exactly 500 perceived chars
      const truncated = Array.from(nextVal).slice(0, MAX_LENGTH).join('');
      onMessageChange(truncated);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={textareaId} className="text-sm font-semibold text-slate-800">
          Pre-filled Message <span className="text-xs font-normal text-slate-500">(Optional)</span>
        </label>
        <span
          id={counterId}
          aria-live="polite"
          className={`text-xs font-medium font-mono transition-colors ${
            isAtLimit
              ? 'text-red-600 font-bold'
              : isNearLimit
              ? 'text-amber-600 font-semibold'
              : 'text-slate-500'
          }`}
        >
          {charCount} / {MAX_LENGTH}
        </span>
      </div>

      <div className="relative">
        <textarea
          id={textareaId}
          rows={4}
          value={message}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Hello! I found your QR code and would like to connect with you."
          aria-describedby={`${counterId} ${hintId}`}
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent hover:border-slate-400 transition-colors resize-y min-h-[96px] max-h-60 disabled:bg-slate-50 disabled:text-slate-500 shadow-xs"
        />
      </div>

      <p id={hintId} className="text-xs text-slate-500">
        When someone scans your QR code, this text will pre-fill their WhatsApp chat.
      </p>
    </div>
  );
};
