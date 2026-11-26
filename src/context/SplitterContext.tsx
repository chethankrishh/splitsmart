import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Group, Expense } from '../types/splitter';

interface SplitterState {
  groups: Group[];
  expenses: Expense[];
}

type Action =
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'DELETE_GROUP'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string };

const initialState: SplitterState = { groups: [], expenses: [] };

function splitterReducer(state: SplitterState, action: Action): SplitterState {
  switch (action.type) {
    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.payload] };
    case 'DELETE_GROUP':
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== action.payload),
        expenses: state.expenses.filter((e) => e.groupId !== action.payload),
      };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.payload) };
    default:
      return state;
  }
}

interface SplitterContextValue extends SplitterState {
  dispatch: React.Dispatch<Action>;
}

const SplitterContext = createContext<SplitterContextValue | undefined>(undefined);

export function SplitterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(splitterReducer, initialState);
  return (
    <SplitterContext.Provider value={{ ...state, dispatch }}>
      {children}
    </SplitterContext.Provider>
  );
}

export function useSplitter() {
  const ctx = useContext(SplitterContext);
  if (!ctx) throw new Error('useSplitter must be used within SplitterProvider');
  return ctx;
}
