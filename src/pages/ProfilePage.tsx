import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../hooks/useAuth';
import { Button, Input } from '../components/ui';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User, MapPin, AtSign, Save, Plus, Trash2, Tag, CheckCircle2, MessageCircle, LogOut, Mail, X, Lock } from 'lucide-react';
import { AVATARS, getAvatarById } from '../lib/avatars';

// ── CONTACT CONFIG — update these when contact info changes ──
const SUPPORT_WA  = '6285872194248';   // nomor WA admin (tanpa +)
const SUPPORT_EMAIL = 'andraani30@gmail.com'; // email support
// ────────────────────────────────────────────────────────────

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
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.next.length < 6) { setPwError('Password baru minimal 6 karakter'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('Konfirmasi password tidak cocok'); return; }
    setPwLoading(true);
    try {
      const u = auth.currentUser!;
      const cred = EmailAuthProvider.credential(u.email!, pwForm.current);
      await reauthenticateWithCredential(u, cred);
      await updatePassword(u, pwForm.next);
      setPwSaved(true);
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err: any) {
      setPwError(err.code === 'auth/wrong-password' ? 'Password saat ini salah' : err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (!confirm(`Hapus kategori "${name}"?\n\nData yang sudah dihapus tidak bisa dipulihkan dan akan dihapus permanen dari database.`)) return;
    removeCategory(id);
  };

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

  const handleContactWA = () => {
    const name = form.displayName || user?.email || 'Pengguna';
    const msg =
`Halo Tim Keuanganku 👋

Saya ingin menyampaikan pertanyaan/kendala berikut:

• Nama       : ${name}
• Sumber info: (Contoh: GitHub / LinkedIn / Teman / Google)
• Kendala    : [Jelaskan masalah atau pertanyaan Anda di sini]

Terima kasih atas bantuannya!
— Dikirim dari setoran.massbim.my.id`;
    window.open(`https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(msg)}`, '_blank');
    setShowContactMenu(false);
  };

  const handleContactEmail = () => {
    const name = form.displayName || user?.email || 'Pengguna';
    const subject = encodeURIComponent('Bantuan - Keuanganku App');
    const body = encodeURIComponent(
`Halo Tim Keuanganku,

Nama       : ${name}
Sumber info: (Contoh: GitHub / LinkedIn / Teman / Google)
Kendala    : [Jelaskan masalah atau pertanyaan Anda di sini]

Terima kasih,
${name}`
    );
    window.open(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`, '_blank');
    setShowContactMenu(false);
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
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-up mobile-pb md:pb-0">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--red-light)' }}
                      title={`Hapus ${cat.name}`}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Lock size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Ganti Password</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Perbarui kata sandi akun Anda</p>
          </div>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <Input label="Password Saat Ini" type="password" placeholder="••••••••"
            value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} required />
          <Input label="Password Baru" type="password" placeholder="Minimal 6 karakter"
            value={pwForm.next} onChange={e => setPwForm({ ...pwForm, next: e.target.value })} required />
          <Input label="Konfirmasi Password Baru" type="password" placeholder="Ulangi password baru"
            value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} required />
          {pwError && <p className="text-xs text-red-400">{pwError}</p>}
          <Button type="submit" fullWidth loading={pwLoading}>
            {pwSaved ? <><CheckCircle2 size={15} /> Password Diperbarui!</> : <><Lock size={15} /> Simpan Password Baru</>}
          </Button>
        </form>
      </div>

      {/* Support & Logout */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <MessageCircle size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Bantuan & Dukungan</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ada pertanyaan atau kendala? Tim kami siap membantu</p>
          </div>
        </div>

        {/* Contact channel picker */}
        {showContactMenu ? (
          <div className="rounded-xl border p-4 space-y-2 animate-fade-up" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Pilih Saluran Bantuan</p>
              <button onClick={() => setShowContactMenu(false)} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            </div>
            <button onClick={handleContactWA}
              className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left"
              style={{ background: 'rgba(5,150,105,0.06)', borderColor: 'rgba(5,150,105,0.2)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(5,150,105,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(5,150,105,0.06)')}>
              <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
                <MessageCircle size={16} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>WhatsApp</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Respons cepat, hari kerja 08.00–17.00</p>
              </div>
            </button>
            <button onClick={handleContactEmail}
              className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left"
              style={{ background: 'rgba(109,40,217,0.06)', borderColor: 'rgba(109,40,217,0.15)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(109,40,217,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(109,40,217,0.06)')}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(109,40,217,0.1)' }}>
                <Mail size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Email</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Untuk laporan detail atau lampiran dokumen</p>
              </div>
            </button>
          </div>
        ) : (
          <Button variant="success" fullWidth onClick={() => setShowContactMenu(true)}>
            <MessageCircle size={15} /> Hubungi Kami
          </Button>
        )}

        <hr className="my-4" style={{ borderColor: 'var(--border)' }} />

        <Button variant="danger" fullWidth onClick={handleLogout}>
          <LogOut size={15} /> Keluar dari Akun
        </Button>
      </div>
    </div>
  );
};
