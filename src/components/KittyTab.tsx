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

  // Expenses paid from Group Fund (supports both 'KITTY' and 'GROUP_FUND')
  const kittyExpenses = expenses.filter(
    (e) => e.paidBy.type === 'KITTY' || (e.paidBy.type as any) === 'GROUP_FUND'
  );
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
              <h3 className="text-lg font-bold">{t?.groupFund || 'Group Fund'}</h3>
            </div>
            <p className="text-xs text-emerald-100 max-w-md">
              Collect money upfront for travel, food, accommodation, tolls, and shared expenses. Anyone in the group can pay from the fund.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenTopUpModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t?.poolMoreCash || 'Add to Group Fund'}</span>
            </button>

            <button
              onClick={onLogPettyCash}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600/80 hover:bg-emerald-600 text-white border border-white/20 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Coffee className="w-4 h-4" />
              <span>{t?.logChaiToll || 'Log Chai / Toll'}</span>
            </button>
          </div>
        </div>

        {/* 3 Metrics Strip */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10 mt-6">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl">
            <span className="text-[11px] text-emerald-200 block font-medium">
              {t?.availableKitty || 'Available Group Fund Balance'}
            </span>
            <span className="text-2xl font-bold font-mono tracking-tight tabular-nums">
              {formatPrice(remainingCash)}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl">
            <span className="text-[11px] text-emerald-200 block font-medium">
              {t?.fundCollected || 'Total Pooled'}
            </span>
            <span className="text-xl font-bold font-mono tracking-tight tabular-nums">
              {formatPrice(totalCollected)}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl">
            <span className="text-[11px] text-emerald-200 block font-medium">
              {t?.fundSpent || 'Group Fund Spent'}
            </span>
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
          <span>{t?.groupFundPot || 'Group Fund Contributions'} ({currInfo.symbol})</span>
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
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 block truncate">
                        {m.name}
                      </span>
                      {m.isArchived && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {t?.leftTrip || 'Left Trip'}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">
                      {m.upiId}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{t?.contribute || 'Contributed'}:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {formatPrice(contributed)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Petty Cash Expenses from Group Fund */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Expenses Paid from Group Fund ({kittyExpenses.length})</span>
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Deducted from the Group Fund balance
          </span>
        </div>

        {kittyExpenses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2 transition-colors">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Coins className="w-5 h-5" />
            </div>
            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              No Group Fund expenses yet
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              When paying for common items like highway tolls, group chai, or parking, select 'Group Fund' as the payer.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-2xs overflow-hidden transition-colors">
            {kittyExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {exp.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {exp.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    {exp.date} • Split equally among {exp.splits.length} friends
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatPrice(exp.amount)}
                  </span>
                  <div className="flex items-center gap-1 justify-end text-[10px] text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Paid from fund</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
