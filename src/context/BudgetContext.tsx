import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Category, BudgetExpense } from '../types/budget';

interface BudgetState {
  categories: Category[];
  expenses: BudgetExpense[];
}

type Action =
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: BudgetExpense }
  | { type: 'DELETE_EXPENSE'; payload: string };

const initialState: BudgetState = { categories: [], expenses: [] };

function budgetReducer(state: BudgetState, action: Action): BudgetState {
  switch (action.type) {
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c,
        ),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
        expenses: state.expenses.filter((e) => e.categoryId !== action.payload),
      };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.payload) };
    default:
      return state;
  }
}

interface BudgetContextValue extends BudgetState {
  dispatch: React.Dispatch<Action>;
}

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  return (
    <BudgetContext.Provider value={{ ...state, dispatch }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used within BudgetProvider');
  return ctx;
}
