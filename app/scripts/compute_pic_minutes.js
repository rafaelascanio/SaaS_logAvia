// Node script to compute total PIC minutes for two or more pilots from the Excel logbook files.
// It reads app/public/data/logbook.xlsx for general data and app/public/data/logbook_<id>.xlsx for specific pilots if present.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DATA = path.join(APP_ROOT, 'public', 'data');

function toMinutes(hhmm) {
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

async function loadSheetMinutes(filePath) {
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.readFile(filePath);
  } catch {
    // Could not read file
    return null;
  }
  const ws = wb.worksheets[0];
  if (!ws) return 0;
  const headerRow = ws.getRow(1).values.slice(1);
  const headers = headerRow.map(h => (h != null ? String(h).trim() : ''));
  let totals = 0;
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const vals = row.values.slice(1);
    // skip empty rows
    if (vals.every(v => v == null || String(v).trim() === '')) continue;
    // determine PIC column by header name containing 'PIC'
    const findIndex = headers.findIndex(h => h && h.toUpperCase().includes('PIC'));
    const picIndex = findIndex;
    if (picIndex < 0) continue; // no PIC column
    const v = vals[picIndex];
    totals += toMinutes(v);
  }
  return totals;
}

async function computeForPilot(pilotId) {
  const generalPath = path.join(PUBLIC_DATA, 'logbook.xlsx');
  const specificPath = path.join(PUBLIC_DATA, `logbook_${pilotId}.xlsx`);
  let minutes = await loadSheetMinutes(generalPath);
  if (pilotId != null) {
    const specific = await loadSheetMinutes(specificPath);
    if (typeof specific === 'number' && specific > 0) minutes = specific; // prefer specific if it exists
  }
  return minutes ?? 0;
}

async function main() {
  // Discover pilot IDs by scanning the public/data directory for logbook_*.xlsx files
  let pilotIds = [];
  try {
    const files = await fs.promises.readdir(PUBLIC_DATA);
    pilotIds = files
      .map(n => {
        const m = n.match(/^logbook_(\d+)\\.xlsx$/); // note: double escaping for string literal, but in code this will be /logbook_(\d+)\.xlsx/
        return m ? parseInt(m[1], 10) : null;
      })
      .filter(id => id != null);
    // Filter out NaN and duplicates
    pilotIds = Array.from(new Set(pilotIds.filter(id => Number.isFinite(id))));
  } catch {
    // ignore if directory can't be read
  }

  // If no per-pilot files detected, fall back to known pilots
  const ids = pilotIds.length > 0 ? pilotIds : [1, 2];

  console.log('Computing PIC minutes for pilots:', ids.join(', '));
  for (const id of ids) {
    const mins = await computeForPilot(id);
    console.log(`Pilot ${id}: PIC minutes = ${mins}`);
  }
}

// Run via node
main().catch(() => {
  console.error('Error computing PIC minutes');
});
