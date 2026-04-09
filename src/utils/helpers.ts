export const formatCurrency = (amount: number, currency: string = 'IDR'): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date | string, format: 'short' | 'long' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

import type { DateRange } from '../types';

// offset: 0 = current, -1 = previous, +1 = next
export const getDateRange = (type: DateRange = 'today', offset = 0) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let startDate: Date, endDate: Date;

  switch (type) {
    case 'today':
      startDate = new Date(today.getTime() + offset * 24 * 60 * 60 * 1000);
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);
      break;
    case 'week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), diff);
      startDate = new Date(thisWeekStart.getTime() + offset * 7 * 24 * 60 * 60 * 1000);
      endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
      break;
    }
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59, 999);
      break;
    case 'year':
      startDate = new Date(now.getFullYear() + offset, 0, 1);
      endDate = new Date(now.getFullYear() + offset, 11, 31, 23, 59, 59, 999);
      break;
    default:
      startDate = today;
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
  }
  return { startDate, endDate };
};

export const calculateStatistics = (
  transactions: any[],
  type: 'income' | 'expense'
) => {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);
  const categories = Array.from(
    new Map(
      filtered.map((t) => [
        t.category,
        {
          category: t.category,
          total: (filtered
            .filter((x) => x.category === t.category)
            .reduce((sum, x) => sum + x.amount, 0)),
          count: filtered.filter((x) => x.category === t.category).length,
        },
      ])
    ).values()
  );

  return {
    total,
    count: filtered.length,
    average: filtered.length > 0 ? total / filtered.length : 0,
    categories: categories.map((c: any) => ({
      ...c,
      percentage: total > 0 ? (c.total / total) * 100 : 0,
    })),
  };
};

export const generatePDF = (content: string, filename: string) => {
  const element = document.createElement('div');
  element.innerHTML = content;
  element.style.padding = '20px';
  element.style.fontFamily = 'Arial, sans-serif';
  element.style.fontSize = '14px';
  element.style.lineHeight = '1.6';

  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .total { font-weight: bold; background-color: #f9f9f9; }
            h2 { color: #333; margin-top: 20px; }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};
