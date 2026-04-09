import { useState, useEffect } from 'react';
import type { DateRange, Transaction } from '../types';
import { Button } from '../components/ui';
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
import { Plus, LogOut, Menu, X, UserCircle, BarChart3 } from 'lucide-react';

export const Dashboard = () => {
  const { logout, user } = useAuth();
  const { profile } = useProfile();
  const {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics'>('dashboard');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [selectedRange, setSelectedRange] = useState<DateRange>('today');
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions based on selected range
  useEffect(() => {
    if (selectedRange === 'custom' && customRange) {
      setFilteredTransactions(
        transactions.filter((t) => {
          const td = new Date(t.date);
          return td >= customRange.start && td <= customRange.end;
        })
      );
    } else {
      const { startDate, endDate } = getDateRange(selectedRange);
      setFilteredTransactions(
        transactions.filter((t) => {
          const td = new Date(t.date);
          return td >= startDate && td <= endDate;
        })
      );
    }
  }, [selectedRange, transactions, customRange]);

  const handleDateRangeChange = (range: DateRange, startDate?: Date, endDate?: Date) => {
    setSelectedRange(range);
    if (range === 'custom' && startDate && endDate) {
      setCustomRange({ start: startDate, end: endDate });
    } else {
      setCustomRange(null);
    }
  };

  const handleAddTransaction = async (data: any) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
      setEditingTransaction(undefined);
    } else {
      await addTransaction(data);
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setIsFormOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getDateRangeLabel = () => {
    const labels: Record<DateRange, string> = {
      today: 'Hari Ini',
      week: 'Minggu Ini',
      month: 'Bulan Ini',
      year: 'Tahun Ini',
      custom: 'Custom',
    };
    return labels[selectedRange];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">💰</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              Keuanganku
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-sm text-slate-600">
              👋 {user?.displayName || user?.email}
            </div>
            <Button
              onClick={() => setShowProfile(!showProfile)}
              variant="secondary"
              size="sm"
              className="gap-2"
            >
              <UserCircle size={16} /> Profil
            </Button>
            <Button
              onClick={() => setIsExportOpen(true)}
              variant="secondary"
              size="sm"
            >
              📊 Bagikan
            </Button>
            <Button
              onClick={handleLogout}
              variant="danger"
              size="sm"
              className="gap-2"
            >
              <LogOut size={16} /> Keluar
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-slate-900" />
            ) : (
              <Menu size={24} className="text-slate-900" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3">
            <div className="text-sm text-slate-600 px-2 py-2">
              👋 {user?.displayName || user?.email}
            </div>
            <Button
              onClick={() => { setShowProfile(!showProfile); setMobileMenuOpen(false); }}
              fullWidth
              variant="secondary"
              size="sm"
              className="gap-2"
            >
              <UserCircle size={16} /> Profil
            </Button>
            <Button
              onClick={() => {
                setIsExportOpen(true);
                setMobileMenuOpen(false);
              }}
              fullWidth
              variant="secondary"
              size="sm"
            >
              📊 Bagikan
            </Button>
            <Button
              onClick={handleLogout}
              fullWidth
              variant="danger"
              size="sm"
              className="gap-2"
            >
              <LogOut size={16} /> Keluar
            </Button>
          </div>
        )}
      </div>

      {/* Tab Bar */}
      {!showProfile && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 flex gap-1">
            {(['dashboard', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'dashboard' ? (
                  <><span>📋</span> Dashboard</>
                ) : (
                  <><BarChart3 size={16} /> Analisis</>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {showProfile ? (
          <ProfilePage />
        ) : activeTab === 'analytics' ? (
          <Analytics transactions={filteredTransactions} />
        ) : (
          <>
        {/* Summary Cards */}
        <Summary transactions={filteredTransactions} dateLabel={getDateRangeLabel()} />

        {/* Quick Stats */}
        <QuickStats transactions={filteredTransactions} />

        {/* Date Range Filter */}
        <div className="card mb-6">
          <DateRangeFilter
            selectedRange={selectedRange}
            onRangeChange={handleDateRangeChange}
          />
        </div>

        {/* Action Button */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={18} /> Tambah Transaksi
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Transaction List */}
        {loading && !transactions.length ? (
          <div className="card text-center py-12">
            <p className="text-slate-600 mb-2">Memuat data...</p>
            <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-blue-500 rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Daftar Transaksi
            </h2>
            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleEdit}
              onDelete={deleteTransaction}
              loading={loading}
            />
          </div>
        )}
        </>
        )}
      </div>

      {/* Modals */}
      <TransactionForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingTransaction(undefined);
        }}
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

      {/* Floating Action Button for Mobile */}
      {!showProfile && (
        <button
          onClick={() => setIsFormOpen(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
};
