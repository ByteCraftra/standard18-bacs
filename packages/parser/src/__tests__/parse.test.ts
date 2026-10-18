import { describe, it, expect } from 'vitest';
import { parse } from '../parse';

describe('parse', () => {
  it('parses a minimal 100-byte BACS file', () => {
    const fileContent = [
      'VOL1174666                               098765                                1',
      'HDR1A098765S         17466600010001       26226 26257 000000                    ',
      'HDR2F0200000100                                   00                            ',
      'UHL1 26229          000000001 DAILY  910                                        ',
      '1238781199027809934567809876543    00000070000AC LTD            AC-1231           SURGEON 1         ',
      '3456780987654301734567809876543    00000070000                  CONTRA            AC LTD            ',
      'EOF1A098765S         17466600010001       26226 26257                           ',
      'EOF2F0200000100                                   00                            ',
      'UTL10000000070000000000007000000000010000001',
    ].join('\n');

    const result = parse(fileContent);

    expect(result.dataRecordLength).toBe(100);
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0].destinationSortCode.trim()).toBe('123878');
    expect(result.transactions[0].transactionCode).toBe('99');
    expect(result.transactions[1].transactionCode).toBe('17');
    expect(result.uhl1.processingDate.trim()).toBe('26229');
  });

  it('propagates UHL1 processing date into 100-byte transactions', () => {
    const fileContent = [
      'VOL1174666                               098765                                1',
      'HDR1A098765S         17466600010001       26226 26257 000000                    ',
      'HDR2F0200000100                                   00                            ',
      'UHL1 26229          000000001 DAILY  910                                        ',
      '1238781199027809934567809876543    00000070000AC LTD            AC-1231           SURGEON 1         ',
      'EOF1A098765S         17466600010001       26226 26257                           ',
      'EOF2F0200000100                                   00                            ',
      'UTL10000000070000000000007000000000010000001',
    ].join('\n');

    const result = parse(fileContent);

    expect(result.dataRecordLength).toBe(100);
    expect(result.transactions[0].processingDate.trim()).toBe('26229');
  });
});