import { useState, useEffect } from 'react';
import { Input, Select, Button, Dialog, Textarea } from './ui';
import type { Transaction } from '../types';
import { useCategories } from '../hooks/useCategories';

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>) => Promise<void>;
  initialData?: Transaction;
  loading?: boolean;
}

const formatDisplay = (raw: string) => {
  const num = raw.replace(/\D/g, '');
  if (!num) return '';
  return new Intl.NumberFormat('id-ID').format(Number(num));
};

export const TransactionForm = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  loading = false,
}: TransactionFormProps) => {
  const { getByType } = useCategories();
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [customCategory, setCustomCategory] = useState('');
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
      setCustomCategory('');
    } else {
      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      setCustomCategory('');
    }
    setErrors({});
  }, [open, initialData]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip semua non-digit, simpan sebagai raw
    const raw = e.target.value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, amount: raw }));
  };

  const isCustom = formData.category.includes('Lainnya');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.category) newErrors.category = 'Kategori harus dipilih';
    if (isCustom && !customCategory.trim()) newErrors.category = 'Nama kategori kustom harus diisi';
    if (!formData.amount || Number(formData.amount) <= 0)
      newErrors.amount = 'Jumlah harus lebih dari 0';
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
        category: isCustom ? customCategory.trim() : formData.category,
        amount: Number(formData.amount),
        description: formData.description,
        date: new Date(formData.date),
        userId: '',
      } as Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const categories = getByType(formData.type);

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
          onChange={(e) => {
            setFormData({ ...formData, category: e.target.value });
            setCustomCategory('');
          }}
          options={categories.map((cat) => ({ value: cat, label: cat }))}
          error={errors.category}
        />

        {/* Custom category input — muncul jika pilih "Lainnya" */}
        {isCustom && (
          <Input
            label="Nama Kategori Kustom"
            type="text"
            placeholder="Contoh: Arisan, Zakat, Hobi..."
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
          />
        )}

        {/* Amount */}
        <Input
          label="Jumlah (IDR)"
          type="text"
          inputMode="numeric"
          value={formatDisplay(formData.amount)}
          onChange={handleAmountChange}
          error={errors.amount}
          placeholder="Contoh: 100.000"
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
          placeholder="Contoh: Makan siang di warung, bayar listrik bulan ini..."
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
