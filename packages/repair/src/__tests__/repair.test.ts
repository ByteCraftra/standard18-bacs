import { describe, it, expect } from 'vitest';
import { repair } from '../repair';

describe('repair', () => {
  it('should fix padding and lengths in a valid 100-byte file', () => {
    const input = [
      'VOL1174666                               098765                                1',
      'HDR1A098765S         17466600010001       26226 26257 000000                    ',
      'HDR2F0200000100                                   00                            ',
      'UHL1 26229          000000001 DAILY  910                                        ',
      '1238781199027809934567809876543    00000070000AC LTD            AC-1231           SURGEON 1         ',
      '3456780987654301734567809876543    00000070000                  CONTRA            AC LTD            ',
      'EOF1A098765S         17466600010001       26226 26257                           ',
      'EOF2F0200000100                                   00                            ',
      'UTL10000000070000000000007000000000010000001'
    ].join('\n');

    const result = repair(input);
    const lines = result.content.split('\n');

    // Check lengths
    expect(lines[0].length).toBe(80);
    expect(lines[1].length).toBe(80);
    expect(lines[2].length).toBe(80);
    expect(lines[3].length).toBe(80);
    expect(lines[4].length).toBe(100);
    expect(lines[5].length).toBe(100);
    expect(lines[6].length).toBe(80);
    expect(lines[7].length).toBe(80);
    expect(lines[8].length).toBe(80);
  });

  it('should pad short lines to correct length', () => {
    const input = 'VOL1174666';
    const result = repair(input);
    expect(result.content.length).toBe(80);
  });
});