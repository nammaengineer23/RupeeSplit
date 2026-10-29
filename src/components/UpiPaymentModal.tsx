import React, { useState, useEffect } from 'react';
import { Member, SimplifiedDebt } from '../types';
import { formatMoney, generateUPILink, generateAppUPILink, UpiAppScheme } from '../utils/format';
import { getCurrencyInfo } from '../utils/currency';
import { POPULAR_UPI_HANDLES } from '../utils/contacts';
import { QrCodeDisplay } from './QrCodeDisplay';
import confetti from 'canvas-confetti';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  CheckCircle2, 
  ArrowRight,
  Smartphone,
  QrCode,
  Edit2,
  Save,
  ChevronDown,
  ChevronUp,
  Zap,
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
  onUpdateCreditorUpi?: (newUpi: string) => void;
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
  onUpdateCreditorUpi,
}) => {
  const currInfo = getCurrencyInfo(currency);
  const formatPrice = (amt: number) => formatMoney(amt, currency);

  const [settleAmountStr, setSettleAmountStr] = useState<string>('');
  const [upiRef, setUpiRef] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Recipient UPI ID editing
  const [customUpiId, setCustomUpiId] = useState<string>('');
  const [isEditingUpi, setIsEditingUpi] = useState(false);

  // QR Code visibility toggle (default open on desktop, compact on mobile)
  const [showQrCode, setShowQrCode] = useState(true);

  // Sync state when debt opens
  useEffect(() => {
    if (debt && creditor) {
      setSettleAmountStr(debt.amount.toString());
      setNote(`${tripName} settlement`);
      setUpiRef('');
      setCustomUpiId(creditor.upiId || '');
      setIsEditingUpi(false);
    }
  }, [debt, creditor, tripName]);

  if (!isOpen || !debt || !debtor || !creditor) return null;

  const activeUpiId = (customUpiId || creditor.upiId || '').trim();
  const settleAmount = parseFloat(settleAmountStr) || 0;
  const isPartial = settleAmount > 0 && settleAmount < debt.amount;

  // Real-time UPI deep link leading to person's UPI ID and amount
  const upiLink = generateUPILink(
    activeUpiId,
    creditor.name,
    settleAmount > 0 ? settleAmount : debt.amount,
    note || `${tripName} settlement`
  );

  const handleCopyUpiId = () => {
    if (!activeUpiId) return;
    navigator.clipboard.writeText(activeUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLaunchUpi = (targetLink: string) => {
    try {
      window.location.href = targetLink;
    } catch {
      // Fallback
    }
  };

  const handleSaveCustomUpi = () => {
    const trimmed = customUpiId.trim();
    if (trimmed && onUpdateCreditorUpi) {
      onUpdateCreditorUpi(trimmed);
    }
    setIsEditingUpi(false);
  };

  const handleApplyUpiHandle = (handle: string) => {
    const base = customUpiId.split('@')[0] || creditor.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const updated = `${base}${handle}`;
    setCustomUpiId(updated);
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

  const effectiveAmount = settleAmount > 0 ? settleAmount : debt.amount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              UPI
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Pay with UPI
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct to {creditor.name} ({activeUpiId})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Transaction Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-1 ring-white dark:ring-slate-800 ${debtor.avatarColor}`}
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
                  <span className="block text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                    {activeUpiId}
                  </span>
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-1 ring-white dark:ring-slate-800 ${creditor.avatarColor}`}
                >
                  {creditor.initials}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Settlement Amount:</span>
              <span className="font-mono font-black text-base text-emerald-700 dark:text-emerald-400">
                {formatPrice(effectiveAmount)}
              </span>
            </div>
          </div>

          {/* PRIMARY 1-CLICK PAY WITH UPI ACTION */}
          <div className="space-y-2">
            <a
              href={upiLink}
              onClick={() => handleLaunchUpi(upiLink)}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer text-center group"
            >
              <Smartphone className="w-5 h-5 text-white shrink-0 group-hover:scale-110 transition-transform" />
              <span>Pay {formatPrice(effectiveAmount)} with UPI App</span>
              <Zap className="w-4 h-4 fill-white text-white ml-0.5" />
            </a>

            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
              Opens your UPI app with <strong>{activeUpiId}</strong> &amp; <strong>{formatPrice(effectiveAmount)}</strong> prefilled
            </p>

            {/* Direct Specific UPI App Launchers */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {(
                [
                  { id: 'gpay', name: 'GPay', scheme: 'gpay', bg: 'hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 hover:border-blue-300' },
                  { id: 'phonepe', name: 'PhonePe', scheme: 'phonepe', bg: 'hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 hover:border-purple-300' },
                  { id: 'paytm', name: 'Paytm', scheme: 'paytm', bg: 'hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-700 hover:border-sky-300' },
                  { id: 'bhim', name: 'BHIM', scheme: 'bhim', bg: 'hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-700 hover:border-orange-300' },
                ] as const
              ).map((app) => {
                const appLink = generateAppUPILink(
                  app.scheme as UpiAppScheme,
                  activeUpiId,
                  creditor.name,
                  effectiveAmount,
                  note || `${tripName} settlement`
                );

                return (
                  <a
                    key={app.id}
                    href={appLink}
                    onClick={() => handleLaunchUpi(appLink)}
                    className={`py-1.5 px-2 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${app.bg}`}
                    title={`Pay via ${app.name}`}
                  >
                    {app.name}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Payee UPI ID Verification & Inline Edit */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Payee UPI ID
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditingUpi(!isEditingUpi)}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isEditingUpi ? 'Done' : 'Change UPI ID'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyUpiId}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {isEditingUpi ? (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customUpiId}
                    onChange={(e) => setCustomUpiId(e.target.value)}
                    placeholder="e.g. rahul@okhdfcbank"
                    className="flex-1 text-xs font-mono px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomUpi}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>

                {/* Popular Handles */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-slate-400">Handles:</span>
                  {POPULAR_UPI_HANDLES.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleApplyUpiHandle(h)}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-emerald-50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 truncate">
                  {activeUpiId}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {creditor.name}
                </span>
              </div>
            )}
          </div>

          {/* QR Code Section (collapsible for sleekness) */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50">
            <button
              type="button"
              onClick={() => setShowQrCode(!showQrCode)}
              className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Scan QR Code to Pay</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-normal">
                <span>{showQrCode ? 'Hide QR' : 'Show QR'}</span>
                {showQrCode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showQrCode && (
              <div className="p-4 pt-1 flex flex-col items-center border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 animate-in fade-in duration-150">
                <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100">
                  <QrCodeDisplay value={upiLink} size={160} altText="UPI QR Code" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                  Scan with camera or scanner on Google Pay, PhonePe, Paytm, or BHIM
                </p>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied UPI URL!</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Full Payment Link</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Settle Amount & Record Form */}
          <form onSubmit={handleConfirm} className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Amount to Settle ({currInfo.symbol})
                </label>
                {isPartial && (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                    Leaves {formatPrice(debt.amount - settleAmount)} pending
                  </span>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">
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
                  className="w-full text-sm pl-7 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Amount Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSettleAmountStr(debt.amount.toString())}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  Full ({formatPrice(debt.amount)})
                </button>
                {debt.amount > 10 && (
                  <button
                    type="button"
                    onClick={() => setSettleAmountStr((Math.round(debt.amount / 2)).toString())}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    Half ({formatPrice(Math.round(debt.amount / 2))})
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="UPI Ref ID / UTR (Optional)"
                value={upiRef}
                onChange={(e) => setUpiRef(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Note (e.g. Paid via GPay)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit / Record Action */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={settleAmount <= 0}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Record Settlement ({formatPrice(effectiveAmount)})</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
