import { describe, it, expect } from 'vitest';
import { validate } from '../validate';

const pad = (s: string, n: number) => s.padEnd(n, ' ');

type FileKind = 'clean' | 'contra-debit' | 'self-credit';

/**
 * Builds a 100-byte Standard-18 BACS file using the current field-spec
 * layout (VOL1/HDR1/HDR2/UHL1 + 100-byte data + EOF1/EOF2/UTL1).
 */
function buildFile(kind: FileKind = 'clean'): string {
  const serial = '174666';
  const sun = '098765';
  const processingDate = ' 26229';
  const creationDate = ' 26226';
  const expirationDate = ' 26257';

  // VOL1 (80): label(4) serial(6) access(1) res1(26) res2(4) sun(6) res3(4) res4(28) format(1)
  const vol1 =
    'VOL1' +
    serial +
    ' ' +
    ' '.repeat(26) +
    ' '.repeat(4) +
    sun +
    ' '.repeat(4) +
    ' '.repeat(28) +
    '1';

  // HDR1 (80): label(4) fileId(1) sun(6) fileId2(1) res1(2) res2(1) res3(6) serial(6)
  //             fileSec(4) fileSeq(4) genNum(4) genVer(2) creationDate(6) expirationDate(6)
  //             access(1) blockCount(6) systemCode(13) res4(7)
  const hdr1 =
    'HDR1' +
    'A' +
    sun +
    'S' +
    '  ' +
    ' ' +
    '      ' +
    serial +
    '0001' +
    '0001' +
    ' '.repeat(4) +
    '  ' +
    creationDate +
    expirationDate +
    ' ' +
    '000000' +
    ' '.repeat(13) +
    ' '.repeat(7);

  // HDR2 (80): label(4) format(1) blockLen(5) recordLen(5) res1(35) bufferOffset(2) res2(28)
  const hdr2 =
    'HDR2' +
    'F' +
    '02000' +
    '00100' +
    ' '.repeat(35) +
    '00' +
    ' '.repeat(28);

  // UHL1 (80): label(4) processingDate(6) res1(10) currencyCode(2) countryCode(6)
  //             workCode(9) fileNumber(3) res2(7) auditPrint(7) userBureau(26)
  const uhl1 =
    'UHL1' +
    processingDate +
    ' '.repeat(10) +
    '00' +
    '000000' +
    '1 DAILY  ' +
    '910' +
    ' '.repeat(7) +
    ' '.repeat(7) +
    ' '.repeat(26);

  // Data (100): destSort(6) destAcct(8) typeOfAcct(1) txnCode(2) origSort(6) origAcct(8)
  //             freeFormat(4) amount(11) origName(18) reference(18) destName(18)
  const credit =
    '123878' +
    '11990278' +
    '0' +
    '99' +
    '345678' +
    '09876543' +
    ' '.repeat(4) +
    '00000070000' +
    pad('AC LTD', 18) +
    pad('AC-1231', 18) +
    pad('SURGEON 1', 18);

  const dataLines: string[] = [credit];
  let totalDebitCount = '0000000';
  let totalDebitAmount = '0000000000000';
  let totalCreditCount = '0000001';
  let totalCreditAmount = '0000000070000';

  if (kind === 'contra-debit') {
    const contra =
      '345678' +
      '09876543' +
      '0' +
      '17' +
      '345678' +
      '09876543' +
      ' '.repeat(4) +
      '00000070000' +
      pad('', 18) +
      pad('CONTRA', 18) +
      pad('AC LTD', 18);
    dataLines.push(contra);
    totalDebitCount = '0000001';
    totalDebitAmount = '0000000070000';
  } else if (kind === 'self-credit') {
    const selfCredit =
      '345678' +
      '09876543' +
      '0' +
      '99' +
      '345678' +
      '09876543' +
      ' '.repeat(4) +
      '00000070000' +
      pad('', 18) +
      pad('SELF CREDIT', 18) +
      pad('AC LTD', 18);
    dataLines.push(selfCredit);
    totalCreditCount = '0000002';
    totalCreditAmount = '0000000140000';
  }

  // EOF1 (80): same layout as HDR1 but label EOF1 and blockCount blank
  const eof1 =
    'EOF1' +
    'A' +
    sun +
    'S' +
    '  ' +
    ' ' +
    '      ' +
    serial +
    '0001' +
    '0001' +
    ' '.repeat(4) +
    '  ' +
    creationDate +
    expirationDate +
    ' ' +
    '      ' +
    ' '.repeat(13) +
    ' '.repeat(7);

  // EOF2 (80): same layout as HDR2 but label EOF2
  const eof2 =
    'EOF2' +
    'F' +
    '02000' +
    '00100' +
    ' '.repeat(35) +
    '00' +
    ' '.repeat(28);

  // UTL1 (80): label(4) debitAmount(13) creditAmount(13) debitCount(7) creditCount(7) res1(10) res2(26)
  const utl1 =
    'UTL1' +
    totalDebitAmount +
    totalCreditAmount +
    totalDebitCount +
    totalCreditCount +
    ' '.repeat(10) +
    ' '.repeat(26);

  return [vol1, hdr1, hdr2, uhl1, ...dataLines, eof1, eof2, utl1].join('\n');
}

describe('validate()', () => {
  it('should flag an empty file', () => {
    const result = validate('');
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('FILE_EMPTY');
  });

  it('should accept a valid 100-byte BACS file', () => {
    const result = validate(buildFile('clean'));
    if (result.errors.length > 0) {
      console.log(JSON.stringify(result.errors, null, 2));
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should emit CONTRA_DEBIT warning for a debit (17) to the originator account', () => {
    const result = validate(buildFile('contra-debit'));
    if (result.errors.length > 0) {
      console.log(JSON.stringify(result.errors, null, 2));
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings.some(w => w.code === 'CONTRA_DEBIT')).toBe(true);
  });

  it('should emit SELF_CREDIT warning for a credit (99) to the originator account', () => {
    const result = validate(buildFile('self-credit'));
    if (result.errors.length > 0) {
      console.log(JSON.stringify(result.errors, null, 2));
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings.some(w => w.code === 'SELF_CREDIT')).toBe(true);
  });

  it('should detect a record length mismatch', () => {
    const result = validate('VOL1 short\n');
    expect(result.errors.some(e => e.code === 'RECORD_LENGTH_MISMATCH')).toBe(true);
  });
});