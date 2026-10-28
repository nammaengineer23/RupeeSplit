import React, { useState } from 'react';
import { Member } from '../types';
import { formatINR } from '../utils/format';
import { X, Coins, Plus, CheckCircle2 } from 'lucide-react';

interface KittyModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onAddContributions: (contributions: { memberId: string; amount: number; note?: string }[]) => void;
}

export const KittyModal: React.FC<KittyModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddContributions,
}) => {
  const [equalAmount, setEqualAmount] = useState('2000');
  const [useEqual, setUseEqual] = useState(true);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [note, setNote] = useState('Group Fund contribution');

  React.useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      members.forEach((m) => {
        initial[m.id] = equalAmount;
      });
      setCustomAmounts(initial);
    }
  }, [isOpen, equalAmount, members]);

  if (!isOpen) return null;

  const totalCalculated = useEqual
    ? (parseFloat(equalAmount) || 0) * members.length
    : Object.values(customAmounts).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCalculated <= 0) return;

    const list: { memberId: string; amount: number; note?: string }[] = [];

    if (useEqual) {
      const amt = parseFloat(equalAmount) || 0;
      if (amt > 0) {
        members.forEach((m) => {
          list.push({ memberId: m.id, amount: amt, note });
        });
      }
    } else {
      members.forEach((m) => {
        const amt = parseFloat(customAmounts[m.id]) || 0;
        if (amt > 0) {
          list.push({ memberId: m.id, amount: amt, note });
        }
      });
    }

    onAddContributions(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/70 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Add to Group Fund
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Collect money upfront for travel, food, accommodation, and other shared expenses.
              </p>
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
          {/* Quick mode switch */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Contribution Mode</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setUseEqual(true)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  useEqual ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Equal per friend
              </button>
              <button
                type="button"
                onClick={() => setUseEqual(false)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  !useEqual ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Custom amounts
              </button>
            </div>
          </div>

          {useEqual ? (
            <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Amount per member in ₹
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={equalAmount}
                  onChange={(e) => setEqualAmount(e.target.value)}
                  className="w-full text-sm pl-7 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {members.length} friends × {formatINR(parseFloat(equalAmount) || 0)} ={' '}
                <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                  {formatINR(totalCalculated)} total Group Fund
                </span>
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{m.name}</span>
                  <div className="relative w-28">
                    <span className="absolute left-2 top-1.5 text-xs text-slate-400">₹</span>
                    <input
                      type="number"
                      value={customAmounts[m.id] || ''}
                      onChange={(e) =>
                        setCustomAmounts({ ...customAmounts, [m.id]: e.target.value })
                      }
                      className="w-full text-xs pl-5 pr-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Note */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Note / Reason</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Total to add:{' '}
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                {formatINR(totalCalculated)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={totalCalculated <= 0}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Group Fund</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
