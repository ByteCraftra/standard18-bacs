import { ValidationWarning, BacsFile } from '@standard18/shared';

/**
 * Generates non‑blocking warnings for unusual field values.
 */
export function checkFieldWarnings(
  bacsFile: BacsFile,
  warnings: ValidationWarning[],
): void {
  const LARGE_PAYMENT_THRESHOLD = 1_000_000_00; // £1,000,000 in pence

  bacsFile.transactions.forEach((txn, idx) => {
    const line = 5 + idx;
    const amount = parseInt(txn.amount, 10) || 0;

    // Large payment warning
    if (amount > LARGE_PAYMENT_THRESHOLD) {
      warnings.push({
        code: 'LARGE_PAYMENT',
        message: `Transaction ${idx + 1}: amount £${(amount / 100).toFixed(2)} exceeds threshold`,
        line,
        severity: 'warning',
      });
    }

    // Zero amount warning
    if (amount === 0) {
      warnings.push({
        code: 'ZERO_AMOUNT',
        message: `Transaction ${idx + 1}: amount is zero`,
        line,
        severity: 'warning',
      });
    }

    // Missing reference
    if (!txn.reference.trim()) {
      warnings.push({
        code: 'MISSING_REFERENCE',
        message: `Transaction ${idx + 1}: payment reference is empty`,
        line,
        severity: 'warning',
      });
    }
  });

  // Reserved field check (warning if reserved fields contain non-space characters)
  // Example: VOL1 reserved1, reserved2, etc. We'll just do a sample check.
  const checkReserved = (record: Record<string, string>, name: string, line: number) => {
    Object.entries(record).forEach(([key, value]) => {
      if (key.startsWith('reserved') && value.trim() !== '') {
        warnings.push({
          code: 'RESERVED_FIELD_NOT_BLANK',
          message: `${name} field "${key}" contains non-space characters`,
          line,
          severity: 'warning',
        });
      }
    });
  };
  checkReserved(bacsFile.vol1 as unknown as Record<string, string>, 'VOL1', 1);
  checkReserved(bacsFile.hdr1 as unknown as Record<string, string>, 'HDR1', 2);
  checkReserved(bacsFile.hdr2 as unknown as Record<string, string>, 'HDR2', 3);
  checkReserved(bacsFile.uhl1 as unknown as Record<string, string>, 'UHL1', 4);
  checkReserved(bacsFile.eof1 as unknown as Record<string, string>, 'EOF1', 0);
  checkReserved(bacsFile.eof2 as unknown as Record<string, string>, 'EOF2', 0);
  checkReserved(bacsFile.utl1 as unknown as Record<string, string>, 'UTL1', 0);

  // Optional: warn if processing date is a weekend/public holiday (could use a library)
  // For now, skip.
}