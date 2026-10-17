import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatPrice } from '@/lib/format';
import { chart, compactMoney } from './chartTheme';

// Horizontal bars for "which is biggest?" questions (best sellers, revenue by category).
// Horizontal so long product names stay readable. One colour: bars compare size, they don't
// need different identities. Each bar is labelled with its value, so no value axis is needed.
export function RankedBars({ title, rows, emptyText }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-3 font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div style={{ height: rows.length * 40 + 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 4, right: 64, bottom: 4, left: 0 }}
              barCategoryGap={10}
            >
              <XAxis type="number" hide domain={[0, 'dataMax']} />
              <YAxis
                type="category"
                dataKey="label"
                width={140}
                tickLine={false}
                axisLine={false}
                tick={{ fill: chart.textSecondary, fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(11,11,11,0.04)' }}
                content={({ active, payload }) => {
                  const row = payload?.[0]?.payload;
                  if (!active || !row) return null;
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
                      <p className="font-medium text-slate-900">{row.label}</p>
                      <p className="text-slate-600">
                        {formatPrice(row.revenue)} · {row.units} sold
                      </p>
                    </div>
                  );
                }}
              />
              {/* Rounded only at the data end (4px); the bar starts flat at the baseline */}
              <Bar dataKey="revenue" fill={chart.series} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                <LabelList
                  dataKey="revenue"
                  position="right"
                  formatter={(v) => compactMoney(Number(v))}
                  style={{ fill: chart.textSecondary, fontSize: 12 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
