export interface Member {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  members: Member[];
  createdAt: string;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string; // member id
  splitAmong: string[]; // member ids
  /** Optional: custom per-member share amounts (keyed by member id).
   *  If absent, split equally among splitAmong members. */
  customShares?: Record<string, number>;
  date: string;
}

export interface Balance {
  memberId: string;
  memberName: string;
  /** positive = owed money, negative = owes money */
  net: number;
}

export interface Settlement {
  from: string; // member id
  fromName: string;
  to: string;   // member id
  toName: string;
  amount: number;
}
