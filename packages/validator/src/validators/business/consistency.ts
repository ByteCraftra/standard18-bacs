import { ValidationError, ValidationWarning, BacsFile, RecordType, TransactionCode } from '@standard18/shared';

/**
 * Checks cross-record consistency rules.
 */
export function checkConsistency(
  bacsFile: BacsFile,
  errors: ValidationError[],
  warnings: ValidationWarning[],
): void {
  // --- 1. Processing date must be identical everywhere ---
  const hdr1Date = bacsFile.hdr1.processingDate.trim();
  const uhl1Date = bacsFile.uhl1.processingDate.trim();
  if (hdr1Date !== uhl1Date) {
    errors.push({
      code: 'DATE_MISMATCH',
      message: `Processing date mismatch: HDR1=${hdr1Date}, UHL1=${uhl1Date}`,
      line: 2,
      severity: 'error',
    });
  }
  bacsFile.transactions.forEach((txn, idx) => {
    if (txn.processingDate.trim() !== hdr1Date) {
      errors.push({
        code: 'DATE_MISMATCH',
        message: `Transaction ${idx + 1}: processing date ${txn.processingDate} does not match header ${hdr1Date}`,
        line: 5 + idx,
        severity: 'error',
      });
    }
  });

  // --- 2. Serial number must be the same in all control records ---
  const serialVol = bacsFile.vol1.serialNumber;
  const serialHdr1 = bacsFile.hdr1.serialNumber;
  const serialHdr2 = bacsFile.hdr2.serialNumber;
  const serialEof1 = bacsFile.eof1.serialNumber;
  const serialEof2 = bacsFile.eof2.serialNumber;
  const serialUtl1 = bacsFile.utl1.serialNumber;
  const refSerial = serialVol;
  const checkSerial = (label: string, value: string, line: number) => {
    if (value !== refSerial) {
      errors.push({
        code: 'SERIAL_MISMATCH',
        message: `${label} serial number ${value} does not match VOL1 (${refSerial})`,
        line,
        severity: 'error',
      });
    }
  };
  checkSerial('HDR1', serialHdr1, 2);
  checkSerial('HDR2', serialHdr2, 3);
  checkSerial('EOF1', serialEof1, 0); // line numbers approximate
  checkSerial('EOF2', serialEof2, 0);
  checkSerial('UTL1', serialUtl1, 0);

  // --- 3. Originator details must match across UHL1 and all data records ---
  const originatorSort = bacsFile.uhl1.originatorSortCode.trim();
  const originatorAccount = bacsFile.uhl1.originatorAccountNumber.trim();
  bacsFile.transactions.forEach((txn, idx) => {
    if (txn.originatorSortCode.trim() !== originatorSort || txn.originatorAccountNumber.trim() !== originatorAccount) {
      errors.push({
        code: 'ORIGINATOR_MISMATCH',
        message: `Transaction ${idx + 1}: originator details do not match UHL1`,
        line: 5 + idx,
        severity: 'error',
      });
    }
  });

  // --- 4. Currency consistency (if present) ---
  const uhl1Currency = bacsFile.uhl1.currency.trim() || 'GBP';
  // Data records don't have a currency field, but if we ever add one we'd check it. For now, just ensure UHL1 currency is valid.
  if (!['GBP', 'EUR', 'USD'].includes(uhl1Currency)) {
    errors.push({
      code: 'INVALID_CURRENCY',
      message: `UHL1 currency code "${uhl1Currency}" is invalid`,
      line: 4,
      severity: 'error',
    });
  }

  // --- 5. Record count totals in EOF must match data records ---
  const totalDebitCount = parseInt(bacsFile.eof1.totalDebitCount || '0', 10);
  const totalCreditCount = parseInt(bacsFile.eof1.totalCreditCount || '0', 10);
  if (totalDebitCount + totalCreditCount !== bacsFile.transactions.length) {
    errors.push({
      code: 'RECORD_COUNT_MISMATCH',
      message: `EOF totals (${totalDebitCount} debits + ${totalCreditCount} credits) do not match actual transaction count (${bacsFile.transactions.length})`,
      line: 0,
      severity: 'error',
    });
  }

  // --- 6. Test file indicator warning ---
  if (bacsFile.hdr2.workCode === '1') {
    warnings.push({
      code: 'TEST_FILE',
      message: 'This is a test BACS file (work code = 1)',
      line: 3,
      severity: 'warning',
    });
  }
}