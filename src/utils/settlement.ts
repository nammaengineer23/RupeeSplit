import { Expense, KittyContribution, Member, MemberBalance, SettlementRecord, SimplifiedDebt } from '../types';

/**
 * Calculates net balance for every member in the trip.
 * Net balance = (Amount Paid for expenses + Kitty contributions + Settlements paid to others)
 *             - (Amount Owed/Consumed for expenses + Settlements received from others)
 */
export function calculateMemberBalances(
  members: Member[],
  expenses: Expense[],
  kittyContributions: KittyContribution[],
  settlements: SettlementRecord[]
): {
  balances: Record<string, MemberBalance>;
  kittySummary: {
    totalCollected: number;
    totalSpent: number;
    remainingCash: number;
  };
} {
  const balances: Record<string, MemberBalance> = {};

  members.forEach((m) => {
    balances[m.id] = {
      memberId: m.id,
      totalPaid: 0,
      totalOwed: 0,
      kittyContributed: 0,
      netBalance: 0,
    };
  });

  let kittyCollected = 0;
  let kittySpent = 0;

  // 1. Process Kitty Contributions
  kittyContributions.forEach((contrib) => {
    kittyCollected += contrib.amount;
    if (balances[contrib.memberId]) {
      balances[contrib.memberId].kittyContributed += contrib.amount;
      balances[contrib.memberId].totalPaid += contrib.amount;
    }
  });

  // 2. Process Expenses
  expenses.forEach((expense) => {
    const { paidBy, splits, amount } = expense;

    // Who paid?
    if (paidBy.type === 'SINGLE') {
      const payerId = paidBy.singlePayerId;
      if (payerId && balances[payerId]) {
        balances[payerId].totalPaid += amount;
      }
    } else if (paidBy.type === 'MULTI') {
      (paidBy.payers || []).forEach((payer) => {
        if (balances[payer.memberId]) {
          balances[payer.memberId].totalPaid += payer.amount;
        }
      });
    } else if (paidBy.type === 'KITTY') {
      kittySpent += amount;
    }

    // Who consumed/shares?
    splits.forEach((split) => {
      if (balances[split.memberId]) {
        balances[split.memberId].totalOwed += split.amount;
      }
    });
  });

  // 3. Process direct settled transactions (Cash/UPI payments made to settle debts)
  settlements.forEach((s) => {
    if (balances[s.fromMemberId]) {
      // Debtor paid money
      balances[s.fromMemberId].totalPaid += s.amount;
    }
    if (balances[s.toMemberId]) {
      // Creditor received money
      balances[s.toMemberId].totalOwed += s.amount;
    }
  });

  // 4. Calculate Net Balances
  members.forEach((m) => {
    const b = balances[m.id];
    b.netBalance = Math.round((b.totalPaid - b.totalOwed) * 100) / 100;
  });

  const remainingCash = Math.max(0, kittyCollected - kittySpent);

  return {
    balances,
    kittySummary: {
      totalCollected: kittyCollected,
      totalSpent: kittySpent,
      remainingCash,
    },
  };
}

/**
 * Optimal Debt-Minimization Algorithm (Greedy Settlement Simplification)
 * Reduces a web of bilateral debts to the minimum number of transactions.
 */
export function simplifyDebts(
  members: Member[],
  balances: Record<string, MemberBalance>
): SimplifiedDebt[] {
  // Work in integer paise to avoid floating-point drift and preserve ₹0.01.
  interface Party {
    memberId: string;
    paise: number;
  }

  const debtors: Party[] = [];
  const creditors: Party[] = [];

  Object.values(balances).forEach((balance) => {
    const paise = Math.round(balance.netBalance * 100);
    if (paise < 0) {
      debtors.push({ memberId: balance.memberId, paise: -paise });
    } else if (paise > 0) {
      creditors.push({ memberId: balance.memberId, paise });
    }
  });

  // Largest balances first to keep the number of transfers small.
  debtors.sort((a, b) => b.paise - a.paise);
  creditors.sort((a, b) => b.paise - a.paise);

  const simplified: SimplifiedDebt[] = [];
  let dIndex = 0;
  let cIndex = 0;

  while (dIndex < debtors.length && cIndex < creditors.length) {
    const debtor = debtors[dIndex];
    const creditor = creditors[cIndex];
    const settlePaise = Math.min(debtor.paise, creditor.paise);

    if (settlePaise > 0) {
      simplified.push({
        id: `debt-${debtor.memberId}-${creditor.memberId}-${simplified.length}`,
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amount: settlePaise / 100,
      });
    }

    debtor.paise -= settlePaise;
    creditor.paise -= settlePaise;

    if (debtor.paise === 0) dIndex++;
    if (creditor.paise === 0) cIndex++;
  }

  return simplified;
}
