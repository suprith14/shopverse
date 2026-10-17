import { useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatPrice } from '@/lib/format';
import { chart, compactMoney, shortDate } from './chartTheme';

// Sales per day as a line. Revenue ($) and order counts have different scales, so instead
// of squeezing both onto two y-axes (hard to read and easy to misread), one switch picks which
// one to plot. The data table below gives the exact numbers.
export function SalesChart({ data }) {
  const [metric, setMetric] = useState('revenue');
  const format = (v) => (metric === 'revenue' ? formatPrice(v) : `${v} order${v === 1 ? '' : 's'}`);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{metric === 'revenue' ? 'Revenue per day' : 'Orders per day'}</h2>
        <div role="radiogroup" aria-label="Metric" className="flex rounded-lg bg-slate-100 p-0.5 text-sm">
          {['revenue', 'orders'].map((m) => (
            <button
              key={m}
              role="radio"
              aria-checked={metric === m}
              onClick={() => setMetric(m)}
              className={`rounded-md px-3 py-1 capitalize ${metric === m ? 'bg-white font-medium shadow-sm' : 'text-slate-600'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            {/* Horizontal hairlines only: enough to read values, quiet enough not to compete with the line */}
            <CartesianGrid vertical={false} stroke={chart.grid} />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              minTickGap={24}
              tickLine={false}
              axisLine={{ stroke: chart.baseline }}
              tick={{ fill: chart.axis, fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(v) => (metric === 'revenue' ? compactMoney(v) : String(v))}
              allowDecimals={false}
              width={56}
              tickLine={false}
              axisLine={false}
              tick={{ fill: chart.axis, fontSize: 12 }}
            />
            {/* Hover: a vertical crosshair + the exact value for that day */}
            <Tooltip
              cursor={{ stroke: chart.baseline, strokeWidth: 1 }}
              content={({ active, payload }) => {
                const point = payload?.[0]?.payload;
                if (!active || !point) return null;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
                    <p className="text-xs text-slate-500">{shortDate(point.date)}</p>
                    <p className="font-semibold text-slate-900">{format(point[metric])}</p>
                  </div>
                );
              }}
            />
            <Line
              type="linear"
              dataKey={metric}
              stroke={chart.series}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#ffffff', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* The same numbers as a table: for exact values, screen readers, and copying into a report */}
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-slate-500 hover:text-slate-700">View as table</summary>
        <div className="mt-2 max-h-60 overflow-y-auto">
          <table className="w-full tabular-nums">
            <thead className="sticky top-0 bg-white text-left text-xs text-slate-500">
              <tr>
                <th className="py-1">Day</th>
                <th className="py-1 text-right">Orders</th>
                <th className="py-1 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((p) => (
                <tr key={p.date} className="border-t border-slate-100">
                  <td className="py-1">{shortDate(p.date)}</td>
                  <td className="py-1 text-right">{p.orders}</td>
                  <td className="py-1 text-right">{formatPrice(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
