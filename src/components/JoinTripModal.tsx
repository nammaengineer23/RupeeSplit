import React, { useState } from 'react';
import { X, LogIn, ArrowRight, AlertCircle, Cloud } from 'lucide-react';

interface JoinTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinByCode: (code: string) => Promise<boolean>;
}

export const JoinTripModal: React.FC<JoinTripModalProps> = ({
  isOpen,
  onClose,
  onJoinByCode,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setLoading(true);
    setError(null);
    try {
      const found = await onJoinByCode(cleanCode);
      if (!found) {
        setError(`Trip code "${cleanCode}" not found in Cloud Database. Please verify with your group organizer.`);
      } else {
        onClose();
      }
    } catch (err) {
      setError('Failed to connect to cloud database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/70 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Join Existing Group Trip</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sync live expenses across all phones</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Enter the 6-character Trip Invite Code provided by your friend (e.g., <strong className="font-mono text-emerald-800 dark:text-emerald-400">GOA-2026</strong>) to instantly sync this trip on your phone.
          </p>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 rounded-lg text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Trip Invite Code</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. GOA-2026"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full text-base font-mono font-bold tracking-wider px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 uppercase placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-sm"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'Connecting...' : 'Join & Sync Trip'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
