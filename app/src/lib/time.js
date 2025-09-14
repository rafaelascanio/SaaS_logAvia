export function toMinutes(hhmm) {
  if (hhmm == null || hhmm === '') return 0;
  const s = String(hhmm).trim();
  if (s.includes(':')) {
    const [h, m] = s.split(':');
    return (Number(h) || 0) * 60 + (Number(m) || 0);
  }
  const num = Number(s);
  return Number.isNaN(num) ? 0 : num;
}

export function toHHMM(mins) {
  const total = Number(mins) || 0;
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
