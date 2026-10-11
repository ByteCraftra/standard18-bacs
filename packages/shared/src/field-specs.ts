import { TransactionCode } from './types';

export interface FieldSpec {
  name: string;
  start: number; // 0-based index
  length: number;
  type: 'string' | 'number' | 'date' | 'code';
  required?: boolean;
  allowedValues?: readonly string[];
  padChar?: string; // character used for padding
  padSide?: 'left' | 'right'; // which side to pad
  description?: string;
  validator?: (value: string) => string | null;
}

// --- VOL1 ---
export const VOL1_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['VOL1'], padSide: 'right', padChar: ' ' },
  { name: 'serialNumber', start: 4, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'accessibility', start: 10, length: 1, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'reserved1', start: 11, length: 26, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'reserved2', start: 37, length: 4, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'sun', start: 41, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'reserved3', start: 47, length: 4, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'reserved4', start: 51, length: 28, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'format', start: 79, length: 1, type: 'string', allowedValues: ['1'], padSide: 'right', padChar: ' ' },
];

// --- HDR1 ---
export const HDR1_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['HDR1'], padSide: 'right', padChar: ' ' },
  { name: 'fileIdentifier', start: 4, length: 1, type: 'string', allowedValues: ['A'], padSide: 'right', padChar: ' ' },
  { name: 'sun', start: 5, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'fileIdentifier2', start: 11, length: 1, type: 'string', allowedValues: ['S'], padSide: 'right', padChar: ' ' },
  { name: 'reserved1', start: 12, length: 2, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'reserved2', start: 14, length: 1, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'reserved3', start: 15, length: 6, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'serialNumber', start: 21, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'fileSectionNumber', start: 27, length: 4, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'fileSequenceNumber', start: 31, length: 4, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'generationNumber', start: 35, length: 4, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'generationVersion', start: 39, length: 2, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'creationDate', start: 41, length: 6, type: 'date', required: true, padSide: 'left', padChar: ' ' },  // leading space
  { name: 'expirationDate', start: 47, length: 6, type: 'date', required: true, padSide: 'left', padChar: ' ' }, // leading space
  { name: 'accessibility', start: 53, length: 1, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'blockCount', start: 54, length: 6, type: 'string', padSide: 'left', padChar: '0' },
  { name: 'systemCode', start: 60, length: 13, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'reserved4', start: 73, length: 7, type: 'string', padSide: 'right', padChar: ' ' },
];

// --- HDR2 ---
export const HDR2_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['HDR2'], padSide: 'right', padChar: ' ' },
  { name: 'format', start: 4, length: 1, type: 'string', allowedValues: ['F'], padSide: 'right', padChar: ' ' },
  { name: 'blockLength', start: 5, length: 5, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'recordLength', start: 10, length: 5, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'reserved1', start: 15, length: 35, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'bufferOffset', start: 50, length: 2, type: 'string', padSide: 'left', padChar: '0' },
  { name: 'reserved2', start: 52, length: 28, type: 'string', padSide: 'right', padChar: ' ' },
];

// --- UHL1 ---
export const UHL1_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['UHL1'], padSide: 'right', padChar: ' ' },
  { name: 'processingDate', start: 4, length: 6, type: 'date', required: true, padSide: 'left', padChar: ' ' }, // leading space
  { name: 'reserved1', start: 10, length: 10, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'currencyCode', start: 20, length: 2, type: 'string', allowedValues: ['00'], padSide: 'right', padChar: ' ' },
  { name: 'countryCode', start: 22, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'workCode', start: 28, length: 9, type: 'string', required: true, padSide: 'right', padChar: ' ' },
  { name: 'fileNumber', start: 37, length: 3, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'reserved2', start: 40, length: 7, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'auditPrintIdentifier', start: 47, length: 7, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'userBureau', start: 54, length: 26, type: 'string', padSide: 'right', padChar: ' ' },
];

// --- EOF1 (same structure as HDR1 but label different) ---
export const EOF1_FIELD_SPECS: FieldSpec[] = HDR1_FIELD_SPECS.map(spec => ({
  ...spec,
  allowedValues: spec.name === 'label' ? ['EOF1'] : spec.allowedValues,
  padSide: spec.padSide,
  padChar: spec.padChar,
}));

// --- EOF2 (same as HDR2 but label different) ---
export const EOF2_FIELD_SPECS: FieldSpec[] = HDR2_FIELD_SPECS.map(spec => ({
  ...spec,
  allowedValues: spec.name === 'label' ? ['EOF2'] : spec.allowedValues,
  padSide: spec.padSide,
  padChar: spec.padChar,
}));

// --- UTL1 ---
export const UTL1_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['UTL1'], padSide: 'right', padChar: ' ' },
  { name: 'totalDebitAmount', start: 4, length: 13, type: 'number', required: true, padSide: 'left', padChar: '0' },
  { name: 'totalCreditAmount', start: 17, length: 13, type: 'number', required: true, padSide: 'left', padChar: '0' },
  { name: 'totalDebitCount', start: 30, length: 7, type: 'number', required: true, padSide: 'left', padChar: '0' },
  { name: 'totalCreditCount', start: 37, length: 7, type: 'number', required: true, padSide: 'left', padChar: '0' },
  { name: 'reserved1', start: 44, length: 10, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'reserved2', start: 54, length: 26, type: 'string', padSide: 'right', padChar: ' ' },
];

// --- Data Record (100 bytes) ---
export const DATA_FIELD_SPECS_100: FieldSpec[] = [
  { name: 'destinationSortCode', start: 0, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'destinationAccountNumber', start: 6, length: 8, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'typeOfAccount', start: 14, length: 1, type: 'string', required: true, padSide: 'right', padChar: ' ' },
  { name: 'transactionCode', start: 15, length: 2, type: 'code', allowedValues: Object.values(TransactionCode), padSide: 'right', padChar: ' ' },
  { name: 'originatorSortCode', start: 17, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'originatorAccountNumber', start: 23, length: 8, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'freeFormat', start: 31, length: 4, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'amount', start: 35, length: 11, type: 'number', required: true, padSide: 'left', padChar: '0' },
  { name: 'originatorName', start: 46, length: 18, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'reference', start: 64, length: 18, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'destinationName', start: 82, length: 18, type: 'string', padSide: 'right', padChar: ' ' },
];

// --- Data Record (106 bytes, placeholder) ---
export const DATA_FIELD_SPECS_106: FieldSpec[] = DATA_FIELD_SPECS_100; // to be defined later
// -- - END OF FILE ---