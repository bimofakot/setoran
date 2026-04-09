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

export const TransactionList = ({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        setDeletingId(id);
        await onDelete(id);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-lg">Tidak ada transaksi ditemukan</p>
        <p className="text-slate-400 text-sm">Mulai dengan menambahkan transaksi baru</p>
      </div>
    );
  }

  // Group transactions by date
  const groupedByDate = transactions.reduce((acc, transaction) => {
    const dateKey = formatDate(transaction.date, 'short');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedByDate).map(([dateKey, dayTransactions]) => (
        <div key={dateKey}>
          <div className="sticky top-0 bg-gradient-to-r from-slate-100 to-slate-50 py-2 px-4 rounded-lg mb-2">
            <p className="font-semibold text-slate-700">{dateKey}</p>
            <div className="flex gap-6 text-sm">
              <span className="text-green-600">
                + {formatCurrency(
                  dayTransactions
                    .filter((t) => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </span>
              <span className="text-red-600">
                - {formatCurrency(
                  dayTransactions
                    .filter((t) => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </span>
            </div>
          </div>

          <div className="space-y-0 mb-6 rounded-xl overflow-hidden border border-gray-100">
            {dayTransactions.map((transaction, idx) => (
              <div
                key={transaction.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 sm:py-4 hover:shadow-md transition-all gap-3 sm:gap-4 border-b border-gray-50 last:border-b-0 ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className={`
                    p-2 sm:p-3 rounded-full flex-shrink-0
                    ${
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }
                  `}>
                    {transaction.type === 'income' ? (
                      <TrendingUp size={18} />
                    ) : (
                      <TrendingDown size={18} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm sm:text-base">
                      {transaction.category}
                    </p>
                    {transaction.description && (
                      <p className="text-xs sm:text-sm text-slate-500 truncate">{transaction.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <div className="text-left sm:text-right">
                    <p className={`
                      font-bold text-base sm:text-lg
                      ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}
                    `}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>

                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-1.5 sm:p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      disabled={deletingId === transaction.id}
                      className="p-1.5 sm:p-2 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
