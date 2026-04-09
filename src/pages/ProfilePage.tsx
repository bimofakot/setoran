import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useCategories } from '../hooks/useCategories';
import { Button } from '../components/ui';
import { User, MapPin, AtSign, Save, Plus, Trash2, Tag, CheckCircle2 } from 'lucide-react';

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
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full" />
      </div>
    );
  }

  const incomeCategories  = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Profile Form */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-950/50">
            <User size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-100">Profil Saya</h1>
            <p className="text-xs text-slate-500">Kelola informasi akun Anda</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="input-dark pl-9"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Nama lengkap Anda"
                required
              />
            </div>
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Username</label>
            <div className="relative">
              <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input-dark pl-9" value={form.username} readOnly />
            </div>
            <p className="text-xs text-slate-600">Username tidak dapat diubah setelah registrasi.</p>
          </div>

          {/* Kota */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Kota Domisili</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="input-dark pl-9"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Contoh: Sukabumi"
              />
            </div>
            <p className="text-xs text-slate-600">Digunakan pada tanda tangan laporan PDF.</p>
          </div>

          <Button type="submit" fullWidth disabled={saving}>
            {saving
              ? <><span className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full" /> Menyimpan...</>
              : saved
              ? <><CheckCircle2 size={15} /> Tersimpan!</>
              : <><Save size={15} /> Simpan Perubahan</>}
          </Button>
        </form>
      </div>

      {/* Category Management */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-950/50">
            <Tag size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100">Kelola Kategori</h2>
            <p className="text-xs text-slate-500">Tambah atau hapus kategori transaksi</p>
          </div>
        </div>

        {/* Add form */}
        <form onSubmit={handleAddCat} className="mb-5 p-4 bg-white/3 rounded-xl border border-white/07">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Tambah Kategori Baru</p>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex gap-1 shrink-0">
              {(['expense', 'income'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setNewCat({ ...newCat, type: t })}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                    newCat.type === t
                      ? t === 'expense'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-transparent text-slate-500 border-white/08 hover:border-white/15'
                  }`}>
                  {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                </button>
              ))}
            </div>
            <input
              className="input-dark flex-1 min-w-0"
              value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              placeholder="Nama kategori..."
              required
            />
            <Button type="submit" size="sm" className="shrink-0" disabled={addingCat}>
              <Plus size={14} /> Tambah
            </Button>
          </div>
        </form>

        {/* Lists */}
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: '💰 Pemasukan', list: incomeCategories, accent: 'text-emerald-400' },
            { label: '💸 Pengeluaran', list: expenseCategories, accent: 'text-red-400' },
          ].map(({ label, list, accent }) => (
            <div key={label} className="bg-white/3 rounded-xl border border-white/07 p-4">
              <p className={`text-xs font-semibold mb-3 uppercase tracking-wider ${accent}`}>{label}</p>
              <div className="space-y-0.5 max-h-56 overflow-y-auto">
                {list.length === 0 ? (
                  <p className="text-xs text-slate-600 text-center py-4">Belum ada kategori</p>
                ) : list.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/5 group transition-colors">
                    <span className="text-sm text-slate-300">{cat.name}</span>
                    <button onClick={() => removeCategory(cat.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all rounded-lg hover:bg-red-500/10">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
