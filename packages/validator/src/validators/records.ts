import { ValidationError } from '@standard18/shared';
import { RECORD_LENGTHS, RecordType, REQUIRED_HEADER_ORDER, REQUIRED_TRAILER_ORDER } from '@standard18/shared';

/**
 * Checks that each line matches the expected length for its record type.
 */
export function checkRecordLengths(lines: string[], errors: ValidationError[]): void {
  lines.forEach((line, index) => {
    const typeCode = line.substring(0, 4);
    let expectedLength: number | undefined;

    // Determine record type by first 4 chars
    if (typeCode === RecordType.VOL1) expectedLength = RECORD_LENGTHS[RecordType.VOL1];
    else if (typeCode === RecordType.HDR1) expectedLength = RECORD_LENGTHS[RecordType.HDR1];
    else if (typeCode === RecordType.HDR2) expectedLength = RECORD_LENGTHS[RecordType.HDR2];
    else if (typeCode === RecordType.UHL1) expectedLength = RECORD_LENGTHS[RecordType.UHL1];
    else if (typeCode === RecordType.EOF1) expectedLength = RECORD_LENGTHS[RecordType.EOF1];
    else if (typeCode === RecordType.EOF2) expectedLength = RECORD_LENGTHS[RecordType.EOF2];
    else if (typeCode === RecordType.UTL1) expectedLength = RECORD_LENGTHS[RecordType.UTL1];
    // Data records don't have a type label; we assume any line not matching the above is a data record.
    else expectedLength = RECORD_LENGTHS[RecordType.DATA];

    if (expectedLength !== undefined && line.length !== expectedLength) {
      errors.push({
        code: 'RECORD_LENGTH_MISMATCH',
        message: `Line ${index + 1} (type ${typeCode}): expected ${expectedLength} characters, got ${line.length}`,
        line: index + 1,
        severity: 'error',
      });
    }
  });
}

/**
 * Checks that the mandatory header and trailer records appear in the correct order.
 */
export function checkRecordOrder(lines: string[], errors: ValidationError[]): void {
  // Extract record types ignoring data lines
  const nonDataTypes: RecordType[] = [];
  lines.forEach(line => {
    const typeCode = line.substring(0, 4);
    if (Object.values(RecordType).includes(typeCode as RecordType)) {
      nonDataTypes.push(typeCode as RecordType);
    }
  });

  // Header order
  for (let i = 0; i < REQUIRED_HEADER_ORDER.length; i++) {
    const expected = REQUIRED_HEADER_ORDER[i];
    if (nonDataTypes[i] !== expected) {
      errors.push({
        code: 'RECORD_ORDER',
        message: `Expected ${expected} at position ${i + 1}, but found ${nonDataTypes[i] || 'none'}`,
        line: i + 1,
        severity: 'error',
      });
    }
  }

  // Trailer order (should be at the end, after data lines)
  const lastThree = nonDataTypes.slice(-3);
  if (lastThree.join(',') !== REQUIRED_TRAILER_ORDER.join(',')) {
    errors.push({
      code: 'RECORD_ORDER',
      message: `Trailer records must be ${REQUIRED_TRAILER_ORDER.join(' > ')} in order`,
      line: lines.length - 2,
      severity: 'error',
    });
  }
}