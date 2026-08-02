// packages/shared/src/validators.ts
export function validateSortCode(value: string): string | null {
  if (!/^\d{6}$/.test(value)) return 'Sort code must be 6 digits';
  // Could add UK sort code checks later
  return null;
}

export function validateAccountNumber(value: string): string | null {
  if (!/^\d{8}$/.test(value)) return 'Account number must be 8 digits';
  return null;
}

export function validateJulianDate(value: string): string | null {
  if (!/^\d{5}$/.test(value)) return 'Julian date must be 5 digits (YYDDD)';
  const year = 2000 + parseInt(value.substring(0, 2), 10);
  const day = parseInt(value.substring(2), 10);
  if (day < 1 || day > 366) return 'Invalid day of year';
  // Additional leap year checks can go here
  const date = new Date(year, 0);
  date.setDate(day);
  if (date.getFullYear() !== year) return 'Invalid date (year mismatch)';
  return null;
}

export function validateAmount(value: string): string | null {
  if (!/^\d{13}$/.test(value)) return 'Amount must be 13 digits (zero‑filled)';
  return null;
}

export function validateSun(value: string): string | null {
  if (!/^\d{3}$/.test(value)) return 'SUN must be 3 digits';
  return null;
}