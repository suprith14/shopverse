import { TERMS } from './terms';
import { Term } from './Term';

// Turns plain text into text where every known short form (RFP, SOW, MoM...) is underlined and
// explains itself: hover or keyboard focus on a computer, tap on a phone. Longest terms first, so
// "CI/CD" wins over "CI", and "ISO 27001" over "ISO". A trailing "s" (PRs, APIs) stays outside.
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PATTERN = new RegExp(
  `(?<![A-Za-z0-9])(${TERMS.map(([term]) => term)
    .sort((a, b) => b.length - a.length)
    .map(escape)
    .join('|')})(s?)(?![A-Za-z0-9])`,
  'g',
);

export function withTerms(text, keyPrefix = 't') {
  const out = [];
  let last = 0;
  for (const match of text.matchAll(PATTERN)) {
    if (match.index > last) out.push(text.slice(last, match.index));
    out.push(<Term key={`${keyPrefix}${match.index}`} term={match[1]} />);
    if (match[2]) out.push(match[2]);
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
