import { describe, it, expect, vi } from 'vitest';
import ExcelJS from 'exceljs';

vi.mock('exceljs/dist/exceljs.min.js', async () => {
  const Excel = await import('exceljs');
  return { default: Excel };
});

import { loadLogbook } from './loadExcel.js';

describe('loadLogbook', () => {
  it('parses rows into objects keyed by headers', async () => {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Sheet1');
    ws.addRow(['Name', 'Age']);
    ws.addRow(['Alice', 30]);
    ws.addRow([null, null]);
    ws.addRow(['Bob', '']);
    const buf = await workbook.xlsx.writeBuffer();

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(buf),
    });

    const rows = await loadLogbook('test.xlsx');

    expect(fetch).toHaveBeenCalledWith('test.xlsx');
    expect(rows).toEqual([
      { Name: 'Alice', Age: '30' },
      { Name: 'Bob', Age: '' },
    ]);
  });

  it('throws when fetch response is not ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    await expect(loadLogbook('missing.xlsx')).rejects.toThrow('Failed to fetch missing.xlsx: 404');
  });
});
