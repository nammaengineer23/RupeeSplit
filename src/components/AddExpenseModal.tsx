import React, { useState, useEffect } from 'react';
import { 
  Expense, 
  ExpenseCategory, 
  Member, 
  PayerSplit, 
  ReceiptDetails, 
  SplitType 
} from '../types';
import { formatMoney, CATEGORY_CONFIG } from '../utils/format';
import { 
  X, 
  Receipt, 
  Mic, 
  Check, 
  AlertCircle, 
  Coins, 
  Users, 
  Percent, 
  Calculator,
  Calendar,
  Layers,
  RotateCcw
} from 'lucide-react';

import { getCurrencyInfo } from '../utils/currency';
import { TranslationDictionary } from '../utils/i18n';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  tripId: string;
  members: Member[];
  kittyBalance: number;
  initialData?: Partial<Expense>;
  onOpenScanner?: () => void;
  onOpenVoiceInput?: () => void;
  currency?: string;
  t?: TranslationDictionary;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  tripId,
  members,
  kittyBalance,
  initialData,
  onOpenScanner,
  onOpenVoiceInput,
  currency = 'INR',
  t,
}) => {
  const currInfo = getCurrencyInfo(currency);
  const formatPrice = (amt: number) => formatMoney(amt, currency);
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Drinks');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [receiptDetails, setReceiptDetails] = useState<ReceiptDetails | undefined>(undefined);

  // Payer state: 'SINGLE' | 'MULTI' | 'KITTY'
  const [payerType, setPayerType] = useState<'SINGLE' | 'MULTI' | 'KITTY'>('SINGLE');
  const [singlePayerId, setSinglePayerId] = useState<string>(members[0]?.id || '');
  const [multiPayers, setMultiPayers] = useState<Record<string, string>>({});

  // Split state: 'EQUAL' | 'UNEQUAL' | 'PERCENTAGE'
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  // Opt-out checkboxes for equal split (default: all members included)
  const [equalIncluded, setEqualIncluded] = useState<Record<string, boolean>>({});
  // Unequal split values in ₹
  const [unequalAmounts, setUnequalAmounts] = useState<Record<string, string>>({});
  // Percentage split values
  const [percentageShares, setPercentageShares] = useState<Record<string, string>>({});

  const [formError, setFormError] = useState<string | null>(null);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const draftStorageKey = `rupeesplit_expense_draft_${tripId}`;

  // Reset form helper
  const resetToEmptyDefaults = () => {
    setTitle('');
    setAmountStr('');
    setCategory('Food & Drinks');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setReceiptDetails(undefined);
    setPayerType('SINGLE');
    setSinglePayerId(members[0]?.id || '');

    const initialIncluded: Record<string, boolean> = {};
    const initialMulti: Record<string, string> = {};
    const initialUnequal: Record<string, string> = {};
    const initialPerc: Record<string, string> = {};

    const defaultPerc = members.length > 0 ? (100 / members.length).toFixed(1) : '0';
    members.forEach((m) => {
      initialIncluded[m.id] = true;
      initialMulti[m.id] = '';
      initialUnequal[m.id] = '';
      initialPerc[m.id] = defaultPerc;
    });

    setEqualIncluded(initialIncluded);
    setMultiPayers(initialMulti);
    setUnequalAmounts(initialUnequal);
    setPercentageShares(initialPerc);
    setSplitType('EQUAL');
  };

  // Discard draft completely
  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(draftStorageKey);
    } catch {
      // ignore
    }
    setIsDraftRestored(false);
    setIsDraftSaved(false);
    resetToEmptyDefaults();
  };

  // Initialize or reset when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setIsDraftRestored(false);
        setIsDraftSaved(false);
        setTitle(initialData.title || '');
        setAmountStr(initialData.amount ? initialData.amount.toString() : '');
        setCategory(initialData.category || 'Food & Drinks');
        setDate(initialData.date || new Date().toISOString().split('T')[0]);
        setNotes(initialData.notes || '');
        setReceiptDetails(initialData.receiptDetails);

        if (initialData.paidBy) {
          setPayerType(initialData.paidBy.type);
          if (initialData.paidBy.singlePayerId) {
            setSinglePayerId(initialData.paidBy.singlePayerId);
          }
          if (initialData.paidBy.payers) {
            const mpObj: Record<string, string> = {};
            initialData.paidBy.payers.forEach((p) => {
              mpObj[p.memberId] = p.amount.toString();
            });
            setMultiPayers(mpObj);
          }
        }

        if (initialData.splitType) {
          setSplitType(initialData.splitType);
        }
        if (initialData.splits) {
          const eqObj: Record<string, boolean> = {};
          const unObj: Record<string, string> = {};
          const pcObj: Record<string, string> = {};
          members.forEach((m) => {
            const found = initialData.splits?.find((s) => s.memberId === m.id);
            eqObj[m.id] = !!found && found.amount > 0;
            unObj[m.id] = found ? found.amount.toString() : '0';
            pcObj[m.id] = found?.percentage ? found.percentage.toString() : '0';
          });
          setEqualIncluded(eqObj);
          setUnequalAmounts(unObj);
          setPercentageShares(pcObj);
        }
      } else {
        // Check for saved incomplete draft in local storage
        let restoredFromDraft = false;
        try {
          const savedDraftRaw = localStorage.getItem(draftStorageKey);
          if (savedDraftRaw) {
            const draft = JSON.parse(savedDraftRaw);
            if (draft && (draft.title?.trim() || draft.amountStr?.trim() || draft.notes?.trim() || draft.receiptDetails)) {
              setTitle(draft.title || '');
              setAmountStr(draft.amountStr || '');
              setCategory(draft.category || 'Food & Drinks');
              setDate(draft.date || new Date().toISOString().split('T')[0]);
              setNotes(draft.notes || '');
              setReceiptDetails(draft.receiptDetails);
              setPayerType(draft.payerType || 'SINGLE');
              setSinglePayerId(draft.singlePayerId || members[0]?.id || '');
              setMultiPayers(draft.multiPayers || {});
              setSplitType(draft.splitType || 'EQUAL');
              setEqualIncluded(draft.equalIncluded || {});
              setUnequalAmounts(draft.unequalAmounts || {});
              setPercentageShares(draft.percentageShares || {});
              setIsDraftRestored(true);
              setIsDraftSaved(true);
              restoredFromDraft = true;
            }
          }
        } catch (e) {
          console.warn('Failed to recover expense draft from localStorage:', e);
        }

        if (!restoredFromDraft) {
          setIsDraftRestored(false);
          setIsDraftSaved(false);
          resetToEmptyDefaults();
        }
      }
      setFormError(null);
    }
  }, [isOpen, initialData, members, draftStorageKey]);

  // Auto-save incomplete draft to local storage as user types
  useEffect(() => {
    // Only auto-save if modal is open, not editing an existing persisted expense
    if (!isOpen || initialData) return;

    const hasAnyContent = title.trim().length > 0 || amountStr.trim().length > 0 || notes.trim().length > 0 || !!receiptDetails;

    if (hasAnyContent) {
      const draftPayload = {
        title,
        amountStr,
        category,
        date,
        notes,
        receiptDetails,
        payerType,
        singlePayerId,
        multiPayers,
        splitType,
        equalIncluded,
        unequalAmounts,
        percentageShares,
        updatedAt: Date.now(),
      };
      try {
        localStorage.setItem(draftStorageKey, JSON.stringify(draftPayload));
        setIsDraftSaved(true);
      } catch (err) {
        console.warn('Could not auto-save expense draft to localStorage:', err);
      }
    } else {
      // If user wiped all fields, clear the draft
      try {
        localStorage.removeItem(draftStorageKey);
      } catch {
        // ignore
      }
      setIsDraftSaved(false);
      setIsDraftRestored(false);
    }
  }, [
    isOpen,
    initialData,
    draftStorageKey,
    title,
    amountStr,
    category,
    date,
    notes,
    receiptDetails,
    payerType,
    singlePayerId,
    multiPayers,
    splitType,
    equalIncluded,
    unequalAmounts,
    percentageShares,
  ]);

  if (!isOpen) return null;

  const totalAmount = parseFloat(amountStr) || 0;

  // Calculation for Multi-payer total
  const multiPayerSum = Object.values(multiPayers).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const multiPayerDiff = totalAmount - multiPayerSum;

  // Equal split calculations
  const includedCount = Object.values(equalIncluded).filter(Boolean).length;
  const equalPerPerson = includedCount > 0 ? totalAmount / includedCount : 0;

  // Unequal split calculations
  const unequalSum = Object.values(unequalAmounts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const unequalDiff = totalAmount - unequalSum;

  // Percentage split calculations
  const percentageSum = Object.values(percentageShares).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const percentageDiff = 100 - percentageSum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Please enter an expense title or merchant name.');
      return;
    }

    if (isNaN(totalAmount) || totalAmount <= 0) {
      setFormError('Please enter a valid amount in ₹ greater than 0.');
      return;
    }

    // Validate Payer
    let finalPaidBy: Expense['paidBy'] = { type: 'SINGLE', singlePayerId };

    if (payerType === 'KITTY') {
      if (kittyBalance < totalAmount) {
        setFormError(
          `Insufficient Group Fund balance! Available: ${formatPrice(kittyBalance)}, but the expense is ${formatPrice(totalAmount)}. Add money to the Group Fund or select an individual payer.`
        );
        return;
      }
      finalPaidBy = { type: 'KITTY' };
    } else if (payerType === 'MULTI') {
      if (Math.abs(multiPayerDiff) > 1) {
        setFormError(
          `Multi-payer sum (${formatPrice(multiPayerSum)}) must exactly equal the total expense amount (${formatPrice(totalAmount)}). Difference: ${formatPrice(multiPayerDiff)}`
        );
        return;
      }
      const payersList: PayerSplit[] = [];
      for (const [mId, val] of Object.entries(multiPayers)) {
        const valNum = parseFloat(val) || 0;
        if (valNum > 0) {
          payersList.push({ memberId: mId, amount: valNum });
        }
      }
      finalPaidBy = { type: 'MULTI', payers: payersList };
    } else {
      if (!singlePayerId) {
        setFormError('Please select who paid for this expense.');
        return;
      }
      finalPaidBy = { type: 'SINGLE', singlePayerId };
    }

    // Validate Splits
    const finalSplits: Expense['splits'] = [];

    if (splitType === 'EQUAL') {
      if (includedCount === 0) {
        setFormError('At least one friend must be included in the split.');
        return;
      }
      members.forEach((m) => {
        if (equalIncluded[m.id]) {
          finalSplits.push({
            memberId: m.id,
            amount: Math.round(equalPerPerson * 100) / 100,
          });
        }
      });
    } else if (splitType === 'UNEQUAL') {
      if (Math.abs(unequalDiff) > 1) {
        setFormError(
          `Total of unequal splits (${formatPrice(unequalSum)}) does not match ${formatPrice(totalAmount)}. Remaining to allocate: ${formatPrice(unequalDiff)}`
        );
        return;
      }
      members.forEach((m) => {
        const amt = parseFloat(unequalAmounts[m.id]) || 0;
        if (amt > 0) {
          finalSplits.push({ memberId: m.id, amount: amt });
        }
      });
    } else if (splitType === 'PERCENTAGE') {
      if (Math.abs(percentageDiff) > 0.5) {
        setFormError(`Shares must sum up to exactly 100%. Current sum: ${percentageSum.toFixed(1)}%`);
        return;
      }
      members.forEach((m) => {
        const pc = parseFloat(percentageShares[m.id]) || 0;
        if (pc > 0) {
          const splitAmt = Math.round(((totalAmount * pc) / 100) * 100) / 100;
          finalSplits.push({
            memberId: m.id,
            amount: splitAmt,
            percentage: pc,
          });
        }
      });
    }

    onSaveExpense({
      tripId,
      title: title.trim(),
      amount: totalAmount,
      category,
      date,
      paidBy: finalPaidBy,
      splitType,
      splits: finalSplits,
      notes: notes.trim(),
      receiptDetails,
    });

    // Clear saved draft on successful expense creation
    try {
      localStorage.removeItem(draftStorageKey);
    } catch {
      // ignore
    }
    setIsDraftSaved(false);
    setIsDraftRestored(false);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base">
              {currInfo.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {initialData?.title ? 'Edit Expense' : (t?.addExpense || 'Add New Expense')}
                </h2>
                {isDraftSaved && !initialData && (title.trim() || amountStr.trim() || notes.trim()) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Auto-saved</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Record in {currInfo.name} ({currInfo.symbol})</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Smart Actions */}
            {onOpenScanner && (
              <button
                type="button"
                onClick={onOpenScanner}
                title="Scan Bill / OCR"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Scan Bill</span>
              </button>
            )}

            {onOpenVoiceInput && (
              <button
                type="button"
                onClick={onOpenVoiceInput}
                title="Voice or Natural Language"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-md border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Voice Input</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-5 flex-1">
          {/* Recovered Draft Notification Banner */}
          {isDraftRestored && !initialData && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium">
                <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Restored incomplete expense draft from your previous session.</span>
              </div>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="ml-3 shrink-0 text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100 font-bold underline text-xs cursor-pointer"
              >
                Discard Draft
              </button>
            </div>
          )}

          {formError && (
            <div className="flex items-start gap-2.5 p-3 text-xs bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-lg">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Title and Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Expense Title / Merchant <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Highway Dhaba, Fisherman's Wharf, Shell Fuel"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Amount ({currInfo.symbol}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400 dark:text-slate-500">
                  {currInfo.symbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  placeholder="0"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full text-sm pl-7 pr-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg font-mono font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full text-sm px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {(
                  [
                    'Food & Drinks',
                    'Travel/Fuel',
                    'Stay/Hotel',
                    'Activities',
                    'Groceries',
                    'Misc',
                  ] as ExpenseCategory[]
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Paid By Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Who Paid?</span>
              </label>

              {/* Segmented Payer Mode */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setPayerType('SINGLE')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    payerType === 'SINGLE'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Single Friend
                </button>
                <button
                  type="button"
                  onClick={() => setPayerType('KITTY')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    payerType === 'KITTY'
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Group Fund
                </button>
                <button
                  type="button"
                  onClick={() => setPayerType('MULTI')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    payerType === 'MULTI'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Multi-Payer
                </button>
              </div>
            </div>

            {/* Payer Sub-Panel */}
            {payerType === 'SINGLE' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSinglePayerId(m.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                      singlePayerId === m.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${m.avatarColor}`}
                    >
                      {m.initials}
                    </div>
                    <span className="truncate">{m.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            )}

            {payerType === 'KITTY' && (
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-200 font-medium">
                  <span>Group Fund Balance</span>
                  <span className="font-mono font-bold">{formatPrice(kittyBalance)} available</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Deducts directly from pooled upfront group cash (ideal for tolls, tea, snacks, local market).
                </p>
                {totalAmount > kittyBalance && (
                  <p className="text-rose-600 dark:text-rose-400 font-semibold text-[11px] pt-1">
                    ⚠️ Group Fund balance ({formatPrice(kittyBalance)}) is less than the expense ({formatPrice(totalAmount)}).
                  </p>
                )}
              </div>
            )}

            {payerType === 'MULTI' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>Specify who paid how much:</span>
                  <span
                    className={`font-mono font-semibold ${
                      Math.abs(multiPayerDiff) < 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {Math.abs(multiPayerDiff) < 1
                      ? '✓ Exact match'
                      : `${currInfo.symbol}${Math.abs(multiPayerDiff).toFixed(0)} ${
                          multiPayerDiff > 0 ? 'remaining' : 'over'
                        }`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700"
                    >
                      <span className="truncate font-medium text-slate-700 dark:text-slate-300">{m.name}</span>
                      <div className="relative w-28">
                        <span className="absolute left-2 top-1.5 text-xs text-slate-400 dark:text-slate-500">{currInfo.symbol}</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={multiPayers[m.id] || ''}
                          onChange={(e) =>
                            setMultiPayers({ ...multiPayers, [m.id]: e.target.value })
                          }
                          className="w-full text-xs pl-5 pr-2 py-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded font-mono tabular-nums"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Split Method Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Split Method</span>
              </label>

              {/* Split Type Selector */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setSplitType('EQUAL')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    splitType === 'EQUAL'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Equal (Opt-out)
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('UNEQUAL')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    splitType === 'UNEQUAL'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Exact ({currInfo.symbol})
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('PERCENTAGE')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    splitType === 'PERCENTAGE'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Percentages %
                </button>
              </div>
            </div>

            {/* Split Details Body */}
            {splitType === 'EQUAL' && (
              <div className="space-y-2 bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Include friends in this split:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {formatPrice(equalPerPerson)} / person ({includedCount} friends)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {members.map((m) => {
                    const isInc = !!equalIncluded[m.id];
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          setEqualIncluded({ ...equalIncluded, [m.id]: !isInc })
                        }
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                          isInc
                            ? 'bg-white dark:bg-slate-800 border-indigo-400 dark:border-indigo-500 text-slate-800 dark:text-slate-200 shadow-2xs font-medium'
                            : 'bg-slate-100/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 line-through'
                        }`}
                      >
                        <span className="truncate">{m.name.split(' ')[0]}</span>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center ${
                            isInc ? 'bg-indigo-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isInc && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {splitType === 'UNEQUAL' && (
              <div className="space-y-2 bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>Custom amount per friend in {currInfo.symbol}:</span>
                  <span
                    className={`font-mono font-semibold ${
                      Math.abs(unequalDiff) < 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {Math.abs(unequalDiff) < 1
                      ? '✓ Balanced'
                      : `${currInfo.symbol}${Math.abs(unequalDiff).toFixed(2)} ${
                          unequalDiff > 0 ? 'remaining to split' : 'over-allocated'
                        }`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700"
                    >
                      <span className="truncate font-medium text-slate-700 dark:text-slate-300">{m.name}</span>
                      <div className="relative w-28">
                        <span className="absolute left-2 top-1.5 text-xs text-slate-400 dark:text-slate-500">{currInfo.symbol}</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={unequalAmounts[m.id] || ''}
                          onChange={(e) =>
                            setUnequalAmounts({
                              ...unequalAmounts,
                              [m.id]: e.target.value,
                            })
                          }
                          className="w-full text-xs pl-5 pr-2 py-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded font-mono tabular-nums"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {splitType === 'PERCENTAGE' && (
              <div className="space-y-2 bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>Percentage shares (%):</span>
                  <span
                    className={`font-mono font-semibold ${
                      Math.abs(percentageDiff) < 0.5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {percentageSum.toFixed(1)}% / 100%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {members.map((m) => {
                    const pc = parseFloat(percentageShares[m.id]) || 0;
                    const calculatedAmount = (totalAmount * pc) / 100;
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700"
                      >
                        <div className="truncate">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{m.name}</span>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {formatPrice(calculatedAmount)}
                          </span>
                        </div>
                        <div className="relative w-24">
                          <input
                            type="number"
                            step="any"
                            placeholder="0"
                            value={percentageShares[m.id] || ''}
                            onChange={(e) =>
                              setPercentageShares({
                                ...percentageShares,
                                [m.id]: e.target.value,
                              })
                            }
                            className="w-full text-xs pr-6 pl-2 py-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded font-mono tabular-nums text-right"
                          />
                          <span className="absolute right-2 top-1.5 text-xs text-slate-400 dark:text-slate-500">%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Receipt Items View (if attached) */}
          {receiptDetails && receiptDetails.items && receiptDetails.items.length > 0 && (
            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-amber-900 dark:text-amber-200">
                <span>Scanned Invoice Line Items</span>
                <span>Tax/GST: {formatPrice(receiptDetails.gst || 0)}</span>
              </div>
              <div className="space-y-1">
                {receiptDetails.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                    <span>{it.name}</span>
                    <span className="font-mono">{formatPrice(it.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notes / Remarks</label>
            <input
              type="text"
              placeholder="e.g. Paid via Google Pay at Baga beach"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Total: <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatPrice(totalAmount)}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Save Expense ({currInfo.symbol})
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
