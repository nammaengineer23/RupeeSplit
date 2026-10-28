import React, { useState } from 'react';
import { Member, MemberBalance, SettlementRecord, SimplifiedDebt } from '../types';
import { formatMoney, generateUPILink } from '../utils/format';
import { getCurrencyInfo } from '../utils/currency';
import { TranslationDictionary } from '../utils/i18n';
import { 
  ArrowRight, 
  CheckCircle2, 
  Smartphone, 
  History, 
  ShieldCheck, 
  Coins, 
  QrCode, 
  ExternalLink,
  Sparkles,
  Users
} from 'lucide-react';

interface SettlementTabProps {
  members: Member[];
  balances: Record<string, MemberBalance>;
  simplifiedDebts: SimplifiedDebt[];
  settlements: SettlementRecord[];
  onOpenUpiModal: (debt: SimplifiedDebt) => void;
  onQuickSettle: (record: {
    fromMemberId: string;
    toMemberId: string;
    amount: number;
    note?: string;
  }) => void;
  currency?: string;
  t?: TranslationDictionary;
}

export const SettlementTab: React.FC<SettlementTabProps> = ({
  members,
  balances,
  simplifiedDebts,
  settlements,
  onOpenUpiModal,
  onQuickSettle,
  currency = 'INR',
  t,
}) => {
  const currInfo = getCurrencyInfo(currency);
  const formatPrice = (amt: number) => formatMoney(amt, currency);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('ALL');

  const getMember = (id: string) => members.find((m) => m.id === id);

  // Filter debts if user selected a specific member
  const filteredDebts = simplifiedDebts.filter((debt) => {
    if (selectedMemberFilter === 'ALL') return true;
    return debt.fromMemberId === selectedMemberFilter || debt.toMemberId === selectedMemberFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Optimal Debt Simplification Engine
            </h3>
            <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Active Algorithm
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automatically collapses cross-debts into the fewest bilateral payments in {currInfo.name} ({currInfo.symbol}).
          </p>
        </div>

        {/* Member Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Filter by person:</span>
          <select
            value={selectedMemberFilter}
            onChange={(e) => setSelectedMemberFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Friends</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Net Balances Overview Grid */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Net Group Standing ({currInfo.symbol})</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {members.map((m) => {
            const b = balances[m.id] || { netBalance: 0, totalPaid: 0, totalOwed: 0 };
            const isOwed = b.netBalance > 0.5;
            const owes = b.netBalance < -0.5;
            const isSettled = !isOwed && !owes;

            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-xl border transition-all bg-white dark:bg-slate-900 ${
                  isOwed
                    ? 'border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-100 dark:ring-emerald-950/40'
                    : owes
                    ? 'border-rose-300 dark:border-rose-700 ring-1 ring-rose-100 dark:ring-rose-950/40'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-1 ring-white dark:ring-slate-800 ${m.avatarColor}`}
                    >
                      {m.initials}
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 block truncate max-w-[110px]">
                        {m.name}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block truncate max-w-[110px]">
                        {m.upiId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Net Balance:</span>
                    <span
                      className={`font-mono font-bold ${
                        isOwed
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : owes
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {isOwed && `+${formatPrice(b.netBalance)}`}
                      {owes && `${formatPrice(b.netBalance)}`}
                      {isSettled && `${currInfo.symbol}0 (Settled)`}
                    </span>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    <span>Paid: {formatPrice(b.totalPaid)}</span>
                    <span>Share: {formatPrice(b.totalOwed)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Simplified UPI Settlements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Optimal Settlement Transactions ({filteredDebts.length})</span>
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {simplifiedDebts.length === 0 ? 'All Settled!' : 'Fewest Bilateral Transfers'}
          </span>
        </div>

        {filteredDebts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2 transition-colors">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              No outstanding debts!
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              All friends are squared up and settled in {currInfo.name}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDebts.map((debt) => {
              const debtor = getMember(debt.fromMemberId);
              const creditor = getMember(debt.toMemberId);

              if (!debtor || !creditor) return null;

              return (
                <div
                  key={debt.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-colors space-y-3"
                >
                  {/* Bilateral Transfer Visual */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-1 ring-white dark:ring-slate-800 ${debtor.avatarColor}`}
                      >
                        {debtor.initials}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                          {debtor.name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Pays</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center px-3">
                      <span className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {formatPrice(debt.amount)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                          {creditor.name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {creditor.upiId}
                        </span>
                      </div>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-1 ring-white dark:ring-slate-800 ${creditor.avatarColor}`}
                      >
                        {creditor.initials}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenUpiModal(debt)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{currency === 'INR' ? 'Pay with UPI & QR' : `Settle & QR (${currInfo.symbol})`}</span>
                    </button>

                    <button
                      onClick={() =>
                        onQuickSettle({
                          fromMemberId: debtor.id,
                          toMemberId: creditor.id,
                          amount: debt.amount,
                          note: 'Settled via RupeeSplit',
                        })
                      }
                      className="py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      title="Mark as settled directly"
                    >
                      Mark Paid
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Settlement History Ledger */}
      {settlements.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Settlement History Ledger ({settlements.length})</span>
          </h4>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
            {settlements.map((s) => {
              const fromM = getMember(s.fromMemberId);
              const toM = getMember(s.toMemberId);

              return (
                <div
                  key={s.id}
                  className="p-3 text-xs flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {fromM?.name} paid {toM?.name}
                      </span>
                      {s.upiRef && (
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          Ref: {s.upiRef}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block">
                      {formatPrice(s.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{s.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
