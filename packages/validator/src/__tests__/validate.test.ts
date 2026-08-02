import { describe, it, expect } from 'vitest';
import { validate } from '../validate';

describe('validate()', () => {
  it('should flag an empty file', () => {
    const result = validate('');
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('FILE_EMPTY');
  });

  it('should accept a minimal valid BACS file (skeleton)', () => {
    // Build lines with exact required lengths:
    // control records = 80 characters, data record = 106 characters
    const vol1 = 'VOL1'.padEnd(80, ' ');
    const hdr1 = 'HDR1'.padEnd(80, ' ');
    const hdr2 = 'HDR2'.padEnd(80, ' ');
    const uhl1 = 'UHL1'.padEnd(80, ' ');
    const data = '010039123456789012       0000000000990001GBP'.padEnd(106, ' ');
    const eof1 = 'EOF1'.padEnd(80, ' ');
    const eof2 = 'EOF2'.padEnd(80, ' ');
    const utl1 = 'UTL1'.padEnd(80, ' ');

    const fileContent = [vol1, hdr1, hdr2, uhl1, data, eof1, eof2, utl1].join('\n');
    const result = validate(fileContent);

    // Should have no errors now
    expect(result.errors).toHaveLength(0);
  });

  it('should detect a record length mismatch', () => {
    const fileContent = 'VOL1 short\n';
    const result = validate(fileContent);
    expect(result.errors.some(e => e.code === 'RECORD_LENGTH_MISMATCH')).toBe(true);
  });
});