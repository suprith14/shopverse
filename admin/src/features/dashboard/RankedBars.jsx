// import = bring in code from another file or package
// Bar = one bar series (dataKey = which field to draw)
// BarChart = a chart of bars
// LabelList = value labels written on the bars
// ResponsiveContainer = the chart fills its parent's width and height
// Tooltip = the box with values shown on hover
// XAxis = the horizontal axis
// YAxis = the vertical axis
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
// import = bring in code from another file or package
import { formatPrice } from '@/lib/format';
// import = bring in code from another file or package
import { chart, compactMoney } from './chartTheme';

// Horizontal bars for "which is biggest?" questions (best sellers, revenue by category).
// Horizontal so long product names stay readable. One colour: bars compare size, they don't
// need different identities. Each bar is labelled with its value, so no value axis is needed.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function RankedBars({ title, rows, emptyText }) {
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result */}
      <h2 className="mb-3 font-semibold">{title}</h2>
      {/* { } in JSX = run JavaScript here and show its result
         a ? b : c = ternary: if a then b else c
         === = strictly equal (same value AND same type) */}
      {rows.length === 0 ? (
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        // { } in JSX = run JavaScript here and show its result
        <p className="py-8 text-center text-sm text-slate-500">{emptyText}</p>
      ) : (
        // { } in JSX = run JavaScript here and show its result
        <div style={{ height: rows.length * 40 + 8 }}>
          {/* ResponsiveContainer = the chart fills its parent's width and height */}
          <ResponsiveContainer width="100%" height="100%">
            {/* BarChart = a chart of bars */}
            <BarChart
              // { } in JSX = run JavaScript here and show its result
              data={rows}
              layout="vertical"
              // { } in JSX = run JavaScript here and show its result
              margin={{ top: 4, right: 64, bottom: 4, left: 0 }}
              // { } in JSX = run JavaScript here and show its result
              barCategoryGap={10}
            >
              {/* XAxis = the horizontal axis
                 { } in JSX = run JavaScript here and show its result */}
              <XAxis type="number" hide domain={[0, 'dataMax']} />
              {/* YAxis = the vertical axis */}
              <YAxis
                type="category"
                // dataKey = which field of each data item this part uses
                dataKey="label"
                // { } in JSX = run JavaScript here and show its result
                width={140}
                // { } in JSX = run JavaScript here and show its result
                tickLine={false}
                // { } in JSX = run JavaScript here and show its result
                axisLine={false}
                // { } in JSX = run JavaScript here and show its result
                tick={{ fill: chart.textSecondary, fontSize: 12 }}
              />
              {/* Tooltip = the box with values shown on hover */}
              <Tooltip
                // { } in JSX = run JavaScript here and show its result
                cursor={{ fill: 'rgba(11,11,11,0.04)' }}
                // { } in JSX = run JavaScript here and show its result
                // => = an arrow function (a short function)
                // { a, b } = destructuring: take properties a and b out of an object
                // payload = the data that travels with an action
                content={({ active, payload }) => {
                  // const = a name for a value that is never reassigned
                  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
                  // payload = the data that travels with an action
                  const row = payload?.[0]?.payload;
                  // if (...) = run the next part only when the condition is true
                  // ! = NOT: flips true/false
                  // a || b = OR: a if it is truthy, else b
                  // return = give this value back and stop the function here
                  if (!active || !row) return null;
                  // return = give this value back and stop the function here
                  return (
                    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
                      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                         { } in JSX = run JavaScript here and show its result */}
                      <p className="font-medium text-slate-900">{row.label}</p>
                      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                      <p className="text-slate-600">
                        {/* { } in JSX = run JavaScript here and show its result */}
                        {formatPrice(row.revenue)} · {row.units} sold
                      </p>
                    </div>
                  );
                }}
              />
              {/* Rounded only at the data end (4px); the bar starts flat at the baseline */}
              {/* Bar = one bar series (dataKey = which field to draw)
                 dataKey = which field of each data item this part uses
                 { } in JSX = run JavaScript here and show its result */}
              <Bar dataKey="revenue" fill={chart.series} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {/* LabelList = value labels written on the bars */}
                <LabelList
                  // dataKey = which field of each data item this part uses
                  dataKey="revenue"
                  position="right"
                  // { } in JSX = run JavaScript here and show its result
                  // => = an arrow function (a short function)
                  formatter={(v) => compactMoney(Number(v))}
                  // { } in JSX = run JavaScript here and show its result
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
