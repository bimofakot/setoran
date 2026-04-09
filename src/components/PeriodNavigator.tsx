import type { DateRange } from '../types';
import { ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react';
import { getDateRange } from '../utils/helpers';

interface PeriodNavigatorProps {
  mode: DateRange;
  offset: number;
  onModeChange: (mode: DateRange) => void;
  onOffsetChange: (offset: number) => void;
  showCustom?: boolean;
  onShowCustom?: () => void;
  isCustomActive?: boolean;
}

const MODES: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Harian' },
  { value: 'week',  label: 'Mingguan' },
  { value: 'month', label: 'Bulanan' },
  { value: 'year',  label: 'Tahunan' },
];

const formatPeriodLabel = (mode: DateRange, offset: number): string => {
  if (mode === 'custom') return 'Rentang Custom';
  const { startDate, endDate } = getDateRange(mode, offset);
  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) => d.toLocaleDateString('id-ID', opts);

  if (mode === 'today') {
    if (offset === 0) return 'Hari Ini';
    if (offset === -1) return 'Kemarin';
    return fmt(startDate, { weekday: 'long', day: 'numeric', month: 'short' });
  }
  if (mode === 'week') {
    const s = fmt(startDate, { day: 'numeric', month: 'short' });
    const e = fmt(endDate, { day: 'numeric', month: 'short', year: 'numeric' });
    return `${s} – ${e}`;
  }
  if (mode === 'month') return fmt(startDate, { month: 'long', year: 'numeric' });
  if (mode === 'year') return String(startDate.getFullYear());
  return '';
};

export const PeriodNavigator = ({
  mode, offset, onModeChange, onOffsetChange,
  showCustom = false, onShowCustom, isCustomActive = false,
}: PeriodNavigatorProps) => {
  const isCustom = isCustomActive;
  const isFuture = offset >= 0;

  return (
    <div className="space-y-3">
      {/* Mode pills — scrollable on narrow screens */}
      <div className="pill-row">
        {MODES.map(({ value, label }) => (
          <button key={value}
            onClick={() => { onModeChange(value); onOffsetChange(0); }}
            className={`filter-pill ${!isCustom && mode === value ? 'active' : ''}`}>
            {label}
          </button>
        ))}
        {showCustom && (
          <button
            onClick={onShowCustom}
            className={`filter-pill flex items-center gap-1 ${isCustom ? 'active' : ''}`}>
            <CalendarRange size={12} /> Custom
          </button>
        )}
      </div>

      {/* Prev / Label / Next */}
      {!isCustom && (
        <div className="flex items-center gap-2">
          <button onClick={() => onOffsetChange(offset - 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}>
            <ChevronLeft size={15} />
          </button>

          <div className="flex-1 text-center">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {formatPeriodLabel(mode, offset)}
            </span>
            {offset !== 0 && (
              <button onClick={() => onOffsetChange(0)}
                className="ml-2 text-xs px-2 py-0.5 rounded-full transition-colors"
                style={{ color: 'var(--accent-light)', background: 'rgba(124,58,237,0.1)' }}>
                Kembali
              </button>
            )}
          </div>

          <button onClick={() => onOffsetChange(offset + 1)}
            disabled={isFuture}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 disabled:opacity-30"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => { if (!isFuture) (e.currentTarget.style.background = 'var(--bg-subtle-hover)'); }}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}>
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};
