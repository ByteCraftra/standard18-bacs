import { describe, it, expect } from 'vitest';
import { BacsFile, RecordType } from '@standard18/shared';
import { analyze } from '../analyzer';

function createMockBacsFile(): BacsFile {
  return {
    dataRecordLength: 100,
    vol1: {
      type: RecordType.VOL1,
      label: 'VOL1',
      serialNumber: '174666',
      accessibility: ' ',
      reserved1: ' '.repeat(26),
      reserved2: '    ',
      sun: '098765',
      reserved3: '    ',
      reserved4: ' '.repeat(28),
      format: '1',
    },
    hdr1: {
      type: RecordType.HDR1,
      label: 'HDR1',
      fileIdentifier: 'A',
      sun: '098765',
      fileIdentifier2: 'S',
      reserved1: '  ',
      reserved2: ' ',
      reserved3: '      ',
      serialNumber: '174666',
      fileSectionNumber: '0001',
      fileSequenceNumber: '0001',
      generationNumber: '    ',
      generationVersion: '  ',
      creationDate: ' 26226',
      expirationDate: ' 26257',
      accessibility: ' ',
      blockCount: '000000',
      systemCode: ' '.repeat(13),
      reserved4: ' '.repeat(7),
    },
    hdr2: {
      type: RecordType.HDR2,
      label: 'HDR2',
      format: 'F',
      blockLength: '02000',
      recordLength: '00100',
      reserved1: ' '.repeat(35),
      bufferOffset: '00',
      reserved2: ' '.repeat(28),
    },
    uhl1: {
      type: RecordType.UHL1,
      label: 'UHL1',
      processingDate: ' 26229',
      reserved1: ' '.repeat(10),
      currencyCode: '00',
      countryCode: '000000',
      workCode: '1 DAILY  ',
      fileNumber: '910',
      reserved2: ' '.repeat(7),
      auditPrintIdentifier: ' '.repeat(7),
      userBureau: ' '.repeat(26),
    },
    transactions: [
      {
        type: RecordType.DATA,
        destinationSortCode: '123878',
        destinationAccountNumber: '11990278',
        typeOfAccount: '0',
        transactionCode: '99',
        originatorSortCode: '345678',
        originatorAccountNumber: '09876543',
        freeFormat: '    ',
        amount: '00000070000',
        originatorName: 'AC LTD',
        reference: 'AC-1231',
        destinationName: 'SURGEON 1',
        processingDate: ' 26229',
      },
      {
        type: RecordType.DATA,
        destinationSortCode: '345678',
        destinationAccountNumber: '09876543',
        typeOfAccount: '0',
        transactionCode: '17',
        originatorSortCode: '345678',
        originatorAccountNumber: '09876543',
        freeFormat: '    ',
        amount: '00000070000',
        originatorName: '',
        reference: 'CONTRA',
        destinationName: 'AC LTD',
        processingDate: ' 26229',
      },
    ],
    eof1: {
      type: RecordType.EOF1,
      label: 'EOF1',
      fileIdentifier: 'A',
      sun: '098765',
      fileIdentifier2: 'S',
      reserved1: '  ',
      reserved2: ' ',
      reserved3: '      ',
      serialNumber: '174666',
      fileSectionNumber: '0001',
      fileSequenceNumber: '0001',
      generationNumber: '    ',
      generationVersion: '  ',
      creationDate: ' 26226',
      expirationDate: ' 26257',
      accessibility: ' ',
      blockCount: '      ',
      systemCode: ' '.repeat(13),
      reserved4: ' '.repeat(7),
    },
    eof2: {
      type: RecordType.EOF2,
      label: 'EOF2',
      format: 'F',
      blockLength: '02000',
      recordLength: '00100',
      reserved1: ' '.repeat(35),
      bufferOffset: '00',
      reserved2: ' '.repeat(28),
    },
    utl1: {
      type: RecordType.UTL1,
      label: 'UTL1',
      totalDebitAmount: '0000000070000',
      totalCreditAmount: '0000000070000',
      totalDebitCount: '0000001',
      totalCreditCount: '0000001',
      reserved1: ' '.repeat(10),
      reserved2: ' '.repeat(26),
    },
  };
}

describe('analyze', () => {
  it('should compute correct totals from BacsFile', () => {
    const result = analyze(createMockBacsFile());

    expect(result.payments.totalCount).toBe(2);
    expect(result.payments.creditCount).toBe(1);
    expect(result.payments.debitCount).toBe(1);
    expect(result.payments.creditAmount).toBe(70000);
    expect(result.payments.debitAmount).toBe(70000);
    expect(result.payments.totalAmount).toBe(70000);
    expect(result.payments.averageAmount).toBe(70000);
  });

  it('should identify duplicate references and duplicate amount+account', () => {
    const file = createMockBacsFile();
    file.transactions.push({
      ...file.transactions[0],
      type: RecordType.DATA,
      reference: 'AC-1231', // same reference as transaction[0]
    });
    const result = analyze(file);
    expect(result.duplicates.duplicateReferences).toContain('AC-1231');
    expect(result.duplicates.duplicateAmountAccount.length).toBeGreaterThan(0);
  });

  it('should generate LARGE_PAYMENT warning for amounts above £1,000,000', () => {
    const file = createMockBacsFile();
    // 100-byte amounts are 11 digits. 100,000,100 pence = £1,000,001.00
    // → strictly greater than the £1,000,000 (100,000,000 pence) threshold.
    file.transactions[0].amount = '00100000100';
    const result = analyze(file);
    if (!result.warnings.some(w => w.code === 'LARGE_PAYMENT')) {
      console.log('warnings:', JSON.stringify(result.warnings, null, 2));
    }
    expect(result.warnings.some(w => w.code === 'LARGE_PAYMENT')).toBe(true);
  });
});