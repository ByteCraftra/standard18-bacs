import {
  ValidationError, ValidationWarning, ValidationSummary,
  BacsFile, RecordType, TransactionCode,
  VOL1_FIELD_SPECS, HDR1_FIELD_SPECS, HDR2_FIELD_SPECS, UHL1_FIELD_SPECS,
  DATA_FIELD_SPECS_100, DATA_FIELD_SPECS_106,
  EOF1_FIELD_SPECS, EOF2_FIELD_SPECS, UTL1_FIELD_SPECS,
  RECORD_LENGTHS,
  FieldSpec, 
  validateSortCode, validateAccountNumber, validateJulianDate, validateAmount, validateSun,
} from '@standard18/shared';
import { checkConsistency } from './business/consistency';
import { checkDuplicates } from './business/duplicates';
import { checkFieldWarnings } from './business/fieldWarnings';
import { checkContra } from './business/contra';

// ... existing checkRecordLengths and checkRecordOrder remain, but ensure they import RECORD_LENGTHS

export function checkRecordLengths(lines: string[], errors: ValidationError[]): void {
  lines.forEach((line, index) => {
    const typeCode = line.substring(0, 4);
    const recordType = Object.values(RecordType).includes(typeCode as RecordType)
      ? (typeCode as RecordType)
      : undefined;

    if (recordType) {
      const expected = RECORD_LENGTHS[recordType];
      if (line.length !== expected) {
        errors.push({
          code: 'RECORD_LENGTH_MISMATCH',
          message: `Line ${index + 1}: expected ${expected} characters, got ${line.length}`,
          line: index + 1,
          severity: 'error',
        });
      }
    } else {
      // Data record – accept 100 or 106
      if (line.length !== 100 && line.length !== 106) {
        errors.push({
          code: 'RECORD_LENGTH_MISMATCH',
          message: `Line ${index + 1}: expected data record length of 100 or 106, got ${line.length}`,
          line: index + 1,
          severity: 'error',
        });
      }
    }
  });
}

export function checkRecordOrder(lines: string[], errors: ValidationError[]): void {
  const nonDataTypes: RecordType[] = [];
  lines.forEach(line => {
    const typeCode = line.substring(0, 4);
    if (Object.values(RecordType).includes(typeCode as RecordType)) {
      nonDataTypes.push(typeCode as RecordType);
    }
  });

  const requiredHeader = [RecordType.VOL1, RecordType.HDR1, RecordType.HDR2, RecordType.UHL1];
  for (let i = 0; i < requiredHeader.length; i++) {
    if (nonDataTypes[i] !== requiredHeader[i]) {
      errors.push({
        code: 'RECORD_ORDER',
        message: `Expected ${requiredHeader[i]} at position ${i + 1}, but found ${nonDataTypes[i] || 'none'}`,
        line: i + 1,
        severity: 'error',
      });
    }
  }
  const requiredTrailer = [RecordType.EOF1, RecordType.EOF2, RecordType.UTL1];
  const lastThree = nonDataTypes.slice(-3);
  if (lastThree.join(',') !== requiredTrailer.join(',')) {
    errors.push({
      code: 'RECORD_ORDER',
      message: `Trailer records must be ${requiredTrailer.join(' > ')} in order`,
      line: lines.length - 2,
      severity: 'error',
    });
  }
}

// Helper to validate a record against specs
function validateRecord(record: Record<string, string>, specs: FieldSpec[], line: number, prefix: string, errors: ValidationError[]): void {
  for (const spec of specs) {
    const rawValue = record[spec.name] || '';
    if (spec.required && rawValue.trim() === '') {
      errors.push({
        code: 'FIELD_REQUIRED',
        message: `${prefix} field "${spec.name}" is required`,
        line,
        field: spec.name,
        severity: 'error',
      });
    }
    if (spec.allowedValues && !spec.allowedValues.includes(rawValue)) {
      errors.push({
        code: 'FIELD_INVALID_VALUE',
        message: `${prefix} field "${spec.name}" has invalid value "${rawValue}"`,
        line,
        field: spec.name,
        severity: 'error',
      });
    }

    // Generic custom validators based on field type/name
    if (spec.type === 'date') {
      const dateErr = validateJulianDate(rawValue);
      if (dateErr) errors.push({ code: 'INVALID_DATE', message: `${prefix}: ${dateErr}`, line, field: spec.name, severity: 'error' });
    }
    if (spec.name.toLowerCase().includes('sortcode')) {
      const sortErr = validateSortCode(rawValue);
      if (sortErr) errors.push({ code: 'INVALID_SORT_CODE', message: `${prefix}: ${sortErr}`, line, field: spec.name, severity: 'error' });
    }
    if (spec.name.toLowerCase().includes('accountnumber')) {
      const accErr = validateAccountNumber(rawValue);
      if (accErr) errors.push({ code: 'INVALID_ACCOUNT', message: `${prefix}: ${accErr}`, line, field: spec.name, severity: 'error' });
    }
    if (spec.name === 'amount') {
      const amtErr = validateAmount(rawValue);
      if (amtErr) errors.push({ code: 'INVALID_AMOUNT', message: `${prefix}: ${amtErr}`, line, field: spec.name, severity: 'error' });
    }
    if (spec.name === 'sun') {
      const sunErr = validateSun(rawValue);
      if (sunErr) errors.push({ code: 'INVALID_SUN', message: `${prefix}: ${sunErr}`, line, field: spec.name, severity: 'error' });
    }
  }
}

export function checkFieldValidators(bacsFile: BacsFile, errors: ValidationError[]): void {
  validateRecord(bacsFile.vol1 as unknown as Record<string, string>, VOL1_FIELD_SPECS, 1, 'VOL1', errors);
  validateRecord(bacsFile.hdr1 as unknown as Record<string, string>, HDR1_FIELD_SPECS, 2, 'HDR1', errors);
  validateRecord(bacsFile.hdr2 as unknown as Record<string, string>, HDR2_FIELD_SPECS, 3, 'HDR2', errors);
  validateRecord(bacsFile.uhl1 as unknown as Record<string, string>, UHL1_FIELD_SPECS, 4, 'UHL1', errors);

  const dataSpecs = bacsFile.dataRecordLength === 100 ? DATA_FIELD_SPECS_100 : DATA_FIELD_SPECS_106;
  bacsFile.transactions.forEach((txn, idx) => {
    validateRecord(txn as unknown as Record<string, string>, dataSpecs, 5 + idx, `TX[${idx+1}]`, errors);
  });

  const trailerStart = 5 + bacsFile.transactions.length;
  validateRecord(bacsFile.eof1 as unknown as Record<string, string>, EOF1_FIELD_SPECS, trailerStart, 'EOF1', errors);
  validateRecord(bacsFile.eof2 as unknown as Record<string, string>, EOF2_FIELD_SPECS, trailerStart + 1, 'EOF2', errors);
  validateRecord(bacsFile.utl1 as unknown as Record<string, string>, UTL1_FIELD_SPECS, trailerStart + 2, 'UTL1', errors);
}

export function checkBusinessRules(
  bacsFile: BacsFile,
  errors: ValidationError[],
  warnings: ValidationWarning[],
  summary: ValidationSummary,
): void {
  summary.payments = bacsFile.transactions.length;
  summary.currency = 'GBP'; // or from UHL1 if available
  summary.processingDate = bacsFile.uhl1.processingDate || '';
  summary.originator = ''; // not directly available in new UHL1
  summary.recordCount = 0; // filled elsewhere

  // UTL1 totals
  const totalDebitCount = parseInt(bacsFile.utl1.totalDebitCount || '0', 10);
  const totalCreditCount = parseInt(bacsFile.utl1.totalCreditCount || '0', 10);
  const totalDebitAmount = parseInt(bacsFile.utl1.totalDebitAmount || '0', 10);
  const totalCreditAmount = parseInt(bacsFile.utl1.totalCreditAmount || '0', 10);

  let actualDebits = 0, actualCredits = 0, sumDebits = 0, sumCredits = 0;
  bacsFile.transactions.forEach(txn => {
    const amount = parseInt(txn.amount, 10);
    if (txn.transactionCode === TransactionCode.DEBIT) {
      actualDebits++;
      sumDebits += amount;
    } else if (txn.transactionCode === TransactionCode.CREDIT) {
      actualCredits++;
      sumCredits += amount;
    }
  });

  if (actualDebits !== totalDebitCount || sumDebits !== totalDebitAmount) {
    errors.push({
      code: 'UTL_DEBIT_MISMATCH',
      message: 'Debit totals in UTL1 do not match computed values',
      line: 0,
      severity: 'error',
    });
  }
  if (actualCredits !== totalCreditCount || sumCredits !== totalCreditAmount) {
    errors.push({
      code: 'UTL_CREDIT_MISMATCH',
      message: 'Credit totals in UTL1 do not match computed values',
      line: 0,
      severity: 'error',
    });
  }

  // Additional business checks
  checkConsistency(bacsFile, errors, warnings);
  checkDuplicates(bacsFile, warnings);
  checkFieldWarnings(bacsFile, warnings);
  checkContra(bacsFile, warnings);

  // Duplicate references (keep)
  const seenRefs = new Set<string>();
  bacsFile.transactions.forEach(txn => {
    const ref = txn.reference.trim();
    if (ref && seenRefs.has(ref)) {
      warnings.push({
        code: 'DUPLICATE_REFERENCE',
        message: `Duplicate reference: ${ref}`,
        line: 0,
        severity: 'warning',
      });
    } else if (ref) {
      seenRefs.add(ref);
    }
  });
  summary.duplicateReferences = bacsFile.transactions.length - seenRefs.size;
}