import { useState } from 'react';
import type { DateRange } from '../types';
import { CalendarDays } from 'lucide-react';

interface DateRangeFilterProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange, startDate?: Date, endDate?: Date) => void;
}

const RANGES: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Hari Ini' },
  { value: 'week',  label: 'Minggu Ini' },
  { value: 'month', label: 'Bulan Ini' },
  { value: 'year',  label: 'Tahun Ini' },
  { value: 'custom', label: 'Custom' },
];

export const DateRangeFilter = ({ selectedRange, onRangeChange }: DateRangeFilterProps) => {
  const [customVisible, setCustomVisible] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      const s = new Date(customStart), en = new Date(customEnd);
      if (s <= en) { onRangeChange('custom', s, en); setCustomVisible(false); }
    }
  };

  return (
    <div className="space-y-4">
      {/* Pills */}
      <div className="flex flex-wrap gap-2">
        {RANGES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => {
              if (value === 'custom') { setCustomVisible(true); }
              else { setCustomVisible(false); onRangeChange(value); }
            }}
            className={`filter-pill ${selectedRange === value ? 'active' : ''}`}
          >
            {value === 'custom' && <CalendarDays size={12} className="inline mr-1 -mt-0.5" />}
            {label}
          </button>
        ))}
      </div>

      {/* Custom date form */}
      {customVisible && (
        <form onSubmit={handleCustomSubmit} className="animate-fade-up grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Dari Tanggal</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="input-dark"
              style={{ colorScheme: 'dark' }}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sampai Tanggal</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="input-dark"
              style={{ colorScheme: 'dark' }}
              required
            />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit"
              className="flex-1 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors border border-indigo-500/30">
              Terapkan
            </button>
            <button type="button" onClick={() => setCustomVisible(false)}
              className="flex-1 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10">
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
