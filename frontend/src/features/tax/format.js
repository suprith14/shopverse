// Indian number format: 12,50,000 (lakh grouping), always whole rupees
export const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;
export const pct = (n) => `${+(n * 100).toFixed(1)}%`;
