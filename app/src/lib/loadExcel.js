// Uses exceljs browser build
import ExcelJS from 'exceljs/dist/exceljs.min.js';

/**
 * Loads /data/logbook.xlsx (served from Vite's public/ folder)
 * Returns: array of objects keyed by the header row.
 */
export async function loadLogbook(url = '/data/logbook.xlsx') {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch ${url}: ${resp.status}`);
  const arrayBuffer = await resp.arrayBuffer();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const ws = workbook.worksheets[0]; // first sheet
  const headerCells = ws.getRow(1).values.slice(1); // exceljs is 1-based; remove first empty slot
  const headers = headerCells.map(h => String(h).trim());

  const rows = [];
  for (let r = 2; r <= ws.rowCount; r++) {
    const vals = ws.getRow(r).values.slice(1);
    // skip empty rows
    if (vals.every(v => v == null || String(v).trim() === '')) continue;

    const obj = {};
    vals.forEach((v, i) => {
      // normalize rich/text cells
      if (v && typeof v === 'object' && 'text' in v) {
        obj[headers[i]] = v.text;
      } else if (v == null) {
        obj[headers[i]] = '';
      } else {
        obj[headers[i]] = String(v);
      }
    });

    rows.push(obj);
  }
  return rows;
}

