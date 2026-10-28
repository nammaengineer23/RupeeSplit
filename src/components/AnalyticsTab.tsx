import React from 'react';
import { Expense, ExpenseCategory, Member, MemberBalance } from '../types';
import { formatMoney, CATEGORY_CONFIG } from '../utils/format';
import { getCurrencyInfo } from '../utils/currency';
import { TranslationDictionary } from '../utils/i18n';
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Award, 
  Coffee, 
  CreditCard, 
  ShieldCheck, 
  Flame, 
  Calendar,
  Sparkles,
  Users
} from 'lucide-react';

interface AnalyticsTabProps {
  expenses: Expense[];
  members: Member[];
  balances: Record<string, MemberBalance>;
  kittyBalance: number;
  currency?: string;
  t?: TranslationDictionary;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  expenses,
  members,
  balances,
  kittyBalance,
  currency = 'INR',
  t,
}) => {
  const currInfo = getCurrencyInfo(currency);
  const formatPrice = (amt: number) => formatMoney(amt, currency);
  const totalGroupSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgPerPerson = totalGroupSpend / Math.max(1, members.length);

  // Category breakdown
  const categoryTotals: Record<ExpenseCategory, number> = {
    'Stay/Hotel': 0,
    'Food & Drinks': 0,
    'Travel/Fuel': 0,
    Activities: 0,
    Groceries: 0,
    Misc: 0,
  };

  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const categoryList = (Object.keys(categoryTotals) as ExpenseCategory[])
    .map((cat) => ({
      category: cat,
      amount: categoryTotals[cat],
      percentage: totalGroupSpend > 0 ? (categoryTotals[cat] / totalGroupSpend) * 100 : 0,
      config: CATEGORY_CONFIG[cat],
    }))
    .sort((a, b) => b.amount - a.amount);

  // Daily Spending Timeline
  const dailyTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    dailyTotals[e.date] = (dailyTotals[e.date] || 0) + e.amount;
  });

  const dailySorted = Object.entries(dailyTotals)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, amount]) => ({ date, amount }));

  const maxDailyAmount = Math.max(1, ...dailySorted.map((d) => d.amount));

  // Determine Trip Wrapped Superlatives:
  // 1. Group Banker: paid the highest total amount
  let bankerId = members[0]?.id;
  let maxPaid = -1;
  members.forEach((m) => {
    const paid = balances[m.id]?.totalPaid || 0;
    if (paid > maxPaid) {
      maxPaid = paid;
      bankerId = m.id;
    }
  });
  const banker = members.find((m) => m.id === bankerId);

  // 2. Budget Ninja: lowest share/consumed
  let ninjaId = members[0]?.id;
  let minOwed = Infinity;
  members.forEach((m) => {
    const owed = balances[m.id]?.totalOwed || 0;
    if (owed < minOwed) {
      minOwed = owed;
      ninjaId = m.id;
    }
  });
  const ninja = members.find((m) => m.id === ninjaId);

  // 3. Big Splurger: who paid for the largest single transaction
  const biggestExpense: Expense | undefined = expenses.reduce<Expense | undefined>(
    (max, e) => (!max || e.amount > max.amount ? e : max),
    undefined
  );
  const splurgerMember = biggestExpense?.paidBy.singlePayerId
    ? members.find((m) => m.id === biggestExpense.paidBy.singlePayerId)
    : null;

  // 4. Chai & Foodie King: most transactions in Food & Drinks
  const foodCount: Record<string, number> = {};
  members.forEach((m) => (foodCount[m.id] = 0));
  expenses
    .filter((e) => e.category === 'Food & Drinks')
    .forEach((e) => {
      if (e.paidBy.singlePayerId && foodCount[e.paidBy.singlePayerId] !== undefined) {
        foodCount[e.paidBy.singlePayerId]++;
      }
    });

  let chaiLoverId = members[0]?.id;
  let maxFoodTransactions = -1;
  Object.entries(foodCount).forEach(([mId, count]) => {
    if (count > maxFoodTransactions) {
      maxFoodTransactions = count;
      chaiLoverId = mId;
    }
  });
  const chaiLover = members.find((m) => m.id === chaiLoverId);

  return (
    <div className="space-y-6">
      {/* 4 Main Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            Total Group Spend
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tracking-tight tabular-nums block">
            {formatPrice(totalGroupSpend)}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{currInfo.name} ({currInfo.code})</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            Avg Per Friend
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-indigo-700 dark:text-indigo-400 tracking-tight tabular-nums block">
            {formatPrice(avgPerPerson)}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Across {members.length} friends</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            Top Spender
          </span>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
              {banker ? banker.name.split(' ')[0] : '-'}
            </span>
            <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
              ({formatPrice(maxPaid)})
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Paid highest upfront</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            Available Group Fund Balance
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tracking-tight tabular-nums block">
            {formatPrice(kittyBalance)}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Available for shared group expenses</span>
        </div>
      </div>

      {/* Category Breakdown & Daily Chart Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Breakdown Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Category Breakdown ({currInfo.symbol})</span>
            </h4>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold">
              {formatPrice(totalGroupSpend)}
            </span>
          </div>

          {/* Stacked Category Progress Bar */}
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
            {categoryList.map((cat) => {
              if (cat.percentage === 0) return null;
              return (
                <div
                  key={cat.category}
                  title={`${cat.category}: ${formatPrice(cat.amount)} (${cat.percentage.toFixed(1)}%)`}
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.config.accent,
                  }}
                  className="h-full transition-all duration-500"
                />
              );
            })}
          </div>

          {/* Category List Rows */}
          <div className="space-y-2 pt-1">
            {categoryList.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.config.accent }}
                  />
                  <span className="font-medium text-slate-800 dark:text-slate-200">{item.category}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                    {item.percentage.toFixed(1)}%
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatPrice(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Spending Timeline */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Daily Spending Timeline</span>
            </h4>
            <span className="text-xs text-slate-400 dark:text-slate-500">{dailySorted.length} Active Days</span>
          </div>

          <div className="space-y-3 pt-1">
            {dailySorted.map((d) => {
              const barWidth = Math.round((d.amount / maxDailyAmount) * 100);
              return (
                <div key={d.date} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-slate-600 dark:text-slate-400 font-medium">{d.date}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatPrice(d.amount)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fun "Trip Wrapped" Cards */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Trip Wrapped & Superlatives</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Fun badges based on actual trip spending data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: The Group Banker */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                The Group Banker
              </span>
              <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">{banker?.name || 'Friend'}</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Paid an upfront total of <strong className="font-mono text-slate-800 dark:text-slate-200">{formatPrice(maxPaid)}</strong> for hotels & bills.
              </p>
            </div>
          </div>

          {/* Card 2: Chai & Snacks Lover */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Chai & Snacks Lover
              </span>
              <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">{chaiLover?.name || 'Friend'}</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Always ready for the next roadside dhaba, tea stop, and cafe feast!
              </p>
            </div>
          </div>

          {/* Card 3: Big Splurger */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 hover:border-rose-300 dark:hover:border-rose-700 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                Highest Single Bill
              </span>
              <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {splurgerMember?.name || biggestExpense?.title || 'Villa / Resort'}
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Single bill of <strong className="font-mono text-slate-800 dark:text-slate-200">{formatPrice(biggestExpense?.amount || 0)}</strong> on {biggestExpense?.title}.
              </p>
            </div>
          </div>

          {/* Card 4: Budget Ninja */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                Budget Ninja
              </span>
              <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">{ninja?.name || 'Friend'}</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Smartest spender with lowest consumed share of <strong className="font-mono text-slate-800 dark:text-slate-200">{formatPrice(minOwed)}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
