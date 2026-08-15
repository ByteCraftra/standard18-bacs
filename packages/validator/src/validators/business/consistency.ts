import { ValidationError, ValidationWarning, BacsFile } from '@standard18/shared';

export function checkConsistency(
  bacsFile: BacsFile,
  errors: ValidationError[],
  warnings: ValidationWarning[],
): void {
  // Serial number consistency: VOL1, HDR1, EOF1 must match
  const serialVol = bacsFile.vol1.serialNumber;
  const serialHdr1 = bacsFile.hdr1.serialNumber;
  const serialEof1 = bacsFile.eof1.serialNumber;
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
  checkSerial('EOF1', serialEof1, 0);

  // Processing date rule
  if (bacsFile.dataRecordLength === 100) {
    // Header date is mandatory and must be valid
    const headerDate = bacsFile.uhl1.processingDate;
    if (!headerDate || headerDate.trim() === '') {
      errors.push({
        code: 'HEADER_DATE_REQUIRED',
        message: 'UHL1 processing date is required for 100-byte data records',
        line: 4,
        severity: 'error',
      });
    }
  } else if (bacsFile.dataRecordLength === 106) {
    // Each transaction must have its own date; ignore header
    bacsFile.transactions.forEach((txn, idx) => {
      if (!txn.processingDate || txn.processingDate.trim() === '') {
        errors.push({
          code: 'TRANSACTION_DATE_REQUIRED',
          message: `Transaction ${idx + 1}: processing date is required`,
          line: 5 + idx,
          severity: 'error',
        });
      }
    });
  }

  // Test file warning – use UHL1 workCode
  if (bacsFile.uhl1.workCode.trim().toUpperCase().includes('TEST')) {
    warnings.push({
      code: 'TEST_FILE',
      message: 'This is a test BACS file',
      line: 4,
      severity: 'warning',
    });
  }
}