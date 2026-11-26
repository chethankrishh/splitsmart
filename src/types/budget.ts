export type PeriodType = 'daily' | 'monthly';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  limit: number;
  period: PeriodType;
}

export interface BudgetExpense {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  date: string; // ISO date string
}

export interface CategorySummary extends Category {
  spent: number;
  remaining: number;
  percentUsed: number;
}
