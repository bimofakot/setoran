export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyBalance {
  date: Date;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryStats {
  category: string;
  type: 'income' | 'expense';
  total: number;
  percentage: number;
  count: number;
}

export type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';
