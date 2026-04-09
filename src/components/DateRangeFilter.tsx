import { useState } from 'react';
import type { DateRange } from '../types';
import { CalendarDays } from 'lucide-react';

interface DateRangeFilterProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange, startDate?: Date, endDate?: Date) => void;
}

const RANGES: { value: DateRange; label: string }[] = [
  { value: 'today',     label: 'Hari Ini' },
  { value: 'week',      label: 'Minggu Ini' },
  { value: 'lastWeek',  label: 'Minggu Lalu' },
  { value: 'month',     label: 'Bulan Ini' },
  { value: 'lastMonth', label: 'Bulan Lalu' },
  { value: 'year',      label: 'Tahun Ini' },
  { value: 'lastYear',  label: 'Tahun Lalu' },
  { value: 'custom',    label: 'Custom' },
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
      <div className="flex flex-wrap gap-2">
        {RANGES.map(({ value, label }) => (
          <button key={value}
            onClick={() => { if (value === 'custom') setCustomVisible(true); else { setCustomVisible(false); onRangeChange(value); } }}
            className={`filter-pill ${selectedRange === value ? 'active' : ''}`}>
            {value === 'custom' && <CalendarDays size={12} className="inline mr-1 -mt-0.5" />}
            {label}
          </button>
        ))}
      </div>

      {customVisible && (
        <form onSubmit={handleCustomSubmit} className="animate-fade-up grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Dari Tanggal</label>
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="input-dark" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Sampai Tanggal</label>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="input-dark" required />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: 'var(--accent)', border: '1px solid rgba(124,58,237,0.3)' }}>Terapkan</button>
            <button type="button" onClick={() => setCustomVisible(false)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Batal</button>
          </div>
        </form>
      )}
    </div>
  );
};
