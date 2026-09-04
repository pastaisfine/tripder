const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function fmtDateRange(start, end) {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  if (s.getMonth() === e.getMonth()) {
    return `${MONTHS_SHORT[s.getMonth()]} ${s.getDate()}\u2013${e.getDate()}`;
  }
  return `${MONTHS_SHORT[s.getMonth()]} ${s.getDate()}\u2013${MONTHS_SHORT[e.getMonth()]} ${e.getDate()}`;
}

export function dayCount(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000) + 1;
}
