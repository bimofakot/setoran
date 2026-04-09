import React, { useMemo } from 'react';
import type { Transaction } from '../types';
import { formatCurrency } from '../utils/helpers';
import { TrendingUp, PieChart, BarChart3 } from 'lucide-react';

interface AnalyticsProps {
  transactions: Transaction[];
}

export const Analytics = ({ transactions }: AnalyticsProps) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const dailyData = last7Days.map((date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const dayTx = transactions.filter((t) => {
        const td = new Date(t.date);
        return td >= date && td < nextDay;
      });
      return {
        date,
        income: dayTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: dayTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      };
    });

    const categoryMap = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount));
    const categoryData = Array.from(categoryMap.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    const categoryTotal = categoryData.reduce((s, c) => s + c.total, 0);

    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const thisMonthTx = transactions.filter((t) => { const td = new Date(t.date); return td >= thisMonth && td < nextMonth; });
    const lastMonthTx = transactions.filter((t) => { const td = new Date(t.date); return td >= lastMonth && td < thisMonth; });

    return {
      dailyData,
      categoryData: categoryData.map((c) => ({ ...c, pct: (c.total / categoryTotal) * 100 })),
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

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Trend Line Chart */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} style={{ color: 'var(--accent-light)' }} />
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Tren 7 Hari Terakhir</h3>
        </div>
        <div className="relative h-56 rounded-xl p-4" style={{ background: 'var(--bg-subtle)' }}>
          <svg viewBox="0 0 700 200" className="w-full h-full">
            {[0, 25, 50, 75, 100].map((pct) => (
              <line key={pct} x1="40" y1={180 - pct * 1.6} x2="680" y2={180 - pct * 1.6}
                stroke="currentColor" strokeWidth="0.5" className="text-[var(--border)]" opacity="0.5" />
            ))}
            <polyline
              points={analytics.dailyData.map((d, i) => `${60 + i * 100},${180 - (d.income / maxDaily) * 160}`).join(' ')}
              fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinejoin="round" />
            <polyline
              points={analytics.dailyData.map((d, i) => `${60 + i * 100},${180 - (d.expense / maxDaily) * 160}`).join(' ')}
              fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinejoin="round" />
            {analytics.dailyData.map((d, i) => (
              <g key={i}>
                <circle cx={60 + i * 100} cy={180 - (d.income / maxDaily) * 160} r="4" fill="var(--green)" />
                <circle cx={60 + i * 100} cy={180 - (d.expense / maxDaily) * 160} r="4" fill="var(--red)" />
                <text x={60 + i * 100} y="198" fontSize="10" textAnchor="middle" fill="var(--text-muted)">
                  {d.date.getDate()}/{d.date.getMonth() + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div className="flex justify-center gap-6 mt-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--green)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Pemasukan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--red)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Pengeluaran</span>
          </div>
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
              <div className="flex justify-center mb-4">
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
                    acc.paths.push(
                      <path key={i} d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={colors[i]} />
                    );
                    acc.angle = endAngle;
                    return acc;
                  }, { angle: -90, paths: [] as React.ReactElement[] }).paths}
                </svg>
              </div>
              <div className="space-y-2">
                {analytics.categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
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

        {/* Monthly Comparison */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} style={{ color: 'var(--accent-light)' }} />
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Perbandingan Bulanan</h3>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Pemasukan', thisVal: analytics.monthly.thisIncome, lastVal: analytics.monthly.lastIncome, color: 'var(--green)', bg: 'rgba(16,185,129,0.12)' },
              { label: 'Pengeluaran', thisVal: analytics.monthly.thisExpense, lastVal: analytics.monthly.lastExpense, color: 'var(--red)', bg: 'rgba(239,68,68,0.12)' },
            ].map(({ label, thisVal, lastVal, color, bg }) => {
              const maxVal = Math.max(thisVal, lastVal, 1);
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <div className="flex gap-4 text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>Lalu: {formatCurrency(lastVal)}</span>
                      <span className="font-semibold" style={{ color }}> Ini: {formatCurrency(thisVal)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 h-7">
                    {[lastVal, thisVal].map((val, idx) => (
                      <div key={idx} className="flex-1 rounded-lg overflow-hidden" style={{ background: bg }}>
                        <div className="h-full rounded-lg flex items-center justify-end pr-2 text-xs text-white font-semibold transition-all duration-500"
                          style={{ width: `${Math.min((val / maxVal) * 100, 100)}%`, background: color, opacity: idx === 0 ? 0.7 : 1 }}>
                          {val > 0 && (idx === 0 ? 'Lalu' : 'Ini')}
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
