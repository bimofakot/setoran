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

    // Daily trend
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

    // Category breakdown (expense only)
    const categoryMap = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount));
    const categoryData = Array.from(categoryMap.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    const categoryTotal = categoryData.reduce((s, c) => s + c.total, 0);

    // Monthly comparison
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const thisMonthTx = transactions.filter((t) => {
      const td = new Date(t.date);
      return td >= thisMonth && td < nextMonth;
    });
    const lastMonthTx = transactions.filter((t) => {
      const td = new Date(t.date);
      return td >= lastMonth && td < thisMonth;
    });

    return {
      dailyData,
      categoryData: categoryData.map((c) => ({ ...c, pct: (c.total / categoryTotal) * 100 })),
      monthly: {
        thisIncome: thisMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        thisExpense: thisMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        lastIncome: lastMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        lastExpense: lastMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      },
    };
  }, [transactions]);

  const maxDaily = Math.max(
    ...analytics.dailyData.map((d) => Math.max(d.income, d.expense)),
    1
  );

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Trend Line Chart */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">Tren 7 Hari Terakhir</h3>
        </div>
        <div className="relative h-64 bg-slate-50 rounded-lg p-4">
          <svg viewBox="0 0 700 200" className="w-full h-full">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((pct) => (
              <line
                key={pct}
                x1="40"
                y1={180 - pct * 1.6}
                x2="680"
                y2={180 - pct * 1.6}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            ))}
            {/* Income line */}
            <polyline
              points={analytics.dailyData
                .map((d, i) => `${60 + i * 100},${180 - (d.income / maxDaily) * 160}`)
                .join(' ')}
              fill="none"
              stroke="#16a34a"
              strokeWidth="3"
            />
            {/* Expense line */}
            <polyline
              points={analytics.dailyData
                .map((d, i) => `${60 + i * 100},${180 - (d.expense / maxDaily) * 160}`)
                .join(' ')}
              fill="none"
              stroke="#dc2626"
              strokeWidth="3"
            />
            {/* Points */}
            {analytics.dailyData.map((d, i) => (
              <g key={i}>
                <circle cx={60 + i * 100} cy={180 - (d.income / maxDaily) * 160} r="4" fill="#16a34a" />
                <circle cx={60 + i * 100} cy={180 - (d.expense / maxDaily) * 160} r="4" fill="#dc2626" />
                <text x={60 + i * 100} y="195" fontSize="10" textAnchor="middle" fill="#64748b">
                  {d.date.getDate()}/{d.date.getMonth() + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded-full" />
            <span className="text-slate-600">Pemasukan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full" />
            <span className="text-slate-600">Pengeluaran</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={20} className="text-purple-600" />
            <h3 className="text-lg font-bold text-slate-900">Top 5 Kategori Pengeluaran</h3>
          </div>
          {analytics.categoryData.length > 0 ? (
            <>
              <div className="flex justify-center mb-4">
                <svg viewBox="0 0 200 200" className="w-48 h-48">
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
                      <path
                        key={i}
                        d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={colors[i]}
                      />
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
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i] }} />
                      <span className="text-slate-700">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-900">{formatCurrency(cat.total)}</span>
                      <span className="text-slate-500 ml-2">({cat.pct.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-slate-500 py-8">Belum ada data pengeluaran</p>
          )}
        </div>

        {/* Monthly Comparison */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-orange-600" />
            <h3 className="text-lg font-bold text-slate-900">Perbandingan Bulanan</h3>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Pemasukan</span>
                <div className="flex gap-4">
                  <span className="text-slate-500">Bulan Lalu: {formatCurrency(analytics.monthly.lastIncome)}</span>
                  <span className="font-semibold text-green-600">Bulan Ini: {formatCurrency(analytics.monthly.thisIncome)}</span>
                </div>
              </div>
              <div className="flex gap-2 h-8">
                <div className="flex-1 bg-green-200 rounded" style={{ width: '50%' }}>
                  <div
                    className="h-full bg-green-500 rounded flex items-center justify-end pr-2 text-xs text-white font-semibold"
                    style={{ width: `${Math.min((analytics.monthly.lastIncome / Math.max(analytics.monthly.thisIncome, analytics.monthly.lastIncome, 1)) * 100, 100)}%` }}
                  >
                    {analytics.monthly.lastIncome > 0 && 'Lalu'}
                  </div>
                </div>
                <div className="flex-1 bg-green-200 rounded" style={{ width: '50%' }}>
                  <div
                    className="h-full bg-green-600 rounded flex items-center justify-end pr-2 text-xs text-white font-semibold"
                    style={{ width: `${Math.min((analytics.monthly.thisIncome / Math.max(analytics.monthly.thisIncome, analytics.monthly.lastIncome, 1)) * 100, 100)}%` }}
                  >
                    {analytics.monthly.thisIncome > 0 && 'Ini'}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Pengeluaran</span>
                <div className="flex gap-4">
                  <span className="text-slate-500">Bulan Lalu: {formatCurrency(analytics.monthly.lastExpense)}</span>
                  <span className="font-semibold text-red-600">Bulan Ini: {formatCurrency(analytics.monthly.thisExpense)}</span>
                </div>
              </div>
              <div className="flex gap-2 h-8">
                <div className="flex-1 bg-red-200 rounded" style={{ width: '50%' }}>
                  <div
                    className="h-full bg-red-500 rounded flex items-center justify-end pr-2 text-xs text-white font-semibold"
                    style={{ width: `${Math.min((analytics.monthly.lastExpense / Math.max(analytics.monthly.thisExpense, analytics.monthly.lastExpense, 1)) * 100, 100)}%` }}
                  >
                    {analytics.monthly.lastExpense > 0 && 'Lalu'}
                  </div>
                </div>
                <div className="flex-1 bg-red-200 rounded" style={{ width: '50%' }}>
                  <div
                    className="h-full bg-red-600 rounded flex items-center justify-end pr-2 text-xs text-white font-semibold"
                    style={{ width: `${Math.min((analytics.monthly.thisExpense / Math.max(analytics.monthly.thisExpense, analytics.monthly.lastExpense, 1)) * 100, 100)}%` }}
                  >
                    {analytics.monthly.thisExpense > 0 && 'Ini'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
