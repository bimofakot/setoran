import { useState, useEffect, useRef } from 'react';
import type { DateRange, Transaction } from '../types';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import { Summary, QuickStats } from '../components/Summary';
import { PeriodNavigator } from '../components/PeriodNavigator';
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

const APP_VERSION = '1.2.0';

const CHANGELOG = [
  { version: 'v1.2.0', date: '10 Apr 2026', items: ['Smart Period Navigator di Analisis', 'Real-time sync (onSnapshot)', 'Smart Comparison dinamis', 'Responsive breakpoints & pill scroll', 'Auto-hide bottom nav', 'Date persistence fix (WIB)'] },
  { version: 'v1.1.0', date: '09 Apr 2026', items: ['Tiga tema (Gelap/Terang/Sistem)', '6 avatar kustom', 'Export PDF & Excel', 'Ganti password', 'Menu Bantuan & Hubungi Kami'] },
  { version: 'v1.0.0', date: '30 Mar 2026', items: ['Rilis perdana', 'Catat transaksi harian', 'Dashboard & Analitik', 'PWA installable'] },
];

import {
  Plus, Menu, X, BarChart3, LayoutDashboard,
  Share2, UserCircle, ChevronRight, Wallet,
  Sun, Moon, Monitor, LogOut, MessageCircle, Mail, HelpCircle, Sparkles,
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
  const { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction } = useTransactions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [selectedRange, setSelectedRange] = useState<DateRange>('today');
  const [periodOffset, setPeriodOffset] = useState(0);
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showCustomDash, setShowCustomDash] = useState(false);
  const [customDashStart, setCustomDashStart] = useState('');
  const [customDashEnd, setCustomDashEnd] = useState('');
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setNavHidden(y > lastScrollY.current && y > 80);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (selectedRange === 'custom' && customRange) {
      setFilteredTransactions(transactions.filter((t) => {
        const td = new Date(t.date);
        return td >= customRange.start && td <= customRange.end;
      }));
    } else {
      const { startDate, endDate } = getDateRange(selectedRange, periodOffset);
      setFilteredTransactions(transactions.filter((t) => {
        const td = new Date(t.date);
        return td >= startDate && td <= endDate;
      }));
    }
  }, [selectedRange, periodOffset, transactions, customRange]);

  const handleDateRangeChange = (range: DateRange, startDate?: Date, endDate?: Date) => {
    setSelectedRange(range);
    setPeriodOffset(0);
    if (range === 'custom' && startDate && endDate) setCustomRange({ start: startDate, end: endDate });
    else setCustomRange(null);
  };

  const handleApplyCustomDash = () => {
    if (!customDashStart || !customDashEnd) return;
    const start = new Date(customDashStart);
    const end = new Date(customDashEnd + 'T23:59:59');
    setSelectedRange('custom');
    setCustomRange({ start, end });
    setShowCustomDash(false);
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
    const msg = `Halo Tim Keuanganku 👋\n\nNama: ${name}\nSumber info: \nKendala: \n\n— setoran.massbim.my.id`;
    window.open(`https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(msg)}`, '_blank');
    setShowContactMenu(false); setSidebarOpen(false);
  };

  const handleContactEmail = () => {
    const name = profile?.displayName || user?.email || 'Pengguna';
    const subject = encodeURIComponent('Bantuan - Keuanganku App');
    const body = encodeURIComponent(`Nama: ${name}\nSumber info: \nKendala: \n\n— setoran.massbim.my.id`);
    window.open(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`, '_blank');
    setShowContactMenu(false); setSidebarOpen(false);
  };

  const dateLabel: Record<DateRange, string> = {
    today: 'Hari Ini', week: 'Mingguan', month: 'Bulanan', year: 'Tahunan', custom: 'Custom',
  };
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

      {/* Update Terbaru */}
      <button onClick={() => { setShowChangelog(v => !v); setShowContactMenu(false); setShowHelp(false); }}
        className={`nav-item ${showChangelog ? 'active' : ''}`}>
        <Sparkles size={16} /> Update Terbaru
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold"
          style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--accent-light)' }}>
          {APP_VERSION}
        </span>
      </button>

      {/* Hubungi Kami */}
      <button onClick={() => { setShowContactMenu(v => !v); setShowHelp(false); }} className={`nav-item ${showContactMenu ? 'active' : ''}`}>
        <MessageCircle size={16} /> Hubungi Kami
      </button>

      {/* Bantuan */}
      <button onClick={() => { setShowHelp(v => !v); setShowContactMenu(false); }} className={`nav-item ${showHelp ? 'active' : ''}`}>
        <HelpCircle size={16} /> Bantuan
      </button>

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
          <aside className="sidebar fixed top-0 left-0 h-full flex flex-col md:hidden z-50" style={{ transform: 'none' }}>
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
        <main className="flex-1 px-3 sm:px-5 lg:px-8 py-5 sm:py-7 max-w-5xl w-full mx-auto mobile-pb">
          {activePage === 'profile' ? (
            <ProfilePage />
          ) : activePage === 'analytics' ? (
            <Analytics
              transactions={transactions}
              mode={selectedRange}
              offset={periodOffset}
              customRange={customRange}
              onModeChange={(m) => handleDateRangeChange(m)}
              onOffsetChange={setPeriodOffset}
              onCustomRange={(start, end) => { setSelectedRange('custom'); setCustomRange({ start, end }); }}
            />
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

              <Summary transactions={filteredTransactions} dateLabel={dateLabel[selectedRange]} />
              <QuickStats transactions={filteredTransactions} />

              <div className="card">
                <PeriodNavigator
                  mode={selectedRange === 'custom' ? 'month' : selectedRange}
                  offset={periodOffset}
                  onModeChange={(m) => { handleDateRangeChange(m); setShowCustomDash(m === 'custom'); }}
                  onOffsetChange={setPeriodOffset}
                  showCustom
                  onShowCustom={() => setShowCustomDash(true)}
                  isCustomActive={selectedRange === 'custom'}
                />
                {showCustomDash && (
                  <div className="mt-3 flex flex-wrap gap-2 items-end animate-fade-up">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Dari</label>
                      <input type="date" className="input-dark text-sm" value={customDashStart}
                        onChange={e => setCustomDashStart(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Sampai</label>
                      <input type="date" className="input-dark text-sm" value={customDashEnd}
                        onChange={e => setCustomDashEnd(e.target.value)} />
                    </div>
                    <button onClick={handleApplyCustomDash}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600">
                      Terapkan
                    </button>
                    <button onClick={() => { setShowCustomDash(false); handleDateRangeChange('today'); }}
                      className="px-3 py-2 rounded-xl text-sm" style={{ color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}>
                      Batal
                    </button>
                  </div>
                )}
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

      {/* Mobile Bottom Nav — auto-hide on scroll down */}
      <nav className={`bottom-nav md:hidden ${navHidden ? 'hidden-nav' : ''}`}>
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

      {/* Floating: Hubungi Kami */}
      {showContactMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowContactMenu(false)} />
          <div className="floating-window">
            <div className="floating-window-header">
              <div className="flex items-center gap-2">
                <MessageCircle size={15} style={{ color: 'var(--accent-light)' }} />
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Hubungi Kami</span>
              </div>
              <button onClick={() => setShowContactMenu(false)} className="p-1 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <X size={15} />
              </button>
            </div>
            <div className="floating-window-body space-y-2">
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Pilih saluran bantuan yang paling nyaman untuk Anda.</p>
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
                style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(109,40,217,0.1)' }}>
                  <Mail size={16} style={{ color: 'var(--accent-light)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Email</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Untuk pertanyaan detail atau lampiran</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Floating: Bantuan */}
      {showHelp && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowHelp(false)} />
          <div className="floating-window">
            <div className="floating-window-header">
              <div className="flex items-center gap-2">
                <HelpCircle size={15} style={{ color: 'var(--accent-light)' }} />
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Panduan Penggunaan</span>
              </div>
              <button onClick={() => setShowHelp(false)} className="p-1 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <X size={15} />
              </button>
            </div>
            <div className="floating-window-body space-y-3">
              {HELP_STEPS.map((s, i) => (
                <div key={s.title} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{ background: 'var(--bg-subtle)', color: 'var(--accent-light)', border: '1px solid var(--border)' }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                    <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Floating: Update Terbaru / Changelog */}
      {showChangelog && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowChangelog(false)} />
          <div className="floating-window">
            <div className="floating-window-header">
              <div className="flex items-center gap-2">
                <Sparkles size={15} style={{ color: 'var(--accent-light)' }} />
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Update Terbaru</span>
              </div>
              <button onClick={() => setShowChangelog(false)} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X size={15} />
              </button>
            </div>
            <div className="floating-window-body space-y-4">
              {CHANGELOG.map((entry) => (
                <div key={entry.version}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--accent-light)' }}>
                      {entry.version}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.date}</span>
                  </div>
                  <ul className="space-y-1">
                    {entry.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--accent-light)', marginTop: 1 }}>•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
