import React, { useMemo, useState } from 'react';
import type { Transaction } from '../types';
import { formatCurrency } from '../utils/helpers';
import { TrendingUp, TrendingDown, PieChart, BarChart3, Minus } from 'lucide-react';

interface AnalyticsProps { transactions: Transaction[]; }

export const Analytics = ({ transactions }: AnalyticsProps) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);

  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const dailyData = last7Days.map((date) => {
      const nextDay = new Date(date); nextDay.setDate(nextDay.getDate() + 1);
      const dayTx = transactions.filter((t) => { const td = new Date(t.date); return td >= date && td < nextDay; });
      return {
        date,
        income:  dayTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: dayTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      };
    });

    const categoryMap = new Map<string, number>();
    transactions.filter((t) => t.type === 'expense')
      .forEach((t) => categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount));
    const categoryData = Array.from(categoryMap.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total).slice(0, 5);
    const categoryTotal = categoryData.reduce((s, c) => s + c.total, 0);

    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const thisMonthTx = transactions.filter((t) => { const td = new Date(t.date); return td >= thisMonth && td < nextMonth; });
    const lastMonthTx = transactions.filter((t) => { const td = new Date(t.date); return td >= lastMonth && td < thisMonth; });

    return {
      dailyData,
      categoryData: categoryData.map((c) => ({ ...c, pct: categoryTotal > 0 ? (c.total / categoryTotal) * 100 : 0 })),
      monthly: {
        thisIncome:  thisMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        thisExpense: thisMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        lastIncome:  lastMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        lastExpense: lastMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      },
    };
  }, [transactions]);

  const maxDaily = Math.max(...analytics.dailyData.map((d) => Math.max(d.income, d.expense)), 1);
  const colors = ['#7c3aed', '#3b82f6', '#ec4899', '#f59e0b', '#10b981'];

  const pctChange = (curr: number, prev: number) =>
    prev === 0 ? null : Math.round(((curr - prev) / prev) * 100);

  const incomeChange  = pctChange(analytics.monthly.thisIncome,  analytics.monthly.lastIncome);
  const expenseChange = pctChange(analytics.monthly.thisExpense, analytics.monthly.lastExpense);

  const TrendIcon = ({ pct, invert = false }: { pct: number | null; invert?: boolean }) => {
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

  return (
    <div className="space-y-6 animate-fade-up mobile-pb md:pb-0">
      {/* Trend Line Chart */}
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
            {/* Income area */}
            <polyline
              points={analytics.dailyData.map((d, i) => `${60 + i * 100},${180 - (d.income / maxDaily) * 160}`).join(' ')}
              fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinejoin="round" />
            {/* Expense area */}
            <polyline
              points={analytics.dailyData.map((d, i) => `${60 + i * 100},${180 - (d.expense / maxDaily) * 160}`).join(' ')}
              fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinejoin="round" />
            {/* Interactive points */}
            {analytics.dailyData.map((d, i) => {
              const x = 60 + i * 100;
              const yInc = 180 - (d.income / maxDaily) * 160;
              const yExp = 180 - (d.expense / maxDaily) * 160;
              const isHovered = hoveredDay === i;
              return (
                <g key={i} onMouseEnter={() => setHoveredDay(i)} onMouseLeave={() => setHoveredDay(null)}
                  onTouchStart={() => setHoveredDay(i)} onTouchEnd={() => setHoveredDay(null)}
                  style={{ cursor: 'pointer' }}>
                  {/* Hit area */}
                  <rect x={x - 40} y={0} width={80} height={200} fill="transparent" />
                  {/* Vertical guide on hover */}
                  {isHovered && <line x1={x} y1={0} x2={x} y2={180} stroke="var(--border-hover)" strokeWidth="1" strokeDasharray="4,3" />}
                  {/* Income dot */}
                  <circle cx={x} cy={yInc} r={isHovered ? 6 : 4} fill="var(--green)" stroke="var(--bg-surface)" strokeWidth="2" />
                  {/* Expense dot */}
                  <circle cx={x} cy={yExp} r={isHovered ? 6 : 4} fill="var(--red)" stroke="var(--bg-surface)" strokeWidth="2" />
                  {/* Tooltip */}
                  {isHovered && (
                    <g>
                      <rect x={Math.min(x - 60, 580)} y={Math.min(yInc, yExp) - 58} width={120} height={52} rx="6"
                        fill="var(--bg-elevated)" stroke="var(--border-hover)" strokeWidth="1" />
                      <text x={Math.min(x - 60, 580) + 8} y={Math.min(yInc, yExp) - 40} fontSize="9" fill="var(--text-muted)">
                        {d.date.getDate()}/{d.date.getMonth() + 1}
                      </text>
                      <text x={Math.min(x - 60, 580) + 8} y={Math.min(yInc, yExp) - 26} fontSize="9" fill="var(--green)" fontWeight="600">
                        +{formatCurrency(d.income)}
                      </text>
                      <text x={Math.min(x - 60, 580) + 8} y={Math.min(yInc, yExp) - 13} fontSize="9" fill="var(--red)" fontWeight="600">
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={18} style={{ color: 'var(--accent-light)' }} />
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Top 5 Kategori Pengeluaran</h3>
          </div>
          {analytics.categoryData.length > 0 ? (
            <>
              <div className="flex justify-center mb-4 relative">
                <svg viewBox="0 0 200 200" className="w-44 h-44">
                  {analytics.categoryData.reduce((acc, cat, i) => {
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
                        fill={colors[i]}
                        opacity={hoveredCat !== null && !isHov ? 0.5 : 1}
                        transform={isHov ? `translate(${4 * Math.cos((Math.PI * (startAngle + angle / 2)) / 180)}, ${4 * Math.sin((Math.PI * (startAngle + angle / 2)) / 180)})` : ''}
                        style={{ cursor: 'pointer', transition: 'opacity 0.15s, transform 0.15s' }}
                        onMouseEnter={() => setHoveredCat(i)} onMouseLeave={() => setHoveredCat(null)}
                        onTouchStart={() => setHoveredCat(i)} onTouchEnd={() => setHoveredCat(null)}
                      />
                    );
                    acc.angle = endAngle;
                    return acc;
                  }, { angle: -90, paths: [] as React.ReactElement[] }).paths}
                  {/* Center label on hover */}
                  {hoveredCat !== null && analytics.categoryData[hoveredCat] && (
                    <g>
                      <circle cx="100" cy="100" r="42" fill="var(--bg-surface)" />
                      <text x="100" y="96" textAnchor="middle" fontSize="9" fill="var(--text-muted)">{analytics.categoryData[hoveredCat].name}</text>
                      <text x="100" y="110" textAnchor="middle" fontSize="10" fontWeight="700" fill={colors[hoveredCat]}>
                        {analytics.categoryData[hoveredCat].pct.toFixed(1)}%
                      </text>
                    </g>
                  )}
                </svg>
              </div>
              <div className="space-y-2">
                {analytics.categoryData.map((cat, i) => (
                  <div key={i}
                    className="flex items-center justify-between text-sm p-2 rounded-lg transition-colors cursor-pointer"
                    style={{ background: hoveredCat === i ? 'var(--bg-subtle-hover)' : 'transparent' }}
                    onMouseEnter={() => setHoveredCat(i)} onMouseLeave={() => setHoveredCat(null)}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colors[i] }} />
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

        {/* Monthly Comparison — Enhanced */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} style={{ color: 'var(--accent-light)' }} />
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Perbandingan Bulanan</h3>
            </div>
          </div>

          {/* Summary insight */}
          {(incomeChange !== null || expenseChange !== null) && (
            <div className="mb-4 p-3 rounded-xl text-xs" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              {expenseChange !== null && (
                <p style={{ color: 'var(--text-secondary)' }}>
                  {expenseChange < 0
                    ? `🎉 Pengeluaran turun ${Math.abs(expenseChange)}% dari bulan lalu!`
                    : expenseChange > 0
                    ? `⚠️ Pengeluaran naik ${expenseChange}% dari bulan lalu.`
                    : '✅ Pengeluaran sama dengan bulan lalu.'}
                </p>
              )}
              {incomeChange !== null && (
                <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {incomeChange > 0
                    ? `📈 Pemasukan naik ${incomeChange}% dari bulan lalu.`
                    : incomeChange < 0
                    ? `📉 Pemasukan turun ${Math.abs(incomeChange)}% dari bulan lalu.`
                    : ''}
                </p>
              )}
            </div>
          )}

          <div className="space-y-5">
            {[
              { label: 'Pemasukan', thisVal: analytics.monthly.thisIncome, lastVal: analytics.monthly.lastIncome, color: 'var(--green)', bg: 'rgba(16,185,129,0.12)', change: incomeChange, invert: false },
              { label: 'Pengeluaran', thisVal: analytics.monthly.thisExpense, lastVal: analytics.monthly.lastExpense, color: 'var(--red)', bg: 'rgba(239,68,68,0.12)', change: expenseChange, invert: true },
            ].map(({ label, thisVal, lastVal, color, bg, change, invert }) => {
              const maxVal = Math.max(thisVal, lastVal, 1);
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <div className="flex items-center gap-2">
                      <TrendIcon pct={change} invert={invert} />
                      <span className="text-xs font-semibold" style={{ color }}>{formatCurrency(thisVal)}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {[{ val: lastVal, label: 'Bulan Lalu', opacity: 0.6 }, { val: thisVal, label: 'Bulan Ini', opacity: 1 }].map(({ val, label: lbl, opacity }) => (
                      <div key={lbl} className="flex items-center gap-2">
                        <span className="text-[10px] w-16 shrink-0 text-right" style={{ color: 'var(--text-muted)' }}>{lbl}</span>
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
      </div>
    </div>
  );
};
