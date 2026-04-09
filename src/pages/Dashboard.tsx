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
import { getDateRange } from '../utils/helpers';
import {
  Plus, LogOut, Menu, X, BarChart3, LayoutDashboard,
  Share2, UserCircle, ChevronRight, Wallet
} from 'lucide-react';

type ActivePage = 'dashboard' | 'analytics' | 'profile';

const NAV_ITEMS = [
  { id: 'dashboard' as ActivePage, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics' as ActivePage, label: 'Analisis', icon: BarChart3 },
];

export const Dashboard = () => {
  const { logout, user } = useAuth();
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
  const handleLogout = async () => { try { await logout(); } catch (e) { console.error(e); } };
  const navigate = (page: ActivePage) => { setActivePage(page); setSidebarOpen(false); };

  const dateLabel = { today: 'Hari Ini', week: 'Minggu Ini', month: 'Bulan Ini', year: 'Tahun Ini', custom: 'Custom' }[selectedRange];
  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">💰</div>
        <span className="sidebar-logo-text">Keuanganku</span>
      </div>

      {/* Main nav */}
      <span className="sidebar-section">Menu</span>
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => navigate(id)} className={`nav-item ${activePage === id ? 'active' : ''}`}>
          <Icon size={16} />
          {label}
        </button>
      ))}

      <hr className="sidebar-divider" />
      <span className="sidebar-section">Aksi</span>
      <button onClick={() => { setIsExportOpen(true); setSidebarOpen(false); }} className="nav-item">
        <Share2 size={16} /> Bagikan / Export
      </button>

      {/* Footer */}
      <div className="sidebar-footer space-y-1">
        <button onClick={() => navigate('profile')} className={`nav-item ${activePage === 'profile' ? 'active' : ''}`}>
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {initials}
          </div>
          <span className="flex-1 truncate text-sm">{displayName}</span>
          <ChevronRight size={13} className="text-slate-600" />
        </button>
        <button onClick={handleLogout} className="nav-item !text-red-400 hover:!bg-red-500/8 hover:!text-red-300">
          <LogOut size={16} /> Keluar
        </button>
      </div>
    </>
  );

  return (
    <div className="app-layout">
      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)} />
          <aside className="sidebar flex flex-col md:hidden animate-fade-up" style={{ transform: 'none' }}>
            <button onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/8 text-slate-400">
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* ── Main Content ── */}
      <div className="main-content md:ml-[240px] ml-0 flex flex-col min-h-dvh">
        {/* Mobile topbar */}
        <header className="topbar md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-white/6 text-slate-400 transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="sidebar-logo-icon w-8 h-8 rounded-xl text-base">💰</div>
            <span className="font-bold text-sm text-gradient-brand">Keuanganku</span>
          </div>
          <button onClick={() => { setIsFormOpen(true); }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-950/50">
            <Plus size={18} className="text-white" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-5xl w-full mx-auto mobile-pb md:pb-8">
          {activePage === 'profile' ? (
            <ProfilePage />
          ) : activePage === 'analytics' ? (
            <Analytics transactions={filteredTransactions} />
          ) : (
            <div className="space-y-5 animate-fade-up">
              {/* Page header */}
              <div className="page-header flex items-start justify-between">
                <div>
                  <h1 className="page-title">Dashboard</h1>
                  <p className="page-subtitle">Selamat datang, <span className="text-violet-400 font-medium">{displayName.split(' ')[0]}</span> 👋</p>
                </div>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white
                    bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                    shadow-lg shadow-violet-950/50 transition-all duration-200 border border-violet-500/30"
                >
                  <Plus size={16} /> Tambah Transaksi
                </button>
              </div>

              <Summary transactions={filteredTransactions} dateLabel={dateLabel} />
              <QuickStats transactions={filteredTransactions} />

              {/* Filter */}
              <div className="card">
                <DateRangeFilter selectedRange={selectedRange} onRangeChange={handleDateRangeChange} />
              </div>

              {/* Mobile add button */}
              <button
                onClick={() => setIsFormOpen(true)}
                className="md:hidden w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-white text-sm
                  bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                  shadow-lg shadow-violet-950/50 transition-all duration-200 border border-violet-500/30"
              >
                <Plus size={16} /> Tambah Transaksi
              </button>

              {error && (
                <div className="bg-red-500/8 border border-red-500/22 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Transaction list */}
              <div className="card">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/12 border border-violet-500/20 flex items-center justify-center">
                      <Wallet size={14} className="text-violet-400" />
                    </div>
                    <h2 className="font-bold text-slate-200">Daftar Transaksi</h2>
                  </div>
                  <span className="text-xs text-slate-500 bg-white/4 px-2.5 py-1 rounded-full border border-white/06">
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

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav md:hidden">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => navigate(id)} className={`bottom-nav-item ${activePage === id ? 'active' : ''}`}>
            <Icon size={20} />
            {label}
          </button>
        ))}
        <button onClick={() => setIsExportOpen(true)} className={`bottom-nav-item`}>
          <Share2 size={20} />
          Bagikan
        </button>
        <button onClick={() => navigate('profile')} className={`bottom-nav-item ${activePage === 'profile' ? 'active' : ''}`}>
          <UserCircle size={20} />
          Profil
        </button>
      </nav>

      {/* Modals */}
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
