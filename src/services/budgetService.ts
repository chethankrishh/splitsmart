// Budget data-access layer — will delegate to SQLite once db.ts is wired up.
import type { Category, BudgetExpense } from '../types/budget';

export async function getCategories(): Promise<Category[]> {
  return [];
}

export async function saveCategory(category: Category): Promise<void> {
  // TODO: INSERT OR REPLACE INTO categories
}

export async function deleteCategory(id: string): Promise<void> {
  // TODO: DELETE FROM categories WHERE id = ?
}

export async function getExpenses(from?: string): Promise<BudgetExpense[]> {
  return [];
}

export async function saveBudgetExpense(expense: BudgetExpense): Promise<void> {
  // TODO: INSERT INTO budget_expenses
}

export async function deleteBudgetExpense(id: string): Promise<void> {
  // TODO: DELETE FROM budget_expenses WHERE id = ?
}
