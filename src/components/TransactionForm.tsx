import { useState, useEffect } from 'react';
import { Input, Select, Button, Dialog, Textarea } from './ui';
import type { Transaction } from '../types';
import { useCategories } from '../hooks/useCategories';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>) => Promise<void>;
  initialData?: Transaction;
  loading?: boolean;
}

// Returns today's date in WIB (UTC+7) as YYYY-MM-DD
const todayWIB = () => {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().split('T')[0];
};

const formatDisplay = (raw: string) => {
  const num = raw.replace(/\D/g, '');
  if (!num) return '';
  return new Intl.NumberFormat('id-ID').format(Number(num));
};

export const TransactionForm = ({ open, onOpenChange, onSubmit, initialData, loading = false }: TransactionFormProps) => {
  const { getByType } = useCategories();
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    date: todayWIB(),
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
      setFormData({ type: 'expense', category: '', amount: '', description: '', date: todayWIB() });
      setCustomCategory('');
    }
    setErrors({});
  }, [open, initialData]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, amount: e.target.value.replace(/\D/g, '') }));
  };

  const isCustom = formData.category.includes('Lainnya');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.category) newErrors.category = 'Kategori harus dipilih';
    if (isCustom && !customCategory.trim()) newErrors.category = 'Nama kategori kustom harus diisi';
    if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = 'Jumlah harus lebih dari 0';
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
    <Dialog open={open} onOpenChange={onOpenChange} title={initialData ? 'Edit Transaksi' : 'Tambah Transaksi'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="flex gap-2 p-1 bg-white/3 rounded-xl border border-white/06">
          {(['income', 'expense'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData({ ...formData, type, category: '' })}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 ${
                formData.type === type
                  ? type === 'income'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-sm'
                    : 'bg-red-500/15 text-red-400 border border-red-500/25 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              {type === 'income'
                ? <><TrendingUp size={14} /> Pemasukan</>
                : <><TrendingDown size={14} /> Pengeluaran</>}
            </button>
          ))}
        </div>

        <Select
          label="Kategori"
          value={formData.category}
          onChange={(e) => { setFormData({ ...formData, category: e.target.value }); setCustomCategory(''); }}
          options={categories.map((cat) => ({ value: cat, label: cat }))}
          error={errors.category}
        />

        {isCustom && (
          <Input
            label="Nama Kategori Kustom"
            type="text"
            placeholder="Contoh: Arisan, Zakat, Hobi..."
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
          />
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jumlah (IDR)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={formatDisplay(formData.amount)}
              onChange={handleAmountChange}
              placeholder="0"
              className={`input-dark pl-9 text-lg font-bold ${errors.amount ? '!border-red-500/50' : ''}`}
            />
          </div>
          {errors.amount && <p className="text-xs text-red-400">{errors.amount}</p>}
        </div>

        <Input
          label="Tanggal"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          error={errors.date}
        />

        <Textarea
          label="Deskripsi (Opsional)"
          placeholder="Contoh: Makan siang di warung, bayar listrik bulan ini..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" fullWidth onClick={() => onOpenChange(false)}>Batal</Button>
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            {initialData ? 'Perbarui' : 'Tambah'} Transaksi
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
