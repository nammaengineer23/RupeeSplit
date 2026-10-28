import { ExpenseCategory } from '../types';
import { formatCurrency, getCurrencyInfo } from './currency';

/**
 * Formats a number into any supported currency (INR, USD, EUR, GBP, AED, THB, SGD, etc.)
 */
export function formatMoney(
  amount: number,
  currencyCode = 'INR',
  showDecimals = false
): string {
  return formatCurrency(amount, currencyCode, showDecimals);
}

/**
 * Formats a number into Indian Rupee format (en-IN)
 * e.g., 1250 -> ₹1,250 | 150000 -> ₹1,50,000 | 1000000 -> ₹10,00,000
 */
export function formatINR(amount: number, showDecimals = false): string {
  return formatCurrency(amount, 'INR', showDecimals);
}

/**
 * Compact currency formatting
 */
export function formatCompactINR(amount: number, currencyCode = 'INR'): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  const info = getCurrencyInfo(currencyCode);
  if (abs >= 10000000) {
    return `${sign}${info.symbol}${(abs / 10000000).toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}${info.symbol}${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}${info.symbol}${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}${info.symbol}${abs.toFixed(0)}`;
}

/**
 * Generate a standard UPI payment URL link
 * format: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
 */
export function generateUPILink(
  upiId: string,
  payeeName: string,
  amount: number,
  note = 'Trip Settlement'
): string {
  const cleanUpi = (upiId || '').trim();
  const cleanName = (payeeName || 'Friend').trim();
  const validAmount = Math.max(0, amount).toFixed(2);
  const cleanNote = note.trim();

  return `upi://pay?pa=${encodeURIComponent(cleanUpi)}&pn=${encodeURIComponent(cleanName)}&am=${validAmount}&cu=INR&tn=${encodeURIComponent(cleanNote)}`;
}

/**
 * Generates an uppercase 6-character random trip invite code (e.g. GOA842)
 */
export function generateTripCode(prefix = 'TRIP'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix.substring(0, 3).toUpperCase()}-${code}`;
}

/**
 * Consistent category meta (colors, border, text colors)
 */
export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  {
    bg: string;
    text: string;
    border: string;
    accent: string;
  }
> = {
  'Stay/Hotel': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    accent: '#6366f1',
  },
  'Food & Drinks': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    accent: '#f59e0b',
  },
  'Travel/Fuel': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    accent: '#10b981',
  },
  Activities: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    accent: '#0ea5e9',
  },
  Groceries: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    accent: '#f43f5e',
  },
  Misc: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    accent: '#64748b',
  },
};

export const MEMBER_AVATAR_PALETTE = [
  'bg-emerald-600 text-white',
  'bg-indigo-600 text-white',
  'bg-amber-600 text-white',
  'bg-purple-600 text-white',
  'bg-rose-600 text-white',
  'bg-cyan-600 text-white',
  'bg-teal-600 text-white',
  'bg-orange-600 text-white',
];
