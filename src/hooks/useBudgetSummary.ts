import { useMemo } from 'react';
import { useBudget } from '../context/BudgetContext';
import { today, startOfMonth } from '../utils/date';
import type { CategorySummary } from '../types/budget';

export function useBudgetSummary(period: 'daily' | 'monthly' = 'monthly'): CategorySummary[] {
  const { categories, expenses } = useBudget();

  return useMemo(() => {
    const from = period === 'daily' ? today() : startOfMonth();

    return categories
      .filter((c) => c.period === period)
      .map((cat) => {
        const spent = expenses
          .filter((e) => e.categoryId === cat.id && e.date >= from)
          .reduce((sum, e) => sum + e.amount, 0);

        return {
          ...cat,
          spent,
          remaining: Math.max(0, cat.limit - spent),
          percentUsed: cat.limit > 0 ? Math.min(100, (spent / cat.limit) * 100) : 0,
        };
      });
  }, [categories, expenses, period]);
}
