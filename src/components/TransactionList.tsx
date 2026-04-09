import { useState } from 'react';
import type { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

// Map category to emoji
const CATEGORY_EMOJI: Record<string, string> = {
  'Gaji': '💼', 'Salary': '💼', 'Freelance': '💻', 'Investasi': '📈',
  'Makanan': '🍜', 'Food': '🍜', 'Makan': '🍜',
  'Transport': '🚗', 'Transportasi': '🚗',
  'Belanja': '🛍️', 'Shopping': '🛍️',
  'Hiburan': '🎮', 'Entertainment': '🎮',
  'Kesehatan': '💊', 'Health': '💊',
  'Pendidikan': '📚', 'Education': '📚',
  'Tagihan': '📄', 'Bills': '📄', 'Listrik': '⚡', 'Air': '💧',
  'Tabungan': '🏦', 'Savings': '🏦',
  'Lainnya': '📦', 'Other': '📦',
};

const getCategoryEmoji = (category: string) => {
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJI)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return category.charAt(0).toUpperCase();
};

export const TransactionList = ({ transactions, onEdit, onDelete }: TransactionListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    setDeletingId(id);
    try { await onDelete(id); } finally { setDeletingId(null); }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-white/3 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/06">
          <span className="text-3xl">📭</span>
        </div>
        <p className="text-slate-400 font-semibold">Belum ada transaksi</p>
        <p className="text-slate-600 text-sm mt-1">Mulai catat pemasukan atau pengeluaran kamu</p>
      </div>
    );
  }

  const grouped = transactions.reduce((acc, t) => {
    const key = formatDate(t.date, 'short');
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([dateKey, dayTx]) => {
        const dayIncome  = dayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const dayExpense = dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return (
          <div key={dateKey}>
            {/* Date header */}
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{dateKey}</p>
              </div>
              <div className="flex gap-3 text-xs font-semibold">
                {dayIncome  > 0 && <span className="text-emerald-400">+{formatCurrency(dayIncome)}</span>}
                {dayExpense > 0 && <span className="text-red-400">−{formatCurrency(dayExpense)}</span>}
              </div>
            </div>

            {/* Rows */}
            <div className="rounded-xl overflow-hidden border border-white/06 divide-y divide-white/04">
              {dayTx.map((t, idx) => {
                const emoji = getCategoryEmoji(t.category);
                const isEmoji = emoji.length > 1;
                return (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 px-4 py-3.5 group transition-colors hover:bg-white/[0.03] ${idx % 2 === 1 ? 'bg-white/[0.012]' : ''}`}
                  >
                    {/* Category icon */}
                    <div className={`cat-icon shrink-0 ${
                      t.type === 'income'
                        ? 'bg-emerald-500/8 border border-emerald-500/16'
                        : 'bg-red-500/8 border border-red-500/16'
                    }`}>
                      {isEmoji ? (
                        <span className="text-base">{emoji}</span>
                      ) : (
                        <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>{emoji}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{t.category}</p>
                      {t.description && <p className="text-xs text-slate-500 truncate mt-0.5">{t.description}</p>}
                      <p className="text-xs text-slate-600 mt-0.5">
                        {new Date(t.date).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                        </p>
                        <div className={`flex items-center justify-end gap-0.5 mt-0.5 ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {t.type === 'income'
                            ? <TrendingUp size={10} />
                            : <TrendingDown size={10} />}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        <button onClick={() => onEdit(t)}
                          className="p-1.5 rounded-lg hover:bg-violet-500/12 text-slate-600 hover:text-violet-400 transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(t.id)} disabled={deletingId === t.id}
                          className="p-1.5 rounded-lg hover:bg-red-500/12 text-slate-600 hover:text-red-400 transition-colors disabled:opacity-40">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
