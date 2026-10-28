export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-IE', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', flag: '🇬🇧' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'en-AE', flag: '🇦🇪' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH', flag: '🇹🇭' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG', flag: '🇸🇬' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', flag: '🇯🇵' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', flag: '🇦🇺' },
  { code: 'NPR', symbol: 'रू', name: 'Nepalese Rupee', locale: 'ne-NP', flag: '🇳🇵' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', locale: 'si-LK', flag: '🇱🇰' },
];

export function getCurrencyInfo(currencyCode = 'INR'): CurrencyInfo {
  const code = (currencyCode || 'INR').toUpperCase();
  const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
  return (
    found || {
      code,
      symbol: code,
      name: code,
      locale: 'en-IN',
      flag: '🌐',
    }
  );
}

/**
 * Formats a monetary amount into the specified currency
 */
export function formatCurrency(
  amount: number,
  currencyCode = 'INR',
  showDecimals = false
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    const symbol = getCurrencyInfo(currencyCode).symbol;
    return `${symbol}0`;
  }

  const curr = getCurrencyInfo(currencyCode);
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  try {
    const formatted = new Intl.NumberFormat(curr.locale, {
      style: 'currency',
      currency: curr.code,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : (curr.code === 'JPY' ? 0 : 0),
    }).format(absAmount);

    return isNegative ? `-${formatted}` : formatted;
  } catch (e) {
    // Fallback if specific currency is not supported by host Intl
    const formattedNum = absAmount.toLocaleString(curr.locale);
    const sign = isNegative ? '-' : '';
    return `${sign}${curr.symbol}${formattedNum}`;
  }
}
