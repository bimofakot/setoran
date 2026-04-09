import { useState, useEffect } from 'react';
import type { DateRange, Transaction } from '../types';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import { Summary, QuickStats } from '../components/Summary';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { ExportShare } from '../components/ExportShare';
import { Analytics } from '../components/Analytics';
import { ProfilePage } from './ProfilePage';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useTheme } from '../lib/ThemeContext';
import { getDateRange } from '../utils/helpers';
import { getAvatarById } from '../lib/avatars';

// ── CONTACT CONFIG — update these when contact info changes ──
const SUPPORT_WA    = '6285872194248';
const SUPPORT_EMAIL = 'andraani30@gmail.com';
// ────────────────────────────────────────────────────────────
import {
  Plus, Menu, X, BarChart3, LayoutDashboard,
  Share2, UserCircle, ChevronRight, Wallet,
  Sun, Moon, Monitor, LogOut, MessageCircle, Mail, HelpCircle,
} from 'lucide-react';

const HELP_STEPS = [
  { icon: '➕', title: 'Catat Transaksi', desc: 'Klik tombol "+ Tambah Transaksi" untuk mencatat pemasukan atau pengeluaran.' },
  { icon: '🗂️', title: 'Pilih Kategori', desc: 'Pilih kategori yang sesuai. Pilih "Lainnya" untuk kategori bebas.' },
  { icon: '📊', title: 'Lihat Analisis', desc: 'Buka tab Analisis untuk melihat tren 7 hari dan perbandingan bulanan.' },
  { icon: '📄', title: 'Export Laporan', desc: 'Klik "Bagikan / Export" untuk unduh PDF atau Excel, atau kirim via WhatsApp.' },
  { icon: '🎨', title: 'Ganti Tema', desc: 'Gunakan toggle Tampilan di sidebar untuk beralih antara mode Gelap, Terang, atau Sistem.' },
];

type ActivePage = 'dashboard' | 'analytics' | 'profile';

const NAV_ITEMS = [
  { id: 'dashboard' as ActivePage, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics' as ActivePage, label: 'Analisis', icon: BarChart3 },
];

const ThemeToggle = ({ compact = false }: { compact?: boolean }) => {
  const { theme, setTheme } = useTheme();
  const options = [
    { value: 'dark' as const, icon: <Moon size={13} />, label: 'Gelap' },
    { value: 'light' as const, icon: <Sun size={13} />, label: 'Terang' },
    { value: 'system' as const, icon: <Monitor size={13} />, label: 'Sistem' },
  ];
  if (compact) {
    const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    const current = options.find(o => o.value === theme)!;
    return (
      <button onClick={() => setTheme(next)} className="theme-btn" title={`Mode: ${current.label}`}>
        {current.icon}
      </button>
    );
  }
  return (
    <div className="flex gap-1 p-1 rounded-xl border" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
      {options.map(({ value, icon, label }) => (
        <button key={value} onClick={() => setTheme(value)}
          className={`theme-btn flex-1 gap-1 text-xs ${theme === value ? 'active' : ''}`}
          title={label}>
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};

const AvatarIcon = ({ avatarId, initials }: { avatarId: string; initials: string }) => {
  if (avatarId && avatarId !== 'slate-minimal') {
    const av = getAvatarById(avatarId);
    return <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0" dangerouslySetInnerHTML={{ __html: av.svg }} />;
  }
  return (
    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
      {initials}
    </div>
  );
};

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const { transactions, loading, error, fetchTransactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [selectedRange, setSelectedRange] = useState<DateRange>('today');
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => { fetchTransactions(); }, []);

  useEffect(() => {
    if (selectedRange === 'custom' && customRange) {
      setFilteredTransactions(transactions.filter((t) => {
        const td = new Date(t.date);
        return td >= customRange.start && td <= customRange.end;
      }));
    } else {
      const { startDate, endDate } = getDateRange(selectedRange);
      setFilteredTransactions(transactions.filter((t) => {
        const td = new Date(t.date);
        return td >= startDate && td <= endDate;
      }));
    }
  }, [selectedRange, transactions, customRange]);

  const handleDateRangeChange = (range: DateRange, startDate?: Date, endDate?: Date) => {
    setSelectedRange(range);
    if (range === 'custom' && startDate && endDate) setCustomRange({ start: startDate, end: endDate });
    else setCustomRange(null);
  };

  const handleAddTransaction = async (data: any) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
      setEditingTransaction(undefined);
    } else {
      await addTransaction(data);
    }
  };

  const handleEdit = (t: Transaction) => { setEditingTransaction(t); setIsFormOpen(true); };
  const navigate = (page: ActivePage) => { setActivePage(page); setSidebarOpen(false); };
  const handleLogout = async () => { try { await logout(); } catch (e) { console.error(e); } };

  const handleContactWA = () => {
    const name = profile?.displayName || user?.email || 'Pengguna';
    const msg =
`Halo Tim Keuanganku 👋

Saya ingin menyampaikan pertanyaan/kendala berikut:

• Nama       : ${name}
• Sumber info: (Contoh: GitHub / LinkedIn / Teman / Google)
• Kendala    : [Jelaskan masalah atau pertanyaan Anda di sini]

Terima kasih atas bantuannya!
— Dikirim dari setoran.massbim.my.id`;
    window.open(`https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(msg)}`, '_blank');
    setShowContactMenu(false); setSidebarOpen(false);
  };

  const handleContactEmail = () => {
    const name = profile?.displayName || user?.email || 'Pengguna';
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
    setShowContactMenu(false); setSidebarOpen(false);
  };

  const dateLabel = { today: 'Hari Ini', week: 'Minggu Ini', month: 'Bulan Ini', year: 'Tahun Ini', custom: 'Custom' }[selectedRange];
  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const SidebarContent = () => (
    <>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">💰</div>
        <span className="sidebar-logo-text">Keuanganku</span>
      </div>

      <span className="sidebar-section">Menu</span>
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => navigate(id)} className={`nav-item ${activePage === id ? 'active' : ''}`}>
          <Icon size={16} />{label}
        </button>
      ))}

      <hr className="sidebar-divider" />
      <span className="sidebar-section">Aksi</span>
      <button onClick={() => { setIsExportOpen(true); setSidebarOpen(false); }} className="nav-item">
        <Share2 size={16} /> Bagikan / Export
      </button>

      {/* Hubungi Kami inline */}
      <button onClick={() => setShowContactMenu(v => !v)} className="nav-item">
        <MessageCircle size={16} /> Hubungi Kami
      </button>
      {showContactMenu && (
        <div className="mx-1 mb-1 rounded-xl border overflow-hidden animate-fade-up" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
          <button onClick={handleContactWA}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <MessageCircle size={14} className="text-green-500 shrink-0" />
            <div>
              <p className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>WhatsApp</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Respons cepat</p>
            </div>
          </button>
          <button onClick={handleContactEmail}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left border-t"
            style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <Mail size={14} style={{ color: 'var(--accent-light)', flexShrink: 0 }} />
            <div>
              <p className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>Email</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Untuk lampiran dokumen</p>
            </div>
          </button>
        </div>
      )}

      {/* Bantuan */}
      <button onClick={() => setShowHelp(v => !v)} className="nav-item">
        <HelpCircle size={16} /> Bantuan
      </button>
      {showHelp && (
        <div className="mx-1 mb-1 rounded-xl border p-3 space-y-2.5 animate-fade-up" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
          {HELP_STEPS.map((s) => (
            <div key={s.title} className="flex gap-2.5">
              <span className="text-base shrink-0 mt-0.5">{s.icon}</span>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="sidebar-divider" />
      <span className="sidebar-section">Tampilan</span>
      <div className="px-0.5">
        <ThemeToggle />
      </div>

      <div className="sidebar-footer space-y-1">
        <button onClick={() => navigate('profile')} className={`nav-item ${activePage === 'profile' ? 'active' : ''}`}>
          <AvatarIcon avatarId={profile?.avatarId} initials={initials} />
          <span className="flex-1 truncate text-sm">{displayName}</span>
          <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
        </button>
        <button onClick={handleLogout} className="nav-item" style={{ color: 'var(--red-light)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
          <LogOut size={16} /> Keluar
        </button>
      </div>
    </>
  );

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside className="sidebar hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)} />
          <aside className="sidebar flex flex-col md:hidden" style={{ transform: 'none' }}>
            <button onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--bg-subtle-hover)]"
              style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="main-content md:ml-[240px] ml-0 flex flex-col min-h-dvh">
        {/* Mobile topbar */}
        <header className="topbar md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="sidebar-logo-icon w-8 h-8 rounded-xl text-base">💰</div>
            <span className="font-bold text-sm text-gradient-brand">Keuanganku</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <button onClick={() => setIsFormOpen(true)}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Plus size={18} className="text-white" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-5xl w-full mx-auto mobile-pb">
          {activePage === 'profile' ? (
            <ProfilePage />
          ) : activePage === 'analytics' ? (
            <Analytics transactions={filteredTransactions} />
          ) : (
            <div className="space-y-5 animate-fade-up">
              <div className="page-header flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <AvatarIcon avatarId={profile?.avatarId} initials={initials} />
                  <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Selamat datang, <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>{displayName.split(' ')[0]}</span> 👋</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white
                    bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                    shadow-lg transition-all duration-200 border border-violet-500/30"
                >
                  <Plus size={16} /> Tambah Transaksi
                </button>
              </div>

              <Summary transactions={filteredTransactions} dateLabel={dateLabel} />
              <QuickStats transactions={filteredTransactions} />

              <div className="card">
                <DateRangeFilter selectedRange={selectedRange} onRangeChange={handleDateRangeChange} />
              </div>

              <button
                onClick={() => setIsFormOpen(true)}
                className="md:hidden w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-white text-sm
                  bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                  shadow-lg transition-all duration-200 border border-violet-500/30"
              >
                <Plus size={16} /> Tambah Transaksi
              </button>

              {error && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--red-light)' }}>
                  {error}
                </div>
              )}

              <div className="card">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.18)' }}>
                      <Wallet size={14} style={{ color: 'var(--accent-light)' }} />
                    </div>
                    <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Daftar Transaksi</h2>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full border" style={{ color: 'var(--text-muted)', background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
                    {filteredTransactions.length} transaksi
                  </span>
                </div>
                {loading && !transactions.length ? (
                  <div className="space-y-3 py-2">
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
                  </div>
                ) : (
                  <TransactionList transactions={filteredTransactions} onEdit={handleEdit} onDelete={deleteTransaction} loading={loading} />
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav md:hidden">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => navigate(id)} className={`bottom-nav-item ${activePage === id ? 'active' : ''}`}>
            <Icon size={20} />{label}
          </button>
        ))}
        <button onClick={() => setIsExportOpen(true)} className="bottom-nav-item">
          <Share2 size={20} />Bagikan
        </button>
        <button onClick={() => navigate('profile')} className={`bottom-nav-item ${activePage === 'profile' ? 'active' : ''}`}>
          <UserCircle size={20} />Profil
        </button>
      </nav>

      <TransactionForm
        open={isFormOpen}
        onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingTransaction(undefined); }}
        onSubmit={handleAddTransaction}
        initialData={editingTransaction}
        loading={loading}
      />
      <ExportShare
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        transactions={filteredTransactions}
        dateRange={selectedRange}
        userCity={profile.city || 'Sukabumi'}
      />
    </div>
  );
};
