import React, { useState } from 'react';
import { Member, SimplifiedDebt } from '../types';
import { formatMoney, generateUPILink } from '../utils/format';
import { getCurrencyInfo } from '../utils/currency';
import { QrCodeDisplay } from './QrCodeDisplay';
import confetti from 'canvas-confetti';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: SimplifiedDebt | null;
  debtor: Member | undefined;
  creditor: Member | undefined;
  tripName: string;
  onConfirmSettlement: (record: {
    fromMemberId: string;
    toMemberId: string;
    amount: number;
    note?: string;
    upiRef?: string;
  }) => void;
  currency?: string;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  debt,
  debtor,
  creditor,
  tripName,
  onConfirmSettlement,
  currency = 'INR',
}) => {
  const currInfo = getCurrencyInfo(currency);
  const formatPrice = (amt: number) => formatMoney(amt, currency);
  const [settleAmountStr, setSettleAmountStr] = useState<string>('');
  const [upiRef, setUpiRef] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync amount when debt changes
  React.useEffect(() => {
    if (debt) {
      setSettleAmountStr(debt.amount.toString());
      setNote(`${tripName} settlement`);
      setUpiRef('');
    }
  }, [debt, tripName]);

  if (!isOpen || !debt || !debtor || !creditor) return null;

  const settleAmount = parseFloat(settleAmountStr) || 0;
  const isPartial = settleAmount > 0 && settleAmount < debt.amount;
  const upiLink = generateUPILink(
    creditor.upiId,
    creditor.name,
    settleAmount > 0 ? settleAmount : debt.amount,
    note
  );

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(creditor.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (settleAmount <= 0) return;

    onConfirmSettlement({
      fromMemberId: debtor.id,
      toMemberId: creditor.id,
      amount: settleAmount,
      note: note.trim() || undefined,
      upiRef: upiRef.trim() || undefined,
    });

    // Confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // fallback
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              UPI
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Settle Debt via UPI
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Fast, instant Indian payments</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-5 space-y-4">
          {/* Transaction Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${debtor.avatarColor}`}
                >
                  {debtor.initials}
                </div>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{debtor.name}</span>
                  <span className="block text-[10px] text-slate-400">Payer</span>
                </div>
              </div>

              <div className="flex flex-col items-center px-2">
                <span className="text-[10px] text-slate-400 font-medium">owes</span>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="flex items-center gap-2 text-right">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{creditor.name}</span>
                  <span className="block text-[10px] text-slate-400">Receiver</span>
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${creditor.avatarColor}`}
                >
                  {creditor.initials}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Original Debt:</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                {formatPrice(debt.amount)}
              </span>
            </div>
          </div>

          {/* UPI ID & QR Code */}
          <div className="flex flex-col items-center p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800/70 space-y-2.5">
            <div className="text-center">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Scan to Pay with any UPI App
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Google Pay · PhonePe · Paytm · BHIM · CRED
              </p>
            </div>

            {/* QR Code */}
            <div className="p-1">
              <QrCodeDisplay value={upiLink} size={168} altText="UPI QR Code" />
            </div>

            {/* UPI ID Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 w-full justify-between">
              <div className="truncate">
                <span className="text-[10px] text-slate-400 block font-sans">UPI ID</span>
                <span className="font-semibold">{creditor.upiId}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpiId}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-600 dark:text-slate-300"
                title="Copy UPI ID"
              >
                {copiedUpi ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* One-Click UPI Deep Link */}
            <div className="w-full grid grid-cols-2 gap-2 pt-1">
              <a
                href={upiLink}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors text-center"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Open UPI App</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                )}
                <span>{copiedLink ? 'Copied Link!' : 'Copy Pay Link'}</span>
              </button>
            </div>
          </div>

          {/* Settle Amount & Partial Settlement */}
          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Amount to Settle ({currInfo.symbol})
                </label>
                {isPartial && (
                  <span className="text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                    Partial payment (Leaves {formatPrice(debt.amount - settleAmount)})
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-bold text-slate-400">
                  {currInfo.symbol}
                </span>
                <input
                  type="number"
                  step="any"
                  max={debt.amount}
                  min="1"
                  required
                  value={settleAmountStr}
                  onChange={(e) => setSettleAmountStr(e.target.value)}
                  className="w-full text-sm pl-7 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="UPI Ref ID (Optional)"
                value={upiRef}
                onChange={(e) => setUpiRef(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Note (e.g. Paid via GPay)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit Action */}
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
              disabled={settleAmount <= 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Record Settlement ({currInfo.symbol})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
