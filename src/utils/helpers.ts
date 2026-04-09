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
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
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
