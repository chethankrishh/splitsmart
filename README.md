# SplitSmart

A React Native (Expo) app that combines two everyday money tools into one:

- **Expense Splitter** — create groups, add shared expenses, and track exactly who owes what
- **Daily Budget Tracker** — set daily/monthly budgets per category and monitor your personal spending

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native + Expo SDK 58 |
| Routing | Expo Router (file-based, `src/app/`) |
| State | React Context + `useReducer` |
| Storage | `expo-sqlite` (local) |
| Styling | StyleSheet + custom theme tokens |

## Project Structure

```
splitsmart/
├── src/
│   ├── app/                    # Expo Router screens & layouts
│   │   ├── _layout.tsx         # Root layout (tab navigator)
│   │   ├── index.tsx           # Home / Dashboard
│   │   ├── splitter/           # Expense Splitter section
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx       # Groups list
│   │   │   ├── [groupId].tsx   # Group detail & expenses
│   │   │   └── settle.tsx      # Settle-up screen
│   │   └── budget/             # Daily Budget Tracker section
│   │       ├── _layout.tsx
│   │       ├── index.tsx       # Budget overview
│   │       ├── add-expense.tsx # Log a personal expense
│   │       └── categories.tsx  # Manage budget categories
│   ├── components/             # Shared UI components
│   │   ├── common/             # Button, Card, Badge, EmptyState …
│   │   ├── splitter/           # GroupCard, ExpenseItem, BalanceSummary …
│   │   └── budget/             # BudgetBar, SpendingChart, CategoryBadge …
│   ├── context/                # Global state providers
│   │   ├── SplitterContext.tsx
│   │   └── BudgetContext.tsx
│   ├── hooks/                  # Custom hooks (useGroups, useBudget …)
│   ├── services/               # DB layer (SQLite queries)
│   │   ├── db.ts               # DB init & migrations
│   │   ├── splitterService.ts
│   │   └── budgetService.ts
│   ├── types/                  # TypeScript type definitions
│   │   ├── splitter.ts
│   │   └── budget.ts
│   └── utils/                  # Helpers (currency, date, split algorithms)
├── assets/                     # Icons, splash, images
├── App.js                      # Entry (registers root component)
├── index.js                    # Expo entry point
├── app.json                    # Expo config
└── package.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on specific platform
npx expo start --android
npx expo start --ios
```

## Roadmap

- [ ] Group creation & member management (Splitter)
- [ ] Add / edit / delete expenses (Splitter)
- [ ] Debt simplification algorithm (Splitter)
- [ ] Settle-up with payment notes (Splitter)
- [ ] Category budgets with daily/monthly limits (Budget)
- [ ] Expense logging with categories (Budget)
- [ ] Spending charts (Budget)
- [ ] Shared dashboard showing both modules
- [ ] Export data to CSV

## License

MIT
