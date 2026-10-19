// Chart colours by ROLE, in one place. Values come from a validated data-viz palette:
// the series blue passes the lightness, chroma and 3:1 contrast checks on our white cards.
export const chart = {
  series: '#2a78d6', // the one data colour (every chart here shows a single series)
  grid: '#e1e0d9', // hairline gridlines: recessive, so data stands out
  axis: '#898781', // axis tick labels
  baseline: '#c3c2b7',
  text: '#0b0b0b',
  textSecondary: '#52514e',
  up: '#006300', // "better than last period" text (always shown with an arrow + words, never colour alone)
  down: '#d03b3b',
};

// Compact money for axes: 1234567 cents -> "$12.3k"
export const compactMoney = (cents) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(cents / 100);

// "2026-10-16" -> "Oct 16" (dates from the API are UTC days)
export const shortDate = (isoDay) =>
  new Date(`${isoDay}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
