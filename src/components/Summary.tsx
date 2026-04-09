import type { Transaction } from '../types';
import { formatCurrency } from '../utils/helpers';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface SummaryProps {
  transactions: Transaction[];
  dateLabel: string;
}

export const Summary = ({ transactions, dateLabel }: SummaryProps) => {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 w-full">
      {/* Income Card */}
      <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-2xl shadow-sm hover:scale-[1.02] transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 font-medium mb-1">Pemasukan</p>
            <p className="text-2xl font-bold text-green-600 md:text-3xl">
              {formatCurrency(income)}
            </p>
            <p className="text-xs text-green-600 mt-2">{dateLabel}</p>
          </div>
          <div className="p-3 bg-green-200 rounded-full">
            <TrendingUp size={24} className="text-green-600" />
          </div>
        </div>
      </div>

      {/* Expense Card */}
      <div className="card bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 rounded-2xl shadow-sm hover:scale-[1.02] transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-700 font-medium mb-1">Pengeluaran</p>
            <p className="text-2xl font-bold text-red-600 md:text-3xl">
              {formatCurrency(expense)}
            </p>
            <p className="text-xs text-red-600 mt-2">{dateLabel}</p>
          </div>
          <div className="p-3 bg-red-200 rounded-full">
            <TrendingDown size={24} className="text-red-600" />
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className={`card bg-gradient-to-br border-l-4 col-span-1 sm:col-span-2 lg:col-span-1 rounded-2xl shadow-sm hover:scale-[1.02] transition-all ${
        balance >= 0
          ? 'from-blue-50 to-blue-100 border-blue-500'
          : 'from-yellow-50 to-yellow-100 border-yellow-500'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium mb-1 ${
              balance >= 0 ? 'text-blue-700' : 'text-yellow-700'
            }`}>
              Saldo
            </p>
            <p className={`text-2xl font-bold md:text-3xl ${
              balance >= 0 ? 'text-blue-600' : 'text-yellow-600'
            }`}>
              {formatCurrency(balance)}
            </p>
            <p className={`text-xs mt-2 ${
              balance >= 0 ? 'text-blue-600' : 'text-yellow-600'
            }`}>{dateLabel}</p>
          </div>
          <div className={`p-3 rounded-full ${
            balance >= 0 ? 'bg-blue-200' : 'bg-yellow-200'
          }`}>
            <Wallet size={24} className={balance >= 0 ? 'text-blue-600' : 'text-yellow-600'} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface WidgetProps {
  transactions: Transaction[];
}

export const QuickStats = ({ transactions }: WidgetProps) => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const incomeCount = transactions.filter((t) => t.type === 'income').length;
  const expenseCount = transactions.filter((t) => t.type === 'expense').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="card text-center">
        <p className="text-xs text-slate-600 font-medium">Total Pemasukan</p>
        <p className="text-lg font-bold text-green-600 md:text-xl">
          {formatCurrency(totalIncome)}
        </p>
        <p className="text-xs text-slate-500">{incomeCount} transaksi</p>
      </div>

      <div className="card text-center">
        <p className="text-xs text-slate-600 font-medium">Total Pengeluaran</p>
        <p className="text-lg font-bold text-red-600 md:text-xl">
          {formatCurrency(totalExpense)}
        </p>
        <p className="text-xs text-slate-500">{expenseCount} transaksi</p>
      </div>

      <div className="card text-center">
        <p className="text-xs text-slate-600 font-medium">Total Saldo</p>
        <p className={`text-lg font-bold md:text-xl ${
          balance >= 0 ? 'text-blue-600' : 'text-yellow-600'
        }`}>
          {formatCurrency(balance)}
        </p>
        <p className="text-xs text-slate-500">Total</p>
      </div>

      <div className="card text-center">
        <p className="text-xs text-slate-600 font-medium">Rata-rata Harian</p>
        <p className="text-lg font-bold text-slate-700 md:text-xl">
          {formatCurrency(
            transactions.length > 0 ? balance / transactions.length : 0
          )}
        </p>
        <p className="text-xs text-slate-500">Per transaksi</p>
      </div>
    </div>
  );
};
