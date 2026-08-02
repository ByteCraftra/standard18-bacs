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

  it('should accept a minimal valid BACS file', () => {
    const vol1 = padEnd('VOL1000001              MYFILE              0           S', 80);
    const hdr1 = padEnd('HDR1A00000125001123456', 80);
    const hdr2 = padEnd('HDR2S0000010', 80);
    const uhl1 = padEnd('UHL1123456  12345678  MYCOMPANY          250011GBP', 80);
    // Data record: one credit transaction
    const data = '12345612345678990000000000123456123456123456250011COMPANY NAME       EMPLOYEE NAME       REF001             001';
    const dataPadded = padEnd(data, 106);
    // EOF totals: 1 credit, 0 debits, amount 1 pence? Actually amount is 13 digits, zero-filled. We set 1 credit with amount 1 pence.
    const eof1 = padEnd('EOF1A000001         000000000000000000001000000000000001', 80);
    const eof2 = padEnd('EOF2S000001         000000000000000000001000000000000001', 80);
    const utl1 = padEnd('UTL1000001', 80);

    const content = [vol1, hdr1, hdr2, uhl1, dataPadded, eof1, eof2, utl1].join('\n');
    const result = validate(content);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect a record length mismatch', () => {
    const fileContent = 'VOL1 short\n';
    const result = validate(fileContent);
    expect(result.errors.some(e => e.code === 'RECORD_LENGTH_MISMATCH')).toBe(true);
  });
});