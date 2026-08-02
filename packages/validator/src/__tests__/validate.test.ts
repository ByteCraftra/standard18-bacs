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
    // A happy path test later with a fully populated file; for now we just check it doesn't crash
    const fileContent = [
      'VOL1                         0001                                             ',
      'HDR1A                      0001                                             ',
      'HDR2S                      0001                                             ',
      'UHL1 0000000 000000                                                         ',
      '010039123456789012       0000000000990001GBP                                 ',
      'EOF1A                      0001                                             ',
      'EOF2S                      0001                                             ',
      'UTL1                         0001                                             ',
    ].join('\n');
    const result = validate(fileContent);
    // Our current validators only check lengths and order; should be no errors
    expect(result.errors).toHaveLength(0);
  });

  it('should detect a record length mismatch', () => {
    const fileContent = 'VOL1 short\n';
    const result = validate(fileContent);
    expect(result.errors.some(e => e.code === 'RECORD_LENGTH_MISMATCH')).toBe(true);
  });
});