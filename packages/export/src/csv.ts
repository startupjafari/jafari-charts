export interface CsvColumn<T> {
  key: keyof T & string;
  label?: string;
  format?: (value: T[keyof T], datum: T) => string;
}

export interface CsvOptions<T> {
  columns?: readonly CsvColumn<T>[];
  /** Field delimiter (default ","; use ";" for spreadsheet locales with decimal commas). */
  delimiter?: string;
  /** Prepend a UTF-8 BOM so Excel detects Cyrillic text correctly (default true). */
  bom?: boolean;
}

function escape(value: string, delimiter: string): string {
  // Neutralise spreadsheet formula injection (=, +, -, @ at the start of a text cell).
  const safe = /^[=+\-@\t\r]/.test(value) && !/^-?\d+([.,]\d+)?$/.test(value) ? `'${value}` : value;
  return /["\n\r]/.test(safe) || safe.includes(delimiter) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function cell(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return Number.isFinite(v.getTime()) ? v.toISOString() : '';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '';
  return String(v);
}

/** Serialises the chart's source data as CSV (RFC 4180 quoting). */
export function toCsv<T extends object>(data: readonly T[], options: CsvOptions<T> = {}): string {
  const delimiter = options.delimiter ?? ',';
  const columns: readonly CsvColumn<T>[] =
    options.columns ?? (Object.keys(data[0] ?? {}) as (keyof T & string)[]).map((key) => ({ key }));
  const header = columns.map((c) => escape(c.label ?? c.key, delimiter)).join(delimiter);
  const rows = data.map((d) =>
    columns
      .map((c) => escape(c.format ? c.format(d[c.key], d) : cell(d[c.key]), delimiter))
      .join(delimiter),
  );
  return `${options.bom === false ? '' : '﻿'}${[header, ...rows].join('\r\n')}\r\n`;
}

export function toCsvBlob<T extends object>(data: readonly T[], options: CsvOptions<T> = {}): Blob {
  return new Blob([toCsv(data, options)], { type: 'text/csv;charset=utf-8' });
}
