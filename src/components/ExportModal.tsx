import React, { useState } from 'react';
import { Expense, KittyContribution, Member, SettlementRecord, SimplifiedDebt, Trip } from '../types';
import { formatMoney } from '../utils/format';
import { getCurrencyInfo } from '../utils/currency';
import { TranslationDictionary } from '../utils/i18n';
import { 
  X, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Share2 
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  expenses: Expense[];
  settlements: SettlementRecord[];
  kittyContributions: KittyContribution[];
  simplifiedDebts: SimplifiedDebt[];
  currency?: string;
  t?: TranslationDictionary;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  trip,
  expenses,
  settlements,
  kittyContributions,
  simplifiedDebts,
  currency = 'INR',
  t,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const activeCurrency = trip.currency || currency || 'INR';
  const currInfo = getCurrencyInfo(activeCurrency);
  const formatPrice = (amt: number) => formatMoney(amt, activeCurrency);

  if (!isOpen) return null;

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Helper to get member name
  const getMemberName = (id?: string) => {
    if (!id) return 'Unknown';
    const m = trip.members.find((member) => member.id === id);
    return m ? m.name : 'Unknown';
  };

  // CSV Generator
  const handleDownloadCsv = () => {
    const headers = [
      'Date',
      'Expense Title',
      'Category',
      `Amount (${currInfo.code})`,
      'Paid By',
      'Split Type',
      'Split Breakdown',
      'Notes',
    ];

    const rows = expenses.map((e) => {
      let paidByStr = '';
      if (e.paidBy.type === 'SINGLE') {
        paidByStr = getMemberName(e.paidBy.singlePayerId);
      } else if (e.paidBy.type === 'KITTY') {
        paidByStr = 'Trip Kitty / Cash Pot';
      } else if (e.paidBy.type === 'MULTI') {
        paidByStr = (e.paidBy.payers || [])
          .map((p) => `${getMemberName(p.memberId)}: ${currInfo.symbol}${p.amount}`)
          .join('; ');
      }

      const splitStr = e.splits
        .map((s) => `${getMemberName(s.memberId)}: ${currInfo.symbol}${s.amount}`)
        .join('; ');

      return [
        `"${e.date}"`,
        `"${e.title.replace(/"/g, '""')}"`,
        `"${e.category}"`,
        `"${e.amount}"`,
        `"${paidByStr.replace(/"/g, '""')}"`,
        `"${e.splitType}"`,
        `"${splitStr.replace(/"/g, '""')}"`,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${trip.name.replace(/\s+/g, '_')}_Expenses_${currInfo.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp / Clipboard summary generator
  const generateWhatsAppSummary = () => {
    let text = `🌴 *${trip.name} - Trip Expense Settlement in ${currInfo.code} (${currInfo.symbol})*\n`;
    text += `📍 Destination: ${trip.destination}\n`;
    text += `🗓️ Dates: ${trip.startDate} to ${trip.endDate}\n`;
    text += `💰 Total Spend: ${formatPrice(totalExpenseAmount)}\n`;
    text += `👥 Average per friend: ${formatPrice(totalExpenseAmount / (trip.members.length || 1))}\n\n`;

    text += `*⚖️ FINAL SETTLEMENTS (WHO OWES WHOM):*\n`;
    if (simplifiedDebts.length === 0) {
      text += `🎉 All debts are settled! Nobody owes anyone.\n`;
    } else {
      simplifiedDebts.forEach((debt) => {
        const from = getMemberName(debt.fromMemberId);
        const to = getMemberName(debt.toMemberId);
        const toMember = trip.members.find((m) => m.id === debt.toMemberId);
        const upi = toMember && toMember.upiId ? `(UPI: ${toMember.upiId})` : '';
        text += `• ${from} owes ${to} ${formatPrice(debt.amount)} ${upi}\n`;
      });
    }

    text += `\n*🧾 Major Expenses:*\n`;
    expenses.slice(0, 5).forEach((e) => {
      text += `• ${e.title} - ${formatPrice(e.amount)} (${e.category})\n`;
    });

    text += `\n_Generated via RupeeSplit_`;
    return text;
  };

  const handleCopySummary = () => {
    const text = generateWhatsAppSummary();
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Export & Printable Summary
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All amounts in {currInfo.name} ({currInfo.symbol})
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

        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center justify-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl transition-colors font-medium text-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Download CSV ({currInfo.symbol})</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="flex items-center justify-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 rounded-xl transition-colors font-medium text-xs"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Copied for WhatsApp!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Copy for WhatsApp</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-colors font-medium text-xs"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Print / Save PDF</span>
            </button>
          </div>

          {/* Printable Report Preview */}
          <div
            id="printable-report"
            className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-800/50 space-y-4 text-xs font-sans text-slate-900 dark:text-slate-100"
          >
            <div className="border-b border-slate-200 dark:border-slate-700 pb-3 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{trip.name}</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {trip.destination} · {trip.startDate} to {trip.endDate}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  All Figures in {currInfo.code} ({currInfo.symbol})
                </span>
                <p className="font-mono font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
                  Total: {formatPrice(totalExpenseAmount)}
                </p>
              </div>
            </div>

            {/* Debts Table */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Net Settlements (Simplified)
              </h4>
              {simplifiedDebts.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 italic">All debts are fully settled.</p>
              ) : (
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="p-2 font-semibold">Payer (Debtor)</th>
                        <th className="p-2 font-semibold">Receiver (Creditor)</th>
                        <th className="p-2 font-semibold text-right">Amount ({currInfo.symbol})</th>
                        <th className="p-2 font-semibold">Payee UPI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {simplifiedDebts.map((d) => {
                        const creditor = trip.members.find((m) => m.id === d.toMemberId);
                        return (
                          <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750">
                            <td className="p-2 font-medium text-slate-800 dark:text-slate-200">
                              {getMemberName(d.fromMemberId)}
                            </td>
                            <td className="p-2 font-medium text-slate-800 dark:text-slate-200">
                              {getMemberName(d.toMemberId)}
                            </td>
                            <td className="p-2 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-right">
                              {formatPrice(d.amount)}
                            </td>
                            <td className="p-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {creditor?.upiId || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Expenses Table Preview */}
            <div className="space-y-1.5 pt-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Expense Log ({expenses.length} entries)
              </h4>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 sticky top-0">
                    <tr>
                      <th className="p-2 font-semibold">Date</th>
                      <th className="p-2 font-semibold">Expense</th>
                      <th className="p-2 font-semibold">Category</th>
                      <th className="p-2 font-semibold">Paid By</th>
                      <th className="p-2 font-semibold text-right">Amount ({currInfo.symbol})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {expenses.map((e) => {
                      let payer = '';
                      if (e.paidBy.type === 'SINGLE') {
                        payer = getMemberName(e.paidBy.singlePayerId);
                      } else if (e.paidBy.type === 'KITTY') {
                        payer = 'Trip Kitty';
                      } else {
                        payer = 'Multiple';
                      }
                      return (
                        <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750">
                          <td className="p-2 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {e.date}
                          </td>
                          <td className="p-2 font-medium text-slate-800 dark:text-slate-200">{e.title}</td>
                          <td className="p-2 text-slate-600 dark:text-slate-400">{e.category}</td>
                          <td className="p-2 text-slate-600 dark:text-slate-400">{payer}</td>
                          <td className="p-2 font-mono font-semibold text-slate-900 dark:text-slate-100 text-right">
                            {formatPrice(e.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
