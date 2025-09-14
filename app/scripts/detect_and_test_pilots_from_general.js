// Detect pilots from logbook.xlsx and test PIC minutes per pilot by scanning the general logbook file
import ExcelJS from 'exceljs';
import path from 'path';
import { toMinutes } from '../src/utils/time.js';

const APP_ROOT = path.resolve('c:\\Users\\rafae\\SaaS_logAvia\\app');
const DATA_FILE = path.join(APP_ROOT, 'public', 'data', 'logbook.xlsx');

async function loadLogbookWorkbook(filePath){
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];
  const headerRow = ws.getRow(1).values.slice(1);
  const headers = headerRow.map(h => (h != null ? String(h).trim() : ''));
  return { ws, headers };
}

function findIndex(headers, substr){
  return headers.findIndex(h => h && h.toUpperCase().includes(substr));
}

async function main(){
  try {
    const { ws, headers } = await loadLogbookWorkbook(DATA_FILE);
    // Identify PIC column
    const picIndex = findIndex(headers, 'PIC');
    // Identify Pilot column (prefer a header containing 'PILOT', else 'NAME')
    let pilotIndex = findIndex(headers, 'PILOT');
    if (pilotIndex < 0) pilotIndex = findIndex(headers, 'NAME');
    if (picIndex < 0 || pilotIndex < 0) {
      console.log('Cannot determine PIC column or Pilot column from logbook.xlsx.');
      return;
    }

    const totals = {}; // pilot -> minutes
    for (let r = 2; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      const vals = row.values.slice(1);
      if (vals.every(v => v == null || String(v).trim() === '')) continue;
      const pilot = vals[pilotIndex] ?? '';
      const picVal = vals[picIndex];
      const minutes = toMinutes(picVal);
      const key = pilot != null ? String(pilot).trim() : '';
      if (!totals[key]) totals[key] = 0;
      totals[key] += minutes;
    }

    const pilotKeys = Object.keys(totals).filter(k => k !== '');
    if (pilotKeys.length === 0) {
      console.log('No pilots found in logbook.xlsx.');
      return;
    }

    console.log(`Pilots found in logbook.xlsx: ${pilotKeys.length}`);
    pilotKeys.sort();
    pilotKeys.forEach(pk => {
      console.log(`Pilot '${pk}': PIC minutes = ${totals[pk]}`);
    });
  } catch (err) {
    console.error('Error detecting pilots from logbook.xlsx:', err?.message ?? err);
  }
}

main();
