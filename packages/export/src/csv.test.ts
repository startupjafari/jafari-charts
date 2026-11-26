import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';

describe('toCsv', () => {
  it('writes a BOM, a header and RFC 4180 quoting', () => {
    const csv = toCsv([
      { name: 'a,b', v: 1 },
      { name: 'say "hi"', v: null },
    ]);
    expect(csv).toBe('﻿name,v\r\n"a,b",1\r\n"say ""hi""",\r\n');
  });

  it('neutralises spreadsheet formulas but keeps negative numbers', () => {
    const csv = toCsv([{ a: '=1+1', b: '-5', c: '@x' }], { bom: false });
    expect(csv.split('\r\n')[1]).toBe("'=1+1,-5,'@x");
  });

  it('supports custom columns, labels, formatters and delimiters', () => {
    const rows = [{ d: new Date(Date.UTC(2025, 0, 2)), n: 1.5 }];
    const csv = toCsv(rows, {
      bom: false,
      delimiter: ';',
      columns: [
        { key: 'd', label: 'Дата' },
        { key: 'n', label: 'Число', format: (v) => String(v).replace('.', ',') },
      ],
    });
    expect(csv).toBe('Дата;Число\r\n2025-01-02T00:00:00.000Z;1,5\r\n');
  });

  it('handles empty data and invalid values', () => {
    expect(toCsv([], { bom: false })).toBe('\r\n');
    expect(toCsv([{ x: Number.NaN, y: new Date('x') }], { bom: false })).toBe('x,y\r\n,\r\n');
  });
});
