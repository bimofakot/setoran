import { useState } from 'react';
import type { Transaction, DateRange } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Button, Dialog } from './ui';
import { Download, Copy, Check } from 'lucide-react';

interface ExportShareProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: Transaction[];
  dateRange: DateRange;
}

export const ExportShare = ({
  open,
  onOpenChange,
  transactions,
  dateRange,
}: ExportShareProps) => {
  const [copied, setCopied] = useState(false);

  const getDateRangeLabel = () => {
    const labels: Record<DateRange, string> = {
      today: 'Hari Ini',
      week: 'Minggu Ini',
      month: 'Bulan Ini',
      year: 'Tahun Ini',
      custom: 'Custom',
    };
    return labels[dateRange];
  };

  const calculateSummary = () => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;

    return { income, expense, balance };
  };

  const { income, expense, balance } = calculateSummary();

  const exportToCSV = () => {
    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'Deskripsi'];
    const rows = transactions.map((t) => [
      formatDate(t.date, 'short'),
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.category,
      t.amount.toString(),
      t.description,
    ]);

    const csv = [
      ['LAPORAN KEUANGAN PRIBADI - ' + getDateRangeLabel()],
      ['Tanggal Laporan: ' + formatDate(new Date(), 'long')],
      [],
      ['RINGKASAN'],
      ['Pemasukan', formatCurrency(income)],
      ['Pengeluaran', formatCurrency(expense)],
      ['Saldo', formatCurrency(balance)],
      [],
      headers,
      ...rows,
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-keuangan-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    onOpenChange(false);
  };

  const exportToJSON = () => {
    const data = {
      laporan: {
        periode: getDateRangeLabel(),
        tanggalLaporan: new Date().toISOString(),
        ringkasan: {
          pemasukan: income,
          pengeluaran: expense,
          saldo: balance,
        },
        transaksiList: transactions.map((t) => ({
          tanggal: formatDate(t.date, 'short'),
          tipe: t.type,
          kategori: t.category,
          jumlah: t.amount,
          deskripsi: t.description,
        })),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-keuangan-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    onOpenChange(false);
  };

  const exportToHTML = () => {
    const groupedByDate = transactions.reduce((acc, t) => {
      const dateKey = formatDate(t.date, 'short');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>);

    const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Laporan Keuangan</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; }
          h1 { color: #1f2937; font-size: 28px; margin-bottom: 10px; }
          .periode { color: #6b7280; font-size: 14px; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 40px 0; }
          .summary-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; }
          .summary-card.income { background: linear-gradient(135deg, #11b981 0%, #059669 100%); }
          .summary-card.expense { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
          .summary-card.balance { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
          .summary-card h3 { font-size: 14px; margin-bottom: 10px; opacity: 0.9; }
          .summary-card .amount { font-size: 28px; font-weight: bold; }
          .transaction-group { margin: 30px 0; }
          .transaction-date { font-weight: bold; color: #3b82f6; font-size: 14px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .income-type { color: #11b981; font-weight: 600; }
          .expense-type { color: #ef4444; font-weight: 600; }
          .amount-cell { text-align: right; font-weight: 600; }
          footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
          @media print { body { background: white; } .container { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>📊 Laporan Keuangan Pribadi</h1>
            <p class="periode">${getDateRangeLabel()}</p>
            <p class="periode">Tanggal: ${formatDate(new Date(), 'long')}</p>
          </header>

          <div class="summary">
            <div class="summary-card income">
              <h3>💰 Pemasukan</h3>
              <div class="amount">${formatCurrency(income)}</div>
            </div>
            <div class="summary-card expense">
              <h3>💸 Pengeluaran</h3>
              <div class="amount">${formatCurrency(expense)}</div>
            </div>
            <div class="summary-card balance">
              <h3>💼 Saldo</h3>
              <div class="amount">${formatCurrency(balance)}</div>
            </div>
          </div>

          <h2 style="margin: 40px 0 20px; color: #1f2937; font-size: 20px;">Detail Transaksi</h2>

          ${Object.entries(groupedByDate)
            .map(
              ([dateKey, dayTransactions]) => `
            <div class="transaction-group">
              <div class="transaction-date">${dateKey}</div>
              <table>
                <thead>
                  <tr>
                    <th>Tipe</th>
                    <th>Kategori</th>
                    <th>Deskripsi</th>
                    <th class="amount-cell">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  ${dayTransactions
                    .map(
                      (t) => `
                    <tr>
                      <td class="${t.type === 'income' ? 'income-type' : 'expense-type'}">
                        ${t.type === 'income' ? '📈 Pemasukan' : '📉 Pengeluaran'}
                      </td>
                      <td>${t.category}</td>
                      <td>${t.description || '-'}</td>
                      <td class="amount-cell ${t.type === 'income' ? 'income-type' : 'expense-type'}">
                        ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
                      </td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          `
            )
            .join('')}

          <footer>
            <p>Laporan ini dibuat secara otomatis oleh Aplikasi Keuangan Pribadi</p>
            <p>© ${new Date().getFullYear()} - Semua Hak Dilindungi</p>
          </footer>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-keuangan-${dateRange}-${new Date().toISOString().split('T')[0]}.html`;
    link.click();

    onOpenChange(false);
  };

  const generateShareText = () => {
    return `📊 Laporan Keuangan - ${getDateRangeLabel()}

💰 Pemasukan: ${formatCurrency(income)}
💸 Pengeluaran: ${formatCurrency(expense)}
💼 Saldo: ${formatCurrency(balance)}

Total Transaksi: ${transactions.length}

Dibuat dengan Aplikasi Keuangan Pribadi`;
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Bagikan & Export Laporan"
      className="max-w-lg"
    >
      <div className="space-y-6">
        {/* Summary Preview */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
          <div>
            <p className="text-xs text-slate-600">Pemasukan</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(income)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Pengeluaran</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(expense)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Saldo</p>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Share Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Bagikan Ringkasan</h3>
          <div className="bg-slate-50 p-4 rounded-lg max-h-32 overflow-auto">
            <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
              {generateShareText()}
            </p>
          </div>
          <Button
            fullWidth
            variant={copied ? 'success' : 'secondary'}
            onClick={handleCopyShare}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check size={16} /> Tersalin!
              </>
            ) : (
              <>
                <Copy size={16} /> Salin Teks
              </>
            )}
          </Button>
        </div>

        {/* Export Section */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="font-semibold text-slate-900">Export Laporan</h3>
          <div className="space-y-2">
            <Button
              fullWidth
              variant="secondary"
              onClick={exportToCSV}
              className="justify-center gap-2"
            >
              <Download size={16} /> Export ke CSV
            </Button>
            <Button
              fullWidth
              variant="secondary"
              onClick={exportToJSON}
              className="justify-center gap-2"
            >
              <Download size={16} /> Export ke JSON
            </Button>
            <Button
              fullWidth
              variant="secondary"
              onClick={exportToHTML}
              className="justify-center gap-2"
            >
              <Download size={16} /> Export ke HTML
            </Button>
          </div>
        </div>

        {/* Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            💡 Anda dapat membagikan laporan melalui WhatsApp, Email, atau media sosial.
          </p>
        </div>
      </div>
    </Dialog>
  );
};
