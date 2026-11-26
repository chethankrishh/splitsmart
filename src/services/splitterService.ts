// Splitter data-access layer — will delegate to SQLite once db.ts is wired up.
import type { Group, Expense } from '../types/splitter';

export async function getGroups(): Promise<Group[]> {
  return [];
}

export async function saveGroup(group: Group): Promise<void> {
  // TODO: INSERT OR REPLACE INTO groups
}

export async function deleteGroup(id: string): Promise<void> {
  // TODO: DELETE FROM groups WHERE id = ?
}

export async function getExpensesByGroup(groupId: string): Promise<Expense[]> {
  return [];
}

export async function saveExpense(expense: Expense): Promise<void> {
  // TODO: INSERT OR REPLACE INTO expenses
}

export async function deleteExpense(id: string): Promise<void> {
  // TODO: DELETE FROM expenses WHERE id = ?
}
