import { useState } from 'react';
import type { DateRange } from '../types';

interface DateRangeFilterProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange, startDate?: Date, endDate?: Date) => void;
}

export const DateRangeFilter = ({
  selectedRange,
  onRangeChange,
}: DateRangeFilterProps) => {
  const [customVisible, setCustomVisible] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      const startDate = new Date(customStart);
      const endDate = new Date(customEnd);
      if (startDate <= endDate) {
        onRangeChange('custom', startDate, endDate);
        setCustomVisible(false);
      }
    }
  };

  const getRangeLabel = (range: DateRange) => {
    const labels: Record<DateRange, string> = {
      today: 'Hari Ini',
      week: 'Minggu Ini',
      month: 'Bulan Ini',
      year: 'Tahun Ini',
      custom: 'Custom',
    };
    return labels[range];
  };

  return (
    <div className="space-y-3">
      {/* Quick Filter Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {(['today', 'week', 'month', 'year', 'custom'] as DateRange[]).map((range) => (
          <button
            key={range}
            onClick={() => {
              if (range === 'custom') {
                setCustomVisible(true);
              } else {
                setCustomVisible(false);
                onRangeChange(range);
              }
            }}
            className={`
              py-2 px-3 rounded-lg font-medium text-sm transition-all
              ${
                selectedRange === range
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
              }
            `}
          >
            {getRangeLabel(range)}
          </button>
        ))}
      </div>

      {/* Custom Date Range Form */}
      {customVisible && (
        <form onSubmit={handleCustomSubmit} className="bg-slate-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Terapkan
            </button>
            <button
              type="button"
              onClick={() => setCustomVisible(false)}
              className="flex-1 bg-slate-300 text-slate-900 py-2 rounded-lg hover:bg-slate-400 transition-colors font-medium"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
