// Utility to load flight hours breakdown from an XLSX file using exceljs
// Expects a sheet with headers containing PIC, SIC, IFR, VFR in the first row.
import ExcelJS from 'exceljs';

const TARGET_HEADERS = ['PIC', 'SIC', 'IFR', 'VFR'];

export async function loadFlightHoursFromXlsx(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const ws = workbook.worksheets[0];
  if (!ws) throw new Error('Workbook has no worksheets');

  // Map header -> column index from the first non-empty row
  let headerRow = ws.getRow(1);
  // If first row is empty, try to find first row with values within first 10 rows
  if (!headerRow.values || headerRow.values.length <= 1) {
    for (let i = 1; i <= Math.min(10, ws.rowCount); i++) {
      const r = ws.getRow(i);
      if (r && r.values && r.values.length > 1) { headerRow = r; break; }
    }
  }

  const headerToCol = {};
  headerRow.eachCell((cell, colNumber) => {
    const key = String(cell.value ?? '').trim().toUpperCase();
    if (TARGET_HEADERS.includes(key)) headerToCol[key] = colNumber;
  });

  const totals = { PIC: 0, SIC: 0, IFR: 0, VFR: 0 };

  for (const key of TARGET_HEADERS) {
    const col = headerToCol[key];
    if (!col) continue;
    for (let r = headerRow.number + 1; r <= ws.rowCount; r++) {
      const cellVal = ws.getRow(r).getCell(col).value;
      const num = normalizeToNumber(cellVal);
      if (!Number.isNaN(num)) totals[key] += num;
    }
  }

  // If nothing parsed, return null to let caller fallback
  const totalSum = Object.values(totals).reduce((a, b) => a + b, 0);
  if (totalSum === 0) return null;

  return [
    { name: 'PIC', value: totals.PIC },
    { name: 'SIC', value: totals.SIC },
    { name: 'IFR', value: totals.IFR },
    { name: 'VFR', value: totals.VFR },
  ];
}

function normalizeToNumber(value) {
  if (value == null) return NaN;
  // ExcelJS can return objects for formulas
  if (typeof value === 'object' && value && 'result' in value) return Number(value.result);
  if (typeof value === 'number') return value;
  const str = String(value).replace(/[^0-9.-]/g, '');
  const num = Number(str);
  return Number.isFinite(num) ? num : NaN;
}
