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
  // Separate into debtors (net balance < 0) and creditors (net balance > 0)
  interface Party {
    memberId: string;
    amount: number;
  }

  const debtors: Party[] = [];
  const creditors: Party[] = [];

  Object.values(balances).forEach((b) => {
    const rounded = Math.round(b.netBalance * 100) / 100;
    if (rounded < -0.5) {
      debtors.push({ memberId: b.memberId, amount: -rounded }); // positive debt amount
    } else if (rounded > 0.5) {
      creditors.push({ memberId: b.memberId, amount: rounded });
    }
  });

  // Sort descending by amount for efficient matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const simplified: SimplifiedDebt[] = [];
  let dIndex = 0;
  let cIndex = 0;

  while (dIndex < debtors.length && cIndex < creditors.length) {
    const debtor = debtors[dIndex];
    const creditor = creditors[cIndex];

    const settleAmount = Math.min(debtor.amount, creditor.amount);

    if (settleAmount >= 1) {
      simplified.push({
        id: `debt-${debtor.memberId}-${creditor.memberId}-${simplified.length}`,
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amount: Math.round(settleAmount),
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.5) {
      dIndex++;
    }
    if (creditor.amount < 0.5) {
      cIndex++;
    }
  }

  return simplified;
}
