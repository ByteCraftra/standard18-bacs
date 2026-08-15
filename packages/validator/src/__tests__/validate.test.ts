import { describe, it, expect } from 'vitest';
import { validate } from '../validate';

function padEnd(str: string, len: number) {
  return str.padEnd(len, ' ');
}

describe('validate()', () => {
  it('should flag an empty file', () => {
    const result = validate('');
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('FILE_EMPTY');
  });

  it('should accept a minimal valid BACS file with all business rules', () => {
    const serial = '000001';
    const date = ' 25001'; // YYDDD, 6 digits

    // VOL1: label(4) + serial(6) + accessibility(1) + fileLabel(20) + reserved1(4) +
    //       fileType(1) + reserved2(12) + format(1) + reserved3(31) = 80
    const vol1 = padEnd(
      'VOL1' + serial + ' ' + padEnd('MYFILE', 20) + '    ' + '0' + '            ' + 'S',
      80
    );

    // HDR1: label(4) + fileId(1) + serial(6) + processingDate(6) + reserved1(1) +
    //       fileNumber(6) + reserved2(56) = 80
    const hdr1 = padEnd('HDR1A' + serial + date + ' ' + '123456', 80);

    // HDR2: label(4) + fileId(1) + serial(6) + workCode(1) + reserved1(68) = 80
    const hdr2 = padEnd('HDR2S' + serial + '0', 80);

    // UHL1: label(4) + origSort(6) + reserved1(2) + origAcct(8) + reserved2(2) +
    //       origName(18) + reserved3(4) + procDate(6) + reserved4(6) + currency(3) +
    //       reserved5(21) = 80
    const uhl1 = padEnd(
      'UHL1' +
      '123456' +            // origSort
      '  ' +                // reserved1
      '12345678' +          // origAcct
      '  ' +                // reserved2
      padEnd('MYCOMPANY', 18) + // origName
      '    ' +              // reserved3 (4 spaces)
      date +
      '      ' +            // reserved4 (6 spaces)
      'GBP',
      80
    );

    // Data record: destSort(6) + destAcct(8) + txnCode(2) + amount(13) + origSort(6) +
    //              origAcct(8) + procDate(6) + origName(18) + destName(18) +
    //              ref(18) + sun(3) = 106
    const dataRecord =
      '123456' +                      // dest sort code
      '12345678' +                    // dest account
      '99' +                          // credit
      '0000000000001' +               // 1 pence (13 digits)
      '123456' +                      // orig sort code
      '12345678' +                    // orig account
      date +                          // processing date
      padEnd('COMPANY NAME', 18) +    // orig name
      padEnd('EMPLOYEE NAME', 18) +   // dest name
      padEnd('REF001', 18) +          // reference
      '001';                          // SUN
    const data = padEnd(dataRecord, 106);

    // EOF1: label(4) + fileId(1) + serial(6) + reserved1(9) + totalDebitCount(6) +
    //       totalDebitAmount(13) + totalCreditCount(6) + totalCreditAmount(13) +
    //       reserved2(22) = 80
    const eof1 = padEnd(
      'EOF1A' + serial +
      '         ' +                   // reserved1 (9 spaces)
      '000000' +                     // debit count
      '0000000000000' +              // debit amount (13)
      '000001' +                     // credit count (1)
      '0000000000001' +              // credit amount (1)
      '                      ',       // reserved2 (22) – padEnd will fill
      80
    );

    const eof2 = padEnd(
      'EOF2S' + serial +
      '         ' +
      '000000' +
      '0000000000000' +
      '000001' +
      '0000000000001',
      80
    );

    const utl1 = padEnd('UTL1' + serial, 80);

    const content = [vol1, hdr1, hdr2, uhl1, data, eof1, eof2, utl1].join('\n');
    const result = validate(content);

    // Debug: uncomment to see actual errors
    console.log(JSON.stringify(result.errors, null, 2));

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject a file containing a contra (self-payment) record', () => {
    const serial = '000001';
    const date = ' 25001'; // space + YYDDD (6 chars)

    // Build the same valid file as before, but add one contra record.
    const vol1 = padEnd('VOL1' + serial + ' ' + padEnd('MYFILE', 20) + '    ' + '0' + '            ' + 'S', 80);
    const hdr1 = padEnd('HDR1A' + serial + date + ' ' + '123456', 80);
    const hdr2 = padEnd('HDR2S' + serial + '0', 80);
    const uhl1 = padEnd(
      'UHL1' +
      '123456' + '  ' + '12345678' + '  ' + padEnd('MYCOMPANY', 18) + '    ' + date + '      ' + 'GBP',
      80
    );

    // Create two data records: one normal, one contra (destination == originator)
    const normalRecord =
      '654321' + '87654321' + '99' + '0000000000100' + '123456' + '12345678' + date +
      padEnd('COMPANY NAME', 18) + padEnd('EMPLOYEE NAME', 18) + padEnd('REF002', 18) + '002';

    const contraRecord =
      '123456' + '12345678' + '99' + '0000000000050' + '123456' + '12345678' + date +
      padEnd('COMPANY NAME', 18) + padEnd('SELF PAYMENT', 18) + padEnd('REF003', 18) + '003';

    const data = [normalRecord, contraRecord].map(r => padEnd(r, 106));

    const eof1 = padEnd(
      'EOF1A' + serial + '         ' +
      '000000' + '0000000000000' +
      '000002' + '0000000000150' + '                      ',
      80
    );
    const eof2 = padEnd(
      'EOF2S' + serial + '         ' +
      '000000' + '0000000000000' +
      '000002' + '0000000000150',
      80
    );
    const utl1 = padEnd('UTL1' + serial, 80);

    const content = [vol1, hdr1, hdr2, uhl1, ...data, eof1, eof2, utl1].join('\n');
    const result = validate(content);
    console.log(JSON.stringify(result.errors, null, 2));

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'CONTRA_NOT_ALLOWED')).toBe(true);
    expect(result.errors).toHaveLength(1); // only the contra error (other fields valid)
  });

  it('should warn about contra debit but not reject the file', () => {
    const serial = '000001';
    const date = ' 25001';

    // Build a valid file with two records: one normal credit, one contra debit
    const vol1 = padEnd('VOL1' + serial + ' ' + padEnd('MYFILE', 20) + '    ' + '0' + '            ' + 'S', 80);
    const hdr1 = padEnd('HDR1A' + serial + date + ' ' + '123456', 80);
    const hdr2 = padEnd('HDR2S' + serial + '0', 80);
    const uhl1 = padEnd(
      'UHL1' +
      '123456' + '  ' + '12345678' + '  ' + padEnd('MYCOMPANY', 18) + '    ' + date + '      ' + 'GBP',
      80
    );

    // normal credit (99)
    const normal =
      '654321' + '87654321' + '99' + '0000000000100' + '123456' + '12345678' + date +
      padEnd('COMPANY NAME', 18) + padEnd('EMPLOYEE NAME', 18) + padEnd('REF002', 18) + '002';

    // contra debit (17) to originator
    const contra =
      '123456' + '12345678' + '17' + '0000000000050' + '123456' + '12345678' + date +
      padEnd('COMPANY NAME', 18) + padEnd('CONTRA ENTRY', 18) + padEnd('REF003', 18) + '003';

    const data = [normal, contra].map(r => padEnd(r, 106));

    // EOF totals: 1 credit (100 pence), 1 debit (50 pence)
    const eof1 = padEnd(
      'EOF1A' + serial + '         ' +
      '000001' + '0000000000050' +   // 1 debit, 50
      '000001' + '0000000000100' +   // 1 credit, 100
      '                      ',
      80
    );
    const eof2 = padEnd(
      'EOF2S' + serial + '         ' +
      '000001' + '0000000000050' +
      '000001' + '0000000000100',
      80
    );
    const utl1 = padEnd('UTL1' + serial, 80);

    const content = [vol1, hdr1, hdr2, uhl1, ...data, eof1, eof2, utl1].join('\n');
    const result = validate(content);

    // The file should still be valid (no errors)
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);

    // But we expect exactly one contra warning
    const contraWarnings = result.warnings.filter(w => w.code === 'CONTRA_DEBIT');
    expect(contraWarnings).toHaveLength(1);
  });

  it('should detect a record length mismatch', () => {
    const fileContent = 'VOL1 short\n';
    const result = validate(fileContent);
    expect(result.errors.some(e => e.code === 'RECORD_LENGTH_MISMATCH')).toBe(true);
  });

  it('should accept a valid 100-byte data record file using header date', () => {
    const serial = '000001';
    const date = ' 25001'; // space + YYDDD (6 chars)

    const vol1 = padEnd('VOL1' + serial + ' ' + padEnd('MYFILE', 20) + '    ' + '0' + '            ' + 'S', 80);
    const hdr1 = padEnd('HDR1A' + serial + date + ' ' + '123456', 80);
    const hdr2 = padEnd('HDR2S' + serial + '0', 80);
    const uhl1 = padEnd(
      'UHL1' + '123456' + '  ' + '12345678' + '  ' + padEnd('MYCOMPANY', 18) + '    ' + date + '      ' + 'GBP',
      80
    );

    // 100-byte data record: no processingDate field
    const dataRecord =
      '654321' + '87654321' + '99' + '0000000000100' + '123456' + '12345678' +
      padEnd('COMPANY NAME', 18) + padEnd('EMPLOYEE NAME', 18) + padEnd('REF002', 18) + '002';
    // length should be 100; ensure padEnd if needed
    const data = padEnd(dataRecord, 100);

    // EOF totals: 1 credit, 100 pence
    const eof1 = padEnd(
      'EOF1A' + serial + '         ' +
      '000000' + '0000000000000' +
      '000001' + '0000000000100' + '                      ',
      80
    );
    const eof2 = padEnd(
      'EOF2S' + serial + '         ' +
      '000000' + '0000000000000' +
      '000001' + '0000000000100',
      80
    );
    const utl1 = padEnd('UTL1' + serial, 80);

    const content = [vol1, hdr1, hdr2, uhl1, data, eof1, eof2, utl1].join('\n');
    const result = validate(content);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});