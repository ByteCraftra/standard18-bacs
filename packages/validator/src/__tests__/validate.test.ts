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
    // console.log(JSON.stringify(result.errors, null, 2));

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect a record length mismatch', () => {
    const fileContent = 'VOL1 short\n';
    const result = validate(fileContent);
    expect(result.errors.some(e => e.code === 'RECORD_LENGTH_MISMATCH')).toBe(true);
  });
});