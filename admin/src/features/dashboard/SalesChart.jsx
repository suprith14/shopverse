// import = bring in code from another file or package
// useState = a value the component remembers; calling its setter redraws the component
import { useState } from 'react';
// import = bring in code from another file or package
// CartesianGrid = the background grid lines
// Line = one line series (dataKey = which field to draw)
// LineChart = a chart of lines over the x axis
// ResponsiveContainer = the chart fills its parent's width and height
// Tooltip = the box with values shown on hover
// XAxis = the horizontal axis
// YAxis = the vertical axis
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
// import = bring in code from another file or package
import { formatPrice } from '@/lib/format';
// import = bring in code from another file or package
import { chart, compactMoney, shortDate } from './chartTheme';

// Sales per day as a line. Revenue ($) and order counts have different scales, so instead
// of squeezing both onto two y-axes (hard to read and easy to misread), one switch picks which
// one to plot. The data table below gives the exact numbers.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function SalesChart({ data }) {
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [metric, setMetric] = useState('revenue');
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // a ? b : c = ternary: if a then b else c
  // === = strictly equal (same value AND same type)
  // `text ${x}` = a template string: text with values inserted
  const format = (v) => (metric === 'revenue' ? formatPrice(v) : `${v} order${v === 1 ? '' : 's'}`);

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="mb-3 flex items-center justify-between">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           a ? b : c = ternary: if a then b else c
           === = strictly equal (same value AND same type) */}
        <h2 className="font-semibold">{metric === 'revenue' ? 'Revenue per day' : 'Orders per day'}</h2>
        {/* role = tells screen readers what this element is (status, tab, group...)
           aria-label = the name screen readers read for this element
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div role="radiogroup" aria-label="Metric" className="flex rounded-lg bg-slate-100 p-0.5 text-sm">
          {/* { } in JSX = run JavaScript here and show its result
             .map = make a new array by transforming each item (in JSX: one element per item)
             => = an arrow function (a short function) */}
          {['revenue', 'orders'].map((m) => (
            <button
              // key = a stable id for list items so React can track them between redraws
              // { } in JSX = run JavaScript here and show its result
              key={m}
              // role = tells screen readers what this element is (status, tab, group...)
              role="radio"
              // { } in JSX = run JavaScript here and show its result
              // === = strictly equal (same value AND same type)
              aria-checked={metric === m}
              // onClick = what happens on click/tap
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              onClick={() => setMetric(m)}
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              // { } in JSX = run JavaScript here and show its result
              // `text ${x}` = a template string: text with values inserted
              // a ? b : c = ternary: if a then b else c
              // === = strictly equal (same value AND same type)
              className={`rounded-md px-3 py-1 capitalize ${metric === m ? 'bg-white font-medium shadow-sm' : 'text-slate-600'}`}
            >
              {/* { } in JSX = run JavaScript here and show its result */}
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="h-64">
        {/* ResponsiveContainer = the chart fills its parent's width and height */}
        <ResponsiveContainer width="100%" height="100%">
          {/* LineChart = a chart of lines over the x axis
             { } in JSX = run JavaScript here and show its result */}
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            {/* Horizontal hairlines only: enough to read values, quiet enough not to compete with the line */}
            {/* CartesianGrid = the background grid lines
               { } in JSX = run JavaScript here and show its result */}
            <CartesianGrid vertical={false} stroke={chart.grid} />
            {/* XAxis = the horizontal axis */}
            <XAxis
              // dataKey = which field of each data item this part uses
              dataKey="date"
              // { } in JSX = run JavaScript here and show its result
              tickFormatter={shortDate}
              // { } in JSX = run JavaScript here and show its result
              minTickGap={24}
              // { } in JSX = run JavaScript here and show its result
              tickLine={false}
              // { } in JSX = run JavaScript here and show its result
              axisLine={{ stroke: chart.baseline }}
              // { } in JSX = run JavaScript here and show its result
              tick={{ fill: chart.axis, fontSize: 12 }}
            />
            {/* YAxis = the vertical axis */}
            <YAxis
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              // a ? b : c = ternary: if a then b else c
              // === = strictly equal (same value AND same type)
              tickFormatter={(v) => (metric === 'revenue' ? compactMoney(v) : String(v))}
              // { } in JSX = run JavaScript here and show its result
              allowDecimals={false}
              // { } in JSX = run JavaScript here and show its result
              width={56}
              // { } in JSX = run JavaScript here and show its result
              tickLine={false}
              // { } in JSX = run JavaScript here and show its result
              axisLine={false}
              // { } in JSX = run JavaScript here and show its result
              tick={{ fill: chart.axis, fontSize: 12 }}
            />
            {/* Hover: a vertical crosshair + the exact value for that day */}
            {/* Tooltip = the box with values shown on hover */}
            <Tooltip
              // { } in JSX = run JavaScript here and show its result
              cursor={{ stroke: chart.baseline, strokeWidth: 1 }}
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              // { a, b } = destructuring: take properties a and b out of an object
              // payload = the data that travels with an action
              content={({ active, payload }) => {
                // const = a name for a value that is never reassigned
                // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
                // payload = the data that travels with an action
                const point = payload?.[0]?.payload;
                // if (...) = run the next part only when the condition is true
                // ! = NOT: flips true/false
                // a || b = OR: a if it is truthy, else b
                // return = give this value back and stop the function here
                if (!active || !point) return null;
                // return = give this value back and stop the function here
                return (
                  // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
                    {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                       { } in JSX = run JavaScript here and show its result */}
                    <p className="text-xs text-slate-500">{shortDate(point.date)}</p>
                    {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                       { } in JSX = run JavaScript here and show its result
                       obj[key] = read the property whose name is stored in key */}
                    <p className="font-semibold text-slate-900">{format(point[metric])}</p>
                  </div>
                );
              }}
            />
            {/* Line = one line series (dataKey = which field to draw) */}
            <Line
              type="linear"
              // dataKey = which field of each data item this part uses
              // { } in JSX = run JavaScript here and show its result
              dataKey={metric}
              // { } in JSX = run JavaScript here and show its result
              stroke={chart.series}
              // { } in JSX = run JavaScript here and show its result
              strokeWidth={2}
              // { } in JSX = run JavaScript here and show its result
              dot={false}
              // { } in JSX = run JavaScript here and show its result
              activeDot={{ r: 4, stroke: '#ffffff', strokeWidth: 2 }}
              // { } in JSX = run JavaScript here and show its result
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* The same numbers as a table: for exact values, screen readers, and copying into a report */}
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <details className="mt-2 text-sm">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <summary className="cursor-pointer text-slate-500 hover:text-slate-700">View as table</summary>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="mt-2 max-h-60 overflow-y-auto">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <table className="w-full tabular-nums">
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <thead className="sticky top-0 bg-white text-left text-xs text-slate-500">
              <tr>
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                <th className="py-1">Day</th>
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                <th className="py-1 text-right">Orders</th>
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                <th className="py-1 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {/* { } in JSX = run JavaScript here and show its result
                 ...x = spread: copy all items/properties of x into here
                 .map = make a new array by transforming each item (in JSX: one element per item)
                 => = an arrow function (a short function) */}
              {[...data].reverse().map((p) => (
                // key = a stable id for list items so React can track them between redraws
                // { } in JSX = run JavaScript here and show its result
                // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                <tr key={p.date} className="border-t border-slate-100">
                  {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                     { } in JSX = run JavaScript here and show its result */}
                  <td className="py-1">{shortDate(p.date)}</td>
                  {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                     { } in JSX = run JavaScript here and show its result */}
                  <td className="py-1 text-right">{p.orders}</td>
                  {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                     { } in JSX = run JavaScript here and show its result */}
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
