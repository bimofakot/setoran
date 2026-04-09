import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useCategories } from '../hooks/useCategories';
import { Button } from '../components/ui';
import { User, MapPin, AtSign, Save, Plus, Trash2, Tag } from 'lucide-react';

export const ProfilePage = () => {
  const { profile, loading, saving, saveProfile } = useProfile();
  const { categories, addCategory, removeCategory } = useCategories();
  const [form, setForm] = useState({ displayName: '', username: '', city: '' });
  const [saved, setSaved] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', type: 'expense' as 'income' | 'expense' });
  const [addingCat, setAddingCat] = useState(false);

  if (!loading && form.displayName === '' && profile.displayName !== '') {
    setForm(profile);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAddCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    setAddingCat(true);
    await addCategory(newCat.name, newCat.type);
    setNewCat({ name: '', type: 'expense' });
    setAddingCat(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-blue-500 rounded-full" />
      </div>
    );
  }

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Profile Form */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Profil — Keuanganku</h1>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Nama lengkap Anda"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <div className="relative">
              <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                value={form.username}
                readOnly
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Username tidak dapat diubah setelah registrasi.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kota Domisili</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Contoh: Sukabumi"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Digunakan pada tanda tangan laporan PDF.</p>
          </div>
          <Button type="submit" fullWidth className="gap-2 justify-center" disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Menyimpan...
              </span>
            ) : saved ? '✅ Tersimpan!' : <><Save size={16} /> Simpan Perubahan</>}
          </Button>
        </form>
      </div>

      {/* Category Management */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Tag size={20} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Kelola Kategori</h2>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAddCat} className="card mb-4">
          <p className="text-sm font-medium text-slate-700 mb-3">Tambah Kategori Baru</p>
          <div className="flex gap-2">
            <div className="flex gap-1 shrink-0">
              {(['expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNewCat({ ...newCat, type: t })}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    newCat.type === t
                      ? t === 'expense' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                </button>
              ))}
            </div>
            <input
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              placeholder="Nama kategori..."
              required
            />
            <Button type="submit" size="sm" className="gap-1 shrink-0" disabled={addingCat}>
              <Plus size={16} /> Tambah
            </Button>
          </div>
        </form>

        {/* Category Lists */}
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: '💰 Pemasukan', list: incomeCategories, color: 'text-green-600' },
            { label: '💸 Pengeluaran', list: expenseCategories, color: 'text-red-600' },
          ].map(({ label, list, color }) => (
            <div key={label} className="card">
              <p className={`text-sm font-semibold mb-3 ${color}`}>{label}</p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {list.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Belum ada kategori</p>
                ) : (
                  list.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 group">
                      <span className="text-sm text-slate-700">{cat.name}</span>
                      <button
                        onClick={() => removeCategory(cat.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all"
                        title="Hapus kategori"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
