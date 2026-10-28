import React from 'react';
import { Expense, KittyContribution, Member } from '../types';
import { formatMoney } from '../utils/format';
import { getCurrencyInfo } from '../utils/currency';
import { TranslationDictionary } from '../utils/i18n';
import { 
  Coins, 
  Plus, 
  Receipt, 
  Users, 
  Wallet, 
  TrendingDown, 
  Sparkles,
  Coffee,
  CheckCircle2
} from 'lucide-react';

interface KittyTabProps {
  members: Member[];
  kittyContributions: KittyContribution[];
  expenses: Expense[];
  onOpenTopUpModal: () => void;
  onLogPettyCash: () => void;
  currency?: string;
  t?: TranslationDictionary;
}

export const KittyTab: React.FC<KittyTabProps> = ({
  members,
  kittyContributions,
  expenses,
  onOpenTopUpModal,
  onLogPettyCash,
  currency = 'INR',
  t,
}) => {
  const currInfo = getCurrencyInfo(currency);
  const formatPrice = (amt: number) => formatMoney(amt, currency);
  const getMember = (id: string) => members.find((m) => m.id === id);

  // Contributions per member
  const memberTotals: Record<string, number> = {};
  members.forEach((m) => {
    memberTotals[m.id] = 0;
  });

  let totalCollected = 0;
  kittyContributions.forEach((kc) => {
    totalCollected += kc.amount;
    memberTotals[kc.memberId] = (memberTotals[kc.memberId] || 0) + kc.amount;
  });

  // Expenses paid from Kitty
  const kittyExpenses = expenses.filter((e) => e.paidBy.type === 'KITTY');
  const totalSpent = kittyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingCash = Math.max(0, totalCollected - totalSpent);

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-base">
                {currInfo.symbol}
              </span>
              <h3 className="text-lg font-bold">Shared Trip Kitty / Cash Pot</h3>
            </div>
            <p className="text-xs text-emerald-100 max-w-md">
              Pool cash upfront so anyone can pay for expressway tolls, chai stops, snacks & auto rickshaws without stopping to split small bills.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenTopUpModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Pool More Cash</span>
            </button>

            <button
              onClick={onLogPettyCash}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600/80 hover:bg-emerald-600 text-white border border-white/20 rounded-xl text-xs font-semibold transition-colors"
            >
              <Coffee className="w-4 h-4" />
              <span>Log Chai / Toll</span>
            </button>
          </div>
        </div>

        {/* 3 Metrics Strip */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10 mt-6">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl">
            <span className="text-[11px] text-emerald-200 block font-medium">Available Cash Pot</span>
            <span className="text-2xl font-bold font-mono tracking-tight tabular-nums">
              {formatPrice(remainingCash)}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl">
            <span className="text-[11px] text-emerald-200 block font-medium">Total Pooled In</span>
            <span className="text-xl font-bold font-mono tracking-tight tabular-nums">
              {formatPrice(totalCollected)}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl">
            <span className="text-[11px] text-emerald-200 block font-medium">Petty Cash Spent</span>
            <span className="text-xl font-bold font-mono tracking-tight tabular-nums">
              {formatPrice(totalSpent)}
            </span>
          </div>
        </div>
      </div>

      {/* Member Contributions Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Cash Contributed by Friends ({currInfo.symbol})</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {members.map((m) => {
            const contributed = memberTotals[m.id] || 0;

            return (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-1 ring-white dark:ring-slate-800 ${m.avatarColor}`}
                  >
                    {m.initials}
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 block truncate">
                      {m.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">
                      {m.upiId}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Contributed:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {formatPrice(contributed)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Petty Cash Expenses from Kitty */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Petty Cash Expenses Paid from Kitty ({kittyExpenses.length})</span>
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Directly deducted from cash pot
          </span>
        </div>

        {kittyExpenses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2 transition-colors">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Coins className="w-5 h-5" />
            </div>
            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              No petty cash spent yet
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Use the shared cash pot whenever paying tolls, roadside tea, bottled water, or parking.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-2xs transition-colors">
            {kittyExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 text-xs transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                    {exp.title}
                  </span>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                    <span>{exp.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{exp.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>Split among {exp.splits.length} friends</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm block">
                    {formatPrice(exp.amount)}
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                    from Kitty
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
