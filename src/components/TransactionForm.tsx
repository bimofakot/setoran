import { useState, useEffect } from 'react';
import { Input, Select, Button, Dialog, Textarea } from './ui';
import type { Transaction } from '../types';

const incomeCategories = [
  'Gaji',
  'Freelance',
  'Bonus',
  'Investasi',
  'Pinjaman',
  'Lainnya',
];

const expenseCategories = [
  'Makanan & Minuman',
  'Transportasi',
  'Kesehatan',
  'Pendidikan',
  'Hiburan',
  'Tagihan',
  'Belanja',
  'Asuransi',
  'Lainnya',
];

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Transaction;
  loading?: boolean;
}

export const TransactionForm = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  loading = false,
}: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        category: initialData.category,
        amount: initialData.amount.toString(),
        description: initialData.description,
        date: new Date(initialData.date).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [open, initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) newErrors.category = 'Kategori harus dipilih';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Jumlah harus lebih dari 0';
    }
    if (!formData.date) newErrors.date = 'Tanggal harus dipilih';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit({
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: new Date(formData.date),
        userId: '',
      } as Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>);

      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const categories = formData.type === 'income' ? incomeCategories : expenseCategories;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? 'Edit Transaksi' : 'Tambah Transaksi'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
            className={`
              flex-1 py-2 px-4 rounded-lg font-medium transition-colors
              ${
                formData.type === 'income'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 text-slate-900'
              }
            `}
          >
            💰 Pemasukan
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
            className={`
              flex-1 py-2 px-4 rounded-lg font-medium transition-colors
              ${
                formData.type === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-200 text-slate-900'
              }
            `}
          >
            💸 Pengeluaran
          </button>
        </div>

        {/* Category */}
        <Select
          label="Kategori"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          options={categories.map((cat) => ({
            value: cat,
            label: cat,
          }))}
          error={errors.category}
        />

        {/* Amount */}
        <Input
          label="Jumlah (IDR)"
          type="number"
          min="0"
          step="100"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          error={errors.amount}
          inputMode="numeric"
          placeholder="Masukkan jumlah"
        />

        {/* Date */}
        <Input
          label="Tanggal"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          error={errors.date}
        />

        {/* Description */}
        <Textarea
          label="Deskripsi (Opsional)"
          placeholder="Masukkan deskripsi transaksi..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
          >
            {initialData ? 'Perbarui' : 'Tambah'} Transaksi
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
