import React, { useMemo, useState } from 'react';
import type { Transaction, DateRange } from '../types';
import { formatCurrency, getDateRange } from '../utils/helpers';
import { TrendingUp, TrendingDown, PieChart, BarChart3, Minus, CalendarDays } from 'lucide-react';
import { PeriodNavigator } from './PeriodNavigator';

interface AnalyticsProps {
  transactions: Transaction[];
  // optional: controlled from Dashboard
  mode?: DateRange;
  offset?: number;
  customRange?: { start: Date; end: Date } | null;
  onModeChange?: (m: DateRange) => void;
  onOffsetChange?: (o: number) => void;
  onCustomRange?: (start: Date, end: Date) => void;
}

const COLORS = ['#7c3aed', '#3b82f6', '#ec4899', '#f59e0b', '#10b981'];

const pctChange = (curr: number, prev: number) =>
  prev === 0 ? null : Math.round(((curr - prev) / prev) * 100);

const TrendBadge = ({ pct, invert = false }: { pct: number | null; invert?: boolean }) => {
  if (pct === null) return null;
  const isGood = invert ? pct < 0 : pct > 0;
  const color = isGood ? 'var(--green)' : pct === 0 ? 'var(--text-muted)' : 'var(--red)';
  const Icon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ color, background: `${color}18` }}>
      <Icon size={11} />{Math.abs(pct)}%
    </span>
  );
};

export const Analytics = ({
  transactions,
  mode: modeProp,
  offset: offsetProp,
  customRange: customRangeProp,
  onModeChange,
  onOffsetChange,
  onCustomRange,
}: AnalyticsProps) => {
  // local state used when not controlled from Dashboard
  const [localMode, setLocalMode] = useState<DateRange>('month');
  const [localOffset, setLocalOffset] = useState(0);
  const [localCustomRange, setLocalCustomRange] = useState<{ start: Date; end: Date } | null>(null);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const mode   = modeProp   ?? localMode;
  const offset = offsetProp ?? localOffset;
  const customRange = customRangeProp !== undefined ? customRangeProp : localCustomRange;

  const handleModeChange = (m: DateRange) => {
    if (onModeChange) { onModeChange(m); }
    else { setLocalMode(m); setLocalOffset(0); setLocalCustomRange(null); }
    if (m !== 'custom') setShowCustom(false);
    if (m === 'custom') setShowCustom(true);
  };

  const handleOffsetChange = (o: number) => {
    if (onOffsetChange) onOffsetChange(o);
    else setLocalOffset(o);
  };

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) return;
    const start = new Date(customStart);
    const end = new Date(customEnd + 'T23:59:59');
    if (onCustomRange) onCustomRange(start, end);
    else setLocalCustomRange({ start, end });
    setShowCustom(false);
  };

  // ── filtered transactions for current period ──────────────────────────────
  const filtered = useMemo(() => {
    if (mode === 'custom' && customRange) {
      return transactions.filter((t) => {
        const td = new Date(t.date);
        return td >= customRange.start && td <= customRange.end;
      });
    }
    const { startDate, endDate } = getDateRange(mode, offset);
    return transactions.filter((t) => {
      const td = new Date(t.date);
      return td >= startDate && td <= endDate;
    });
  }, [transactions, mode, offset, customRange]);

  // ── comparison: previous period ───────────────────────────────────────────
  const prevFiltered = useMemo(() => {
    if (mode === 'custom') return [];
    const { startDate, endDate } = getDateRange(mode, offset - 1);
    return transactions.filter((t) => {
      const td = new Date(t.date);
      return td >= startDate && td <= endDate;
    });
  }, [transactions, mode, offset]);

  // ── "Tampilkan Semua" comparison rows ─────────────────────────────────────
  const allComparisons = useMemo(() => {
    const build = (m: DateRange) => {
      const { startDate: s1, endDate: e1 } = getDateRange(m, 0);
      const { startDate: s0, endDate: e0 } = getDateRange(m, -1);
      const curr = transactions.filter((t) => { const td = new Date(t.date); return td >= s1 && td <= e1; });
      const prev = transactions.filter((t) => { const td = new Date(t.date); return td >= s0 && td <= e0; });
      const sum = (arr: Transaction[], type: 'income' | 'expense') =>
        arr.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
      return {
        label: m === 'today' ? 'Harian' : m === 'week' ? 'Mingguan' : 'Bulanan',
        currIncome: sum(curr, 'income'), prevIncome: sum(prev, 'income'),
        currExpense: sum(curr, 'expense'), prevExpense: sum(prev, 'expense'),
      };
    };
    return (['today', 'week', 'month'] as DateRange[]).map(build);
  }, [transactions]);

  // ── trend chart: last 7 days within filtered period ───────────────────────
  const { dailyData, maxDaily } = useMemo(() => {
    const now = new Date();
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    const data = last7.map((date) => {
      const next = new Date(date); next.setDate(next.getDate() + 1);
      const day = filtered.filter((t) => { const td = new Date(t.date); return td >= date && td < next; });
      return {
        date,
        income:  day.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: day.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      };
    });
    return { dailyData: data, maxDaily: Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1) };
  }, [filtered]);

  // ── category pie ──────────────────────────────────────────────────────────
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.filter((t) => t.type === 'expense').forEach((t) =>
      map.set(t.category, (map.get(t.category) || 0) + t.amount));
    const arr = Array.from(map.entries()).map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total).slice(0, 5);
    const tot = arr.reduce((s, c) => s + c.total, 0);
    return arr.map((c) => ({ ...c, pct: tot > 0 ? (c.total / tot) * 100 : 0 }));
  }, [filtered]);

  // ── smart comparison (current period vs previous) ─────────────────────────
  const currIncome  = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const currExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const prevIncome  = prevFiltered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevFiltered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const incomeChange  = pctChange(currIncome, prevIncome);
  const expenseChange = pctChange(currExpense, prevExpense);

  const compLabel = mode === 'today' ? 'kemarin' : mode === 'week' ? 'minggu lalu' : mode === 'month' ? 'bulan lalu' : mode === 'year' ? 'tahun lalu' : null;

  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="space-y-6 animate-fade-up mobile-pb md:pb-0">
      {/* ── Period Navigator ── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays size={16} style={{ color: 'var(--accent-light)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Periode Analisis</span>
        </div>
        <PeriodNavigator
          mode={mode === 'custom' ? 'month' : mode}
          offset={offset}
          onModeChange={handleModeChange}
          onOffsetChange={handleOffsetChange}
          showCustom
          onShowCustom={() => setShowCustom(true)}
          isCustomActive={mode === 'custom'}
        />
        {/* Custom date picker */}
        {showCustom && (
          <div className="mt-3 flex flex-wrap gap-2 items-end animate-fade-up">
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Dari</label>
              <input type="date" className="input-dark text-sm" value={customStart}
                onChange={e => setCustomStart(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Sampai</label>
              <input type="date" className="input-dark text-sm" value={customEnd}
                onChange={e => setCustomEnd(e.target.value)} />
            </div>
            <button onClick={handleApplyCustom}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600">
              Terapkan
            </button>
            <button onClick={() => { setShowCustom(false); handleModeChange('month'); }}
              className="px-3 py-2 rounded-xl text-sm" style={{ color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}>
              Batal
            </button>
          </div>
        )}
      </div>

      {/* ── Trend Chart ── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} style={{ color: 'var(--accent-light)' }} />
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Tren 7 Hari Terakhir</h3>
        </div>
        <div className="relative h-56 rounded-xl p-4" style={{ background: 'var(--bg-subtle)' }}>
          <svg viewBox="0 0 700 210" className="w-full h-full overflow-visible">
            {[0, 25, 50, 75, 100].map((pct) => (
              <line key={pct} x1="40" y1={180 - pct * 1.6} x2="680" y2={180 - pct * 1.6}
                stroke="var(--border)" strokeWidth="1" />
            ))}
            <polyline
              points={dailyData.map((d, i) => `${60 + i * 100},${180 - (d.income / maxDaily) * 160}`).join(' ')}
              fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinejoin="round" />
            <polyline
              points={dailyData.map((d, i) => `${60 + i * 100},${180 - (d.expense / maxDaily) * 160}`).join(' ')}
              fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinejoin="round" />
            {dailyData.map((d, i) => {
              const x = 60 + i * 100;
              const yInc = 180 - (d.income / maxDaily) * 160;
              const yExp = 180 - (d.expense / maxDaily) * 160;
              const isHov = hoveredDay === i;
              const tipX = Math.min(x - 70, 560);
              const tipY = Math.min(yInc, yExp) - 72;
              return (
                <g key={i} onMouseEnter={() => setHoveredDay(i)} onMouseLeave={() => setHoveredDay(null)}
                  onTouchStart={() => setHoveredDay(i)} onTouchEnd={() => setTimeout(() => setHoveredDay(null), 1500)}
                  style={{ cursor: 'pointer' }}>
                  <rect x={x - 40} y={0} width={80} height={200} fill="transparent" />
                  {isHov && <line x1={x} y1={0} x2={x} y2={180} stroke="var(--border-hover)" strokeWidth="1" strokeDasharray="4,3" />}
                  <circle cx={x} cy={yInc} r={isHov ? 7 : 4} fill="var(--green)" stroke="var(--bg-surface)" strokeWidth="2" />
                  <circle cx={x} cy={yExp} r={isHov ? 7 : 4} fill="var(--red)" stroke="var(--bg-surface)" strokeWidth="2" />
                  {isHov && (
                    <g>
                      <rect x={tipX} y={tipY} width={140} height={66} rx="8"
                        fill="var(--bg-elevated)" stroke="var(--border-hover)" strokeWidth="1.5" />
                      <text x={tipX + 10} y={tipY + 18} fontSize="11" fill="var(--text-muted)" fontWeight="500">
                        {d.date.getDate()}/{d.date.getMonth() + 1}/{d.date.getFullYear()}
                      </text>
                      <text x={tipX + 10} y={tipY + 36} fontSize="12" fill="var(--green)" fontWeight="700">
                        +{formatCurrency(d.income)}
                      </text>
                      <text x={tipX + 10} y={tipY + 54} fontSize="12" fill="var(--red)" fontWeight="700">
                        -{formatCurrency(d.expense)}
                      </text>
                    </g>
                  )}
                  <text x={x} y="200" fontSize="10" textAnchor="middle" fill="var(--text-muted)">
                    {d.date.getDate()}/{d.date.getMonth() + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex justify-center gap-6 mt-3 text-sm">
          {[{ color: 'var(--green)', label: 'Pemasukan' }, { color: 'var(--red)', label: 'Pengeluaran' }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom grid: Pie + Smart Comparison ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Category Pie */}
        <div className="card flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={18} style={{ color: 'var(--accent-light)' }} />
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Top 5 Kategori Pengeluaran</h3>
          </div>
          {categoryData.length > 0 ? (
            <>
              <div className="flex justify-center mb-4 relative">
                <svg viewBox="0 0 200 200" className="w-44 h-44">
                  {categoryData.reduce((acc, cat, i) => {
                    const startAngle = acc.angle;
                    const angle = (cat.pct / 100) * 360;
                    const endAngle = startAngle + angle;
                    const largeArc = angle > 180 ? 1 : 0;
                    const x1 = 100 + 80 * Math.cos((Math.PI * startAngle) / 180);
                    const y1 = 100 + 80 * Math.sin((Math.PI * startAngle) / 180);
                    const x2 = 100 + 80 * Math.cos((Math.PI * endAngle) / 180);
                    const y2 = 100 + 80 * Math.sin((Math.PI * endAngle) / 180);
                    const isHov = hoveredCat === i;
                    acc.paths.push(
                      <path key={i}
                        d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={COLORS[i]}
                        opacity={hoveredCat !== null && !isHov ? 0.5 : 1}
                        transform={isHov ? `translate(${4 * Math.cos((Math.PI * (startAngle + angle / 2)) / 180)}, ${4 * Math.sin((Math.PI * (startAngle + angle / 2)) / 180)})` : ''}
                        style={{ cursor: 'pointer', transition: 'opacity 0.15s, transform 0.15s' }}
                        onMouseEnter={() => setHoveredCat(i)} onMouseLeave={() => setHoveredCat(null)}
                        onTouchStart={() => setHoveredCat(i)} onTouchEnd={() => setTimeout(() => setHoveredCat(null), 1500)}
                      />
                    );
                    acc.angle = endAngle;
                    return acc;
                  }, { angle: -90, paths: [] as React.ReactElement[] }).paths}
                  {hoveredCat !== null && categoryData[hoveredCat] && (
                    <g>
                      <circle cx="100" cy="100" r="46" fill="var(--bg-surface)" />
                      <text x="100" y="93" textAnchor="middle" fontSize="10" fill="var(--text-muted)">{categoryData[hoveredCat].name}</text>
                      <text x="100" y="108" textAnchor="middle" fontSize="13" fontWeight="700" fill={COLORS[hoveredCat]}>
                        {categoryData[hoveredCat].pct.toFixed(1)}%
                      </text>
                      <text x="100" y="122" textAnchor="middle" fontSize="9" fill="var(--text-secondary)">
                        {formatCurrency(categoryData[hoveredCat].total)}
                      </text>
                    </g>
                  )}
                </svg>
              </div>
              <div className="space-y-2">
                {categoryData.map((cat, i) => (
                  <div key={i}
                    className="flex items-center justify-between text-sm p-2 rounded-lg transition-colors cursor-pointer"
                    style={{ background: hoveredCat === i ? 'var(--bg-subtle-hover)' : 'transparent' }}
                    onMouseEnter={() => setHoveredCat(i)} onMouseLeave={() => setHoveredCat(null)}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(cat.total)}</span>
                      <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>({cat.pct.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Belum ada data pengeluaran</p>
          )}
        </div>

        {/* Smart Comparison */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} style={{ color: 'var(--accent-light)' }} />
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                {showAll ? 'Ringkasan Perbandingan' : 'Perbandingan Periode'}
              </h3>
            </div>
            <button onClick={() => setShowAll(v => !v)}
              className="text-xs px-2.5 py-1 rounded-full border transition-colors"
              style={{ color: 'var(--accent-light)', borderColor: 'rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.07)' }}>
              {showAll ? 'Ringkas' : 'Tampilkan Semua'}
            </button>
          </div>

          {showAll ? (
            /* ── Tampilkan Semua: harian / mingguan / bulanan ── */
            <div className="space-y-4 flex-1">
              {allComparisons.map(({ label, currIncome: ci, prevIncome: pi, currExpense: ce, prevExpense: pe }) => {
                const ic = pctChange(ci, pi);
                const ec = pctChange(ce, pe);
                return (
                  <div key={label} className="p-3 rounded-xl border" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    <div className="flex justify-between text-sm">
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Masuk </span>
                        <span className="font-semibold" style={{ color: 'var(--green)' }}>{formatCurrency(ci)}</span>
                        <span className="ml-1"><TrendBadge pct={ic} /></span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Keluar </span>
                        <span className="font-semibold" style={{ color: 'var(--red)' }}>{formatCurrency(ce)}</span>
                        <span className="ml-1"><TrendBadge pct={ec} invert /></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Smart Comparison: current vs previous period ── */
            <div className="flex-1 flex flex-col justify-between">
              {compLabel && (incomeChange !== null || expenseChange !== null) && (
                <div className="mb-4 p-3 rounded-xl text-xs" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                  {expenseChange !== null && (
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {expenseChange < 0
                        ? `🎉 Pengeluaran turun ${Math.abs(expenseChange)}% vs ${compLabel}!`
                        : expenseChange > 0
                        ? `⚠️ Pengeluaran naik ${expenseChange}% vs ${compLabel}.`
                        : `✅ Pengeluaran sama dengan ${compLabel}.`}
                    </p>
                  )}
                  {incomeChange !== null && incomeChange !== 0 && (
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {incomeChange > 0
                        ? `📈 Pemasukan naik ${incomeChange}% vs ${compLabel}.`
                        : `📉 Pemasukan turun ${Math.abs(incomeChange)}% vs ${compLabel}.`}
                    </p>
                  )}
                </div>
              )}
              {mode === 'custom' && (
                <p className="text-xs mb-4 text-center" style={{ color: 'var(--text-muted)' }}>
                  Perbandingan tidak tersedia untuk rentang custom.
                </p>
              )}
              <div className="space-y-5">
                {[
                  { label: 'Pemasukan', curr: currIncome, prev: prevIncome, color: 'var(--green)', bg: 'rgba(16,185,129,0.12)', change: incomeChange, invert: false },
                  { label: 'Pengeluaran', curr: currExpense, prev: prevExpense, color: 'var(--red)', bg: 'rgba(239,68,68,0.12)', change: expenseChange, invert: true },
                ].map(({ label, curr, prev, color, bg, change, invert }) => {
                  const maxVal = Math.max(curr, prev, 1);
                  const prevLabel = compLabel ? (mode === 'today' ? 'Kemarin' : mode === 'week' ? 'Minggu Lalu' : mode === 'month' ? 'Bulan Lalu' : 'Tahun Lalu') : 'Sebelumnya';
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                        <div className="flex items-center gap-2">
                          <TrendBadge pct={change} invert={invert} />
                          <span className="text-xs font-semibold" style={{ color }}>{formatCurrency(curr)}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {[{ val: prev, lbl: prevLabel, opacity: 0.6 }, { val: curr, lbl: 'Periode Ini', opacity: 1 }].map(({ val, lbl, opacity }) => (
                          <div key={lbl} className="flex items-center gap-2">
                            <span className="text-[10px] w-20 shrink-0 text-right" style={{ color: 'var(--text-muted)' }}>{lbl}</span>
                            <div className="flex-1 h-5 rounded-lg overflow-hidden" style={{ background: bg }}>
                              <div className="h-full rounded-lg flex items-center justify-end pr-2 text-[10px] text-white font-semibold transition-all duration-700"
                                style={{ width: `${Math.min((val / maxVal) * 100, 100)}%`, background: color, opacity }}>
                                {val > 0 && formatCurrency(val)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
