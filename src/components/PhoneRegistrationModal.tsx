import React, { useState } from 'react';
import { Smartphone, Check, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { isValidIndianMobile, normalizePhone10 } from '../utils/invite';

interface PhoneRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePhone: (phone10: string) => Promise<void>;
  currentPhone?: string;
}

export const PhoneRegistrationModal: React.FC<PhoneRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSavePhone,
  currentPhone = '',
}) => {
  const [phone, setPhone] = useState(currentPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizePhone10(phone);
    if (!isValidIndianMobile(clean)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 98765 43210)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSavePhone(clean);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Could not save phone number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Connect Mobile Number
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Discover trips friends added you to
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Enter your 10-digit mobile number so when friends add you to travel groups, RupeeSplit can automatically link you and prompt you to join their trips.
          </p>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Indian Mobile Number
            </label>
            <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent">
              <span className="px-3 py-2.5 bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-sm font-bold border-r border-slate-300 dark:border-slate-700 select-none">
                +91
              </span>
              <input
                type="tel"
                required
                autoFocus
                maxLength={14}
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError(null);
                }}
                className="flex-1 px-3 py-2.5 text-base font-mono font-bold tracking-wider text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-sm placeholder:text-slate-400"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Standard 10 digits starting with 6, 7, 8, or 9
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              Your phone number is only used to match trip invites from friends and for UPI peer-to-peer settlement suggestions.
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Skip for now
            </button>

            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Verifying...' : 'Save & Check Trips'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
