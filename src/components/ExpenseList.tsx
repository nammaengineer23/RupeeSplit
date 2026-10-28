import React, { useState } from 'react';
import { Expense, ExpenseCategory, Member } from '../types';
import { formatMoney, CATEGORY_CONFIG } from '../utils/format';
import { getCurrencyInfo } from '../utils/currency';
import { TranslationDictionary } from '../utils/i18n';
import { 
  Plus, 
  Receipt, 
  Mic, 
  Search, 
  Trash2, 
  Edit3, 
  Layers, 
  Coins, 
  Users, 
  FileText,
  Calendar,
  Sparkles,
  X
} from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  kittyBalance: number;
  onAddExpenseClick: () => void;
  onScanBillClick: () => void;
  onVoiceInputClick: () => void;
  onDeleteExpense: (expenseId: string) => void;
  onEditExpense: (expense: Expense) => void;
  currency?: string;
  t?: TranslationDictionary;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  members,
  kittyBalance,
  onAddExpenseClick,
  onScanBillClick,
  onVoiceInputClick,
  onDeleteExpense,
  onEditExpense,
  currency = 'INR',
  t,
}) => {
  const currInfo = getCurrencyInfo(currency);
  const formatPrice = (amt: number) => formatMoney(amt, currency);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Filtered expenses: filters by title or category (and notes) in real-time
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filtered = expenses.filter((e) => {
    const matchesSearch =
      !trimmedQuery ||
      e.title.toLowerCase().includes(trimmedQuery) ||
      e.category.toLowerCase().includes(trimmedQuery) ||
      (e.notes && e.notes.toLowerCase().includes(trimmedQuery));

    const matchesCat =
      selectedCategory === 'ALL' || e.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const isFiltering = Boolean(trimmedQuery || selectedCategory !== 'ALL');
  const totalFilteredAmount = filtered.reduce((sum, e) => sum + e.amount, 0);

  const getMember = (id?: string) => members.find((m) => m.id === id);

  return (
    <div className="space-y-4">
      {/* Top Action Bar & Smart Triggers */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-colors">
        {/* Search & Category Filter */}
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title or category (e.g. Hotel, Fuel, Cafe)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-8 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
              aria-label="Search expenses by title or category"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-2.5 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 font-medium transition-colors"
            aria-label="Filter by category"
          >
            <option value="ALL">All Categories</option>
            <option value="Stay/Hotel">Stay/Hotel</option>
            <option value="Food & Drinks">Food & Drinks</option>
            <option value="Travel/Fuel">Travel/Fuel</option>
            <option value="Activities">Activities</option>
            <option value="Groceries">Groceries</option>
            <option value="Misc">Misc</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onScanBillClick}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
            title="Scan Indian Bill / Invoice"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Scan Bill</span>
          </button>

          <button
            onClick={onVoiceInputClick}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
            title="Natural Language Voice Entry"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Voice Entry</span>
          </button>

          <button
            onClick={onAddExpenseClick}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Active Filter Pill Bar */}
      {isFiltering && (
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Filtering by:</span>
            {trimmedQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium">
                "{trimmedQuery}"
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-emerald-950 dark:hover:text-emerald-100 focus:outline-none cursor-pointer"
                  aria-label="Remove search filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 text-[11px] font-medium">
                {selectedCategory}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className="hover:text-blue-950 dark:hover:text-blue-100 focus:outline-none cursor-pointer"
                  aria-label="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-700 dark:text-slate-200 font-semibold">
              Showing {filtered.length} of {expenses.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline font-semibold text-[11px] shrink-0 ml-2 cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Quick Spending Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Total Filtered Spend</span>
          <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatPrice(totalFilteredAmount)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Group Fund Balance</span>
          <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatPrice(kittyBalance)}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Logged Entries</span>
          <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {filtered.length} {t?.expenses || 'expenses'}
          </span>
        </div>
      </div>

      {/* Expenses Table / Cards */}
      {filtered.length === 0 ? (
        expenses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 transition-colors">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No expenses recorded yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Log your first meal, hotel booking, petrol receipt or dhaba bill to begin tracking!
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={onAddExpenseClick}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t?.addExpense || 'Add Expense'}
              </button>
              <button
                onClick={onScanBillClick}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              >
                {t?.scanBill || 'Scan a Receipt'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-3 transition-colors">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No matching expenses</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No expenses match your search query{' '}
              {trimmedQuery ? <span className="font-semibold text-slate-700 dark:text-slate-200">"{searchQuery}"</span> : ''}
              {selectedCategory !== 'ALL' ? (
                <> in category <span className="font-semibold text-slate-700 dark:text-slate-200">"{selectedCategory}"</span></>
              ) : ''}
              . Try searching by title, notes, or category name.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear Search & Filters
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
          {filtered.map((exp) => {
            const catMeta = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG.Misc;
            let payerLabel = '';
            let payerAvatar: React.ReactNode = null;

            if (exp.paidBy.type === 'SINGLE') {
              const p = getMember(exp.paidBy.singlePayerId);
              payerLabel = p ? `Paid by ${p.name.split(' ')[0]}` : 'Paid by Friend';
              payerAvatar = (
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    p?.avatarColor || 'bg-slate-600 text-white'
                  }`}
                >
                  {p?.initials || 'FR'}
                </div>
              );
            } else if (exp.paidBy.type === 'KITTY') {
              payerLabel = 'Paid from Group Fund';
              payerAvatar = (
                <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-bold">
                  {currInfo.symbol}
                </div>
              );
            } else if (exp.paidBy.type === 'MULTI') {
              payerLabel = `Multi-payer (${exp.paidBy.payers?.length || 0} friends)`;
              payerAvatar = (
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                  M
                </div>
              );
            }

            return (
              <div
                key={exp.id}
                className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left side: Category, Title, Meta */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${catMeta.bg} ${catMeta.border} ${catMeta.text}`}
                  >
                    <span className="font-bold text-xs uppercase tracking-tighter">
                      {exp.category.slice(0, 3)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {exp.title}
                      </h4>
                      {exp.receiptDetails && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <Receipt className="w-2.5 h-2.5" />
                          <span>Scanned Bill</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        {payerAvatar}
                        <span>{payerLabel}</span>
                      </div>

                      <span aria-hidden="true">·</span>

                      <span>{exp.category}</span>

                      <span aria-hidden="true">·</span>

                      <span className="font-mono text-[11px]">{exp.date}</span>

                      <span aria-hidden="true">·</span>

                      <span className="text-slate-600 dark:text-slate-400">
                        {exp.splitType === 'EQUAL' && `Split equally (${exp.splits.length})`}
                        {exp.splitType === 'UNEQUAL' && `Custom ${currInfo.symbol} split`}
                        {exp.splitType === 'PERCENTAGE' && 'Percentage split'}
                      </span>
                    </div>

                    {exp.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5 truncate">
                        "{exp.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Amount and Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums block">
                      {formatPrice(exp.amount)}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      ~{formatPrice(exp.amount / Math.max(1, exp.splits.length))}/pax
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditExpense(exp)}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit expense"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
