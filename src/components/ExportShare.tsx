import { useState } from 'react';
import type { Transaction, DateRange } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Button, Dialog } from './ui';
import { Download, Copy, Check, MessageCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

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

  const handleCopyShare = () => {
    const message = `📊 Laporan Keuangan - ${getDateRangeLabel()}

💰 Pemasukan: ${formatCurrency(income)}
💸 Pengeluaran: ${formatCurrency(expense)}
💼 Saldo: ${formatCurrency(balance)}

Total Transaksi: ${transactions.length}

Dibuat dengan Aplikasi Keuangan Pribadi`;

    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const exportToPDF = () => {
    const doc = new jsPDF();
    const dateLabel = getDateRangeLabel();
    const today = formatDate(new Date(), 'long');

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Laporan Keuangan', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode  : ${dateLabel}`, 14, 30);
    doc.text(`Dicetak  : ${today}`, 14, 36);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Ringkasan', 14, 48);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total Pemasukan   : ${formatCurrency(income)}`, 14, 56);
    doc.text(`Total Pengeluaran : ${formatCurrency(expense)}`, 14, 62);
    doc.text(`Saldo Akhir       : ${formatCurrency(balance)}`, 14, 68);

    const tableData = transactions.map((t) => [
      formatDate(t.date, 'short'),
      t.description || '-',
      t.category,
      (t.type === 'income' ? '+' : '-') + formatCurrency(t.amount),
    ]);

    (doc as any).autoTable({
      head: [['Tanggal', 'Deskripsi', 'Kategori', 'Jumlah']],
      body: tableData,
      startY: 76,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 3: { halign: 'right' } },
    });

    doc.save(`laporan-keuangan-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`);
    onOpenChange(false);
  };

  const exportToExcel = () => {
    const summaryData = [
      ['LAPORAN KEUANGAN PRIBADI'],
      ['Periode', getDateRangeLabel()],
      ['Tanggal Laporan', formatDate(new Date(), 'long')],
      [],
      ['RINGKASAN'],
      ['Pemasukan', income],
      ['Pengeluaran', expense],
      ['Saldo', balance],
      [],
      ['DETAIL TRANSAKSI'],
      ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah'],
    ];
    
    const transactionData = transactions.map((t) => [
      formatDate(t.date, 'short'),
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.category,
      t.description || '-',
      t.amount
    ]);
    
    const allData = [...summaryData, ...transactionData];
    
    const ws = XLSX.utils.aoa_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Keuangan');
    
    XLSX.writeFile(wb, `laporan-keuangan-${dateRange}-${new Date().toISOString().split('T')[0]}.xlsx`);
    onOpenChange(false);
  };

  const shareToWhatsApp = () => {
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    const message =
`Halo, berikut ringkasan Keuanganku dari Setoranku:
📅 Periode: ${today}
💰 Total Pemasukan: ${formatCurrency(income)}
💸 Total Pengeluaran: ${formatCurrency(expense)}
🏦 Saldo Akhir: ${formatCurrency(balance)}
Kelola keuanganmu di: setoran.massbim.my.id`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
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
          <div className="flex gap-2">
            <Button
              onClick={shareToWhatsApp}
              variant="success"
              className="flex-1 gap-2"
            >
              <MessageCircle size={16} /> WhatsApp
            </Button>
            <Button
              onClick={handleCopyShare}
              variant={copied ? 'success' : 'secondary'}
              className="flex-1 gap-2"
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
        </div>

        {/* Export Section */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="font-semibold text-slate-900">Export Laporan</h3>
          <div className="space-y-2">
            <Button
              fullWidth
              variant="secondary"
              onClick={exportToPDF}
              className="justify-center gap-2"
            >
              <Download size={16} /> Export ke PDF
            </Button>
            <Button
              fullWidth
              variant="secondary"
              onClick={exportToExcel}
              className="justify-center gap-2"
            >
              <Download size={16} /> Export ke Excel
            </Button>
          </div>
        </div>

        {/* Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            💡 Bagikan ringkasan keuangan Anda melalui WhatsApp atau export laporan ke PDF/Excel untuk keperluan administrasi.
          </p>
        </div>
      </div>
    </Dialog>
  );
};
