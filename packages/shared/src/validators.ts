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
  // The field may be space‑padded to 6 characters – trim it.
  const trimmed = value.trim();
  if (!/^\d{5}$/.test(trimmed)) return 'Julian date must be 5 digits (YYDDD), possibly space‑padded';
  const year = 2000 + parseInt(trimmed.substring(0, 2), 10);
  const day = parseInt(trimmed.substring(2), 10);
  if (day < 1 || day > 366) return 'Invalid day of year';
  // Leap year check (simple: accept 366 only if year is a leap year)
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (day === 366 && !isLeap) return 'Day 366 is invalid for a non‑leap year';
  const date = new Date(year, 0);
  date.setDate(day);
  if (date.getFullYear() !== year) return 'Invalid date (year mismatch)';
  return null;
}

export function validateAmount(value: string): string | null {
  // Amount can be 11 digits (100-byte) or 13 digits (106-byte)
  if (!/^\d{11}$/.test(value) && !/^\d{13}$/.test(value)) {
    return 'Amount must be 11 or 13 digits (zero‑filled)';
  }
  return null;
}

export function validateSun(value: string): string | null {
  // Standard 18 SUN is 6 digits
  if (!/^\d{6}$/.test(value)) {
    return 'SUN must be 6 digits';
  }
  return null;
}