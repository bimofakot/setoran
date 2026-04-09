import type { Transaction } from '../types';
import { formatCurrency } from '../utils/helpers';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Zap, Target, Activity } from 'lucide-react';

interface SummaryProps {
  transactions: Transaction[];
  dateLabel: string;
}

export const Summary = ({ transactions, dateLabel }: SummaryProps) => {
  const income  = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;
  const savingRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {/* Income */}
      <div className="stat-card stat-card-income">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-emerald-500/6 blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/18">
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <span className="badge-income"><ArrowUpRight size={10} /> {dateLabel}</span>
        </div>
        <p className="text-xs text-slate-500 mb-1.5 uppercase tracking-wider font-semibold">Pemasukan</p>
        <p className="text-2xl font-bold text-emerald-400 tracking-tight">{formatCurrency(income)}</p>
        <div className="flex items-center gap-1.5 mt-2.5">
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700"
              style={{ width: income > 0 ? '100%' : '0%' }} />
          </div>
          <span className="text-xs text-slate-600">{transactions.filter(t => t.type === 'income').length}×</span>
        </div>
      </div>

      {/* Expense */}
      <div className="stat-card stat-card-expense">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-red-500/6 blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/18">
            <TrendingDown size={18} className="text-red-400" />
          </div>
          <span className="badge-expense"><ArrowDownRight size={10} /> {dateLabel}</span>
        </div>
        <p className="text-xs text-slate-500 mb-1.5 uppercase tracking-wider font-semibold">Pengeluaran</p>
        <p className="text-2xl font-bold text-red-400 tracking-tight">{formatCurrency(expense)}</p>
        <div className="flex items-center gap-1.5 mt-2.5">
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            {income > 0 && (
              <div className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((expense / income) * 100, 100)}%` }} />
            )}
          </div>
          <span className="text-xs text-slate-600">{transactions.filter(t => t.type === 'expense').length}×</span>
        </div>
      </div>

      {/* Balance */}
      <div className="stat-card stat-card-balance">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-violet-500/6 blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl border ${balance >= 0 ? 'bg-violet-500/10 border-violet-500/18' : 'bg-amber-500/10 border-amber-500/18'}`}>
            <Wallet size={18} className={balance >= 0 ? 'text-violet-400' : 'text-amber-400'} />
          </div>
          {income > 0 && (
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              savingRate >= 0
                ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {savingRate}% hemat
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-1.5 uppercase tracking-wider font-semibold">Saldo Bersih</p>
        <p className={`text-2xl font-bold tracking-tight ${balance >= 0 ? 'text-gradient' : 'text-amber-400'}`}>
          {formatCurrency(balance)}
        </p>
        <div className="flex items-center gap-1.5 mt-2.5">
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${balance >= 0 ? 'bg-gradient-to-r from-violet-500 to-indigo-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'}`}
              style={{ width: income > 0 ? `${Math.max(Math.min(savingRate, 100), 0)}%` : '0%' }} />
          </div>
          <span className="text-xs text-slate-600">{transactions.length} total</span>
        </div>
      </div>
    </div>
  );
};

export const QuickStats = ({ transactions }: { transactions: Transaction[] }) => {
  const income  = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const avg = transactions.length > 0 ? (income + expense) / transactions.length : 0;
  const largest = transactions.reduce((max, t) => t.amount > max ? t.amount : max, 0);

  const stats = [
    { label: 'Rata-rata/Transaksi', value: formatCurrency(avg), color: 'text-slate-200', icon: <Activity size={13} className="text-slate-500" /> },
    { label: 'Transaksi Terbesar',  value: formatCurrency(largest), color: 'text-violet-400', icon: <Zap size={13} className="text-violet-400" /> },
    { label: 'Total Transaksi',     value: `${transactions.length}×`, color: 'text-slate-200', icon: <Target size={13} className="text-slate-500" /> },
    { label: 'Rasio Hemat',
      value: income > 0 ? `${Math.round(((income-expense)/income)*100)}%` : '—',
      color: income >= expense ? 'text-emerald-400' : 'text-red-400',
      icon: <TrendingUp size={13} className={income >= expense ? 'text-emerald-400' : 'text-red-400'} /> },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {stats.map((s) => (
        <div key={s.label} className="card-sm group cursor-default">
          <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">{s.icon}{s.label}</p>
          <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
};
