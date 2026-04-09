import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui';
import { User, MapPin, AtSign, Save, Plus, Trash2, Tag, CheckCircle2, MessageCircle, LogOut } from 'lucide-react';
import { AVATARS, getAvatarById } from '../lib/avatars';

const AvatarDisplay = ({ avatarId, size = 48 }: { avatarId: string; size?: number }) => {
  const avatar = getAvatarById(avatarId);
  return (
    <div
      style={{ width: size, height: size, flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: avatar.svg }}
    />
  );
};

export const ProfilePage = () => {
  const { profile, loading, saving, saveProfile } = useProfile();
  const { categories, addCategory, removeCategory } = useCategories();
  const { logout, user } = useAuth();
  const [form, setForm] = useState({ displayName: '', username: '', city: '', avatarId: 'slate-minimal' });
  const [saved, setSaved] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', type: 'expense' as 'income' | 'expense' });
  const [addingCat, setAddingCat] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

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

  const handleContact = () => {
    const name = form.displayName || user?.email || 'Pengguna';
    const msg = `Halo Admin Keuanganku! 👋\n\nNama: ${name}\nInfo website dari: setoran.massbim.my.id\nKendala: [jelaskan masalah Anda di sini]\n\nTerima kasih!`;
    window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleLogout = async () => { try { await logout(); } catch (e) { console.error(e); } };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin h-8 w-8 border-2 border-[rgba(124,58,237,0.3)] border-t-[var(--accent)] rounded-full" />
      </div>
    );
  }

  const incomeCategories  = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-up">
      {/* Profile Form */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <User size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold" style={{ color: 'var(--text-primary)' }}>Profil Saya</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Kelola informasi akun Anda</p>
          </div>
        </div>

        {/* Avatar section */}
        <div className="flex items-center gap-4 mb-5 p-4 rounded-xl border" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
          <div className="relative">
            <AvatarDisplay avatarId={form.avatarId} size={56} />
            <button
              type="button"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent)] text-white text-xs flex items-center justify-center shadow-md"
            >✎</button>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{form.displayName || 'Nama Anda'}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{form.username}</p>
            <button type="button" onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="text-xs mt-1" style={{ color: 'var(--accent-light)' }}>
              Ganti Avatar
            </button>
          </div>
        </div>

        {/* Avatar picker */}
        {showAvatarPicker && (
          <div className="mb-5 p-4 rounded-xl border animate-fade-up" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Pilih Avatar</p>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => { setForm({ ...form, avatarId: av.id }); setShowAvatarPicker(false); }}
                  className={`rounded-xl overflow-hidden transition-all border-2 ${
                    form.avatarId === av.id ? 'border-[var(--accent)] scale-105 shadow-lg' : 'border-transparent hover:border-[var(--border-hover)]'
                  }`}
                  title={av.label}
                >
                  <AvatarDisplay avatarId={av.id} size={44} />
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Nama Lengkap</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input className="input-dark pl-9" value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Nama lengkap Anda" required />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Username</label>
            <div className="relative">
              <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input className="input-dark pl-9" value={form.username} readOnly />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Username tidak dapat diubah setelah registrasi.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Kota Domisili</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input className="input-dark pl-9" value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Contoh: Sukabumi" />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Digunakan pada tanda tangan laporan PDF.</p>
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
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Tag size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Kelola Kategori</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tambah atau hapus kategori transaksi</p>
          </div>
        </div>

        <form onSubmit={handleAddCat} className="mb-5 p-4 rounded-xl border" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Tambah Kategori Baru</p>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex gap-1 shrink-0">
              {(['expense', 'income'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setNewCat({ ...newCat, type: t })}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                    newCat.type === t
                      ? t === 'expense'
                        ? 'bg-red-500/15 text-red-400 border-red-500/25'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]'
                  }`}>
                  {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                </button>
              ))}
            </div>
            <input className="input-dark flex-1 min-w-0" value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              placeholder="Nama kategori..." required />
            <Button type="submit" size="sm" className="shrink-0" disabled={addingCat}>
              <Plus size={14} /> Tambah
            </Button>
          </div>
        </form>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: '💰 Pemasukan', list: incomeCategories, accent: 'text-emerald-500' },
            { label: '💸 Pengeluaran', list: expenseCategories, accent: 'text-red-500' },
          ].map(({ label, list, accent }) => (
            <div key={label} className="rounded-xl border p-4" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
              <p className={`text-xs font-bold mb-3 uppercase tracking-wider ${accent}`}>{label}</p>
              <div className="space-y-0.5 max-h-56 overflow-y-auto">
                {list.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>Belum ada kategori</p>
                ) : list.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between py-2 px-2 rounded-lg transition-colors"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                    {/* Always visible on mobile, hover on desktop */}
                    <button onClick={() => removeCategory(cat.id)}
                      className="p-1.5 rounded-lg transition-colors text-red-400 hover:bg-red-500/10 md:opacity-0 md:group-hover:opacity-100"
                      style={{ opacity: undefined }}
                      aria-label={`Hapus ${cat.name}`}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support & Logout */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <MessageCircle size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Bantuan & Dukungan</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ada kendala? Hubungi kami langsung</p>
          </div>
        </div>
        <Button variant="success" fullWidth onClick={handleContact}>
          <MessageCircle size={15} /> Hubungi Kami via WhatsApp
        </Button>

        <hr className="my-4" style={{ borderColor: 'var(--border)' }} />

        <Button variant="danger" fullWidth onClick={handleLogout}>
          <LogOut size={15} /> Keluar dari Akun
        </Button>
      </div>
    </div>
  );
};
