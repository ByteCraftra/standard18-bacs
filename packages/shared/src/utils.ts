/**
 * Converts a Julian date string (YYDDD) to a JS Date.
 * Returns null if invalid.
 */
export function parseJulianDate(julian: string): Date | null {
  if (!/^\d{5}$/.test(julian)) return null;
  const year = 2000 + parseInt(julian.substring(0, 2), 10);
  const dayOfYear = parseInt(julian.substring(2), 10);
  if (dayOfYear < 1 || dayOfYear > 366) return null;
  const date = new Date(year, 0);
  date.setDate(dayOfYear);
  return date;
}

/**
 * Formats a Date to Julian date string (YYDDD).
 */
export function formatJulianDate(date: Date): string {
  const year = date.getFullYear() % 100;
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return `${year.toString().padStart(2, '0')}${dayOfYear.toString().padStart(3, '0')}`;
}

/**
 * Left pads a string with a given character to a fixed length.
 */
export function leftPad(value: string, length: number, char = '0'): string {
  return value.padStart(length, char);
}

/**
 * Right pads a string with spaces to a fixed length.
 */
export function rightPad(value: string, length: number): string {
  return value.padEnd(length, ' ');
}

/**
 * Checks if a string contains only printable ASCII characters.
 */
export function isAsciiPrintable(str: string): boolean {
  return /^[\x20-\x7E]*$/.test(str);
}