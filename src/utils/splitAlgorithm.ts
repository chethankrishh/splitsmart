import type { Expense, Balance, Settlement, Member } from '../types/splitter';

/**
 * Compute net balance for each member from a list of expenses.
 * Positive net = others owe them money.
 * Negative net = they owe others money.
 *
 * Honours per-expense `customShares` when present; falls back to equal split.
 */
export function computeBalances(members: Member[], expenses: Expense[]): Balance[] {
  const net: Record<string, number> = {};
  members.forEach((m) => (net[m.id] = 0));

  for (const exp of expenses) {
    // Payer gets credited the full amount
    net[exp.paidBy] = (net[exp.paidBy] ?? 0) + exp.amount;

    if (exp.customShares) {
      // Debit each member their custom share
      for (const memberId of exp.splitAmong) {
        const share = exp.customShares[memberId] ?? 0;
        net[memberId] = (net[memberId] ?? 0) - share;
      }
    } else {
      // Equal split
      const share = exp.amount / exp.splitAmong.length;
      for (const memberId of exp.splitAmong) {
        net[memberId] = (net[memberId] ?? 0) - share;
      }
    }
  }

  return members.map((m) => ({
    memberId: m.id,
    memberName: m.name,
    net: net[m.id] ?? 0,
  }));
}

/**
 * Simplify debts: returns the minimum number of transactions needed to settle all balances.
 */
export function simplifyDebts(balances: Balance[]): Settlement[] {
  const creditors = balances.filter((b) => b.net > 0.009).map((b) => ({ ...b }));
  const debtors = balances.filter((b) => b.net < -0.009).map((b) => ({ ...b }));
  const settlements: Settlement[] = [];

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci];
    const debt = debtors[di];
    const amount = Math.min(credit.net, -debt.net);

    settlements.push({
      from: debt.memberId,
      fromName: debt.memberName,
      to: credit.memberId,
      toName: credit.memberName,
      amount: parseFloat(amount.toFixed(2)),
    });

    credit.net -= amount;
    debt.net += amount;

    if (Math.abs(credit.net) < 0.009) ci++;
    if (Math.abs(debt.net) < 0.009) di++;
  }

  return settlements;
}
