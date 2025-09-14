export function toMinutes(hhmm) {
  if (hhmm == null) return 0;
  const s = String(hhmm).trim();
  if (s === '') return 0;
  if (s.includes(':')) {
    const [h, m] = s.split(':');
    return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
  }
  const n = Number(s.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function toHHMM(mins) {
  if (!Number.isFinite(mins)) return '00:00';
  const sign = mins < 0 ? '-' : '';
  const abs = Math.abs(Math.round(mins));
  const h = String(Math.floor(abs / 60)).padStart(2, '0');
  const m = String(abs % 60).padStart(2, '0');
  return `${sign}${h}:${m}`;
}
