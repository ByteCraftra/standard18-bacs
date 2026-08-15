import { RecordType, TransactionCode, CurrencyCode, WorkCode } from './types';

export interface FieldSpec {
  name: string;
  start: number; // 0-based index
  length: number;
  type: 'string' | 'number' | 'date' | 'code';
  required?: boolean;
  allowedValues?: readonly string[];
  padChar?: string;
  padSide?: 'left' | 'right';
  description?: string;
  validator?: (value: string) => string | null;
}

// --- VOL1 (80 bytes) ---
export const VOL1_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['VOL1'] },
  { name: 'serialNumber', start: 4, length: 6, type: 'string', required: true },
  { name: 'accessibility', start: 10, length: 1, type: 'string' },
  { name: 'reserved1', start: 11, length: 26, type: 'string' },
  { name: 'reserved2', start: 37, length: 4, type: 'string' },
  { name: 'sun', start: 41, length: 6, type: 'string', required: true },
  { name: 'reserved3', start: 47, length: 4, type: 'string' },
  { name: 'reserved4', start: 51, length: 28, type: 'string' },
  { name: 'format', start: 79, length: 1, type: 'string', allowedValues: ['1'] },
];

// --- HDR1 (80 bytes) ---
export const HDR1_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['HDR1'] },
  { name: 'fileIdentifier', start: 4, length: 1, type: 'string', allowedValues: ['A'] },
  { name: 'sun', start: 5, length: 6, type: 'string', required: true },
  { name: 'fileIdentifier2', start: 11, length: 1, type: 'string', allowedValues: ['S'] },
  { name: 'reserved1', start: 12, length: 2, type: 'string' },
  { name: 'reserved2', start: 14, length: 1, type: 'string' },
  { name: 'reserved3', start: 15, length: 6, type: 'string' },
  { name: 'serialNumber', start: 21, length: 6, type: 'string', required: true },
  { name: 'fileSectionNumber', start: 27, length: 4, type: 'string', required: true },
  { name: 'fileSequenceNumber', start: 31, length: 4, type: 'string', required: true },
  { name: 'generationNumber', start: 35, length: 4, type: 'string' },
  { name: 'generationVersion', start: 39, length: 2, type: 'string' },
  { name: 'creationDate', start: 41, length: 6, type: 'date', required: true },
  { name: 'expirationDate', start: 47, length: 6, type: 'date', required: true },
  { name: 'accessibility', start: 53, length: 1, type: 'string' },
  { name: 'blockCount', start: 54, length: 6, type: 'string' },
  { name: 'systemCode', start: 60, length: 13, type: 'string' },
  { name: 'reserved4', start: 73, length: 7, type: 'string' },
];

// --- HDR2 (80 bytes) ---
export const HDR2_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['HDR2'] },
  { name: 'format', start: 4, length: 1, type: 'string', allowedValues: ['F'] },
  { name: 'blockLength', start: 5, length: 5, type: 'string', required: true },
  { name: 'recordLength', start: 10, length: 5, type: 'string', required: true, allowedValues: ['00100'] },
  { name: 'reserved1', start: 15, length: 35, type: 'string' },
  { name: 'bufferOffset', start: 50, length: 2, type: 'string' },
  { name: 'reserved2', start: 52, length: 28, type: 'string' },
];

// --- UHL1 (80 bytes) ---
export const UHL1_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['UHL1'] },
  { name: 'processingDate', start: 4, length: 6, type: 'date', required: true },
  { name: 'reserved1', start: 10, length: 10, type: 'string' },
  { name: 'currencyCode', start: 20, length: 2, type: 'string', allowedValues: ['00'] },
  { name: 'countryCode', start: 22, length: 6, type: 'string', required: true },
  { name: 'workCode', start: 28, length: 9, type: 'string', required: true },
  { name: 'fileNumber', start: 37, length: 3, type: 'string', required: true },
  { name: 'reserved2', start: 40, length: 7, type: 'string' },
  { name: 'auditPrintIdentifier', start: 47, length: 7, type: 'string' },
  { name: 'userBureau', start: 54, length: 26, type: 'string' },
];

// --- EOF1 (80 bytes) – Same structure as HDR1 but with label EOF1 ---
export const EOF1_FIELD_SPECS: FieldSpec[] = HDR1_FIELD_SPECS.map(spec => ({
  ...spec,
  name: spec.name === 'label' ? 'label' : spec.name,
  allowedValues: spec.name === 'label' ? ['EOF1'] : spec.allowedValues,
}));

// --- EOF2 (80 bytes) – Same structure as HDR2 but with label EOF2 ---
export const EOF2_FIELD_SPECS: FieldSpec[] = HDR2_FIELD_SPECS.map(spec => ({
  ...spec,
  name: spec.name === 'label' ? 'label' : spec.name,
  allowedValues: spec.name === 'label' ? ['EOF2'] : spec.allowedValues,
}));

// --- UTL1 (80 bytes) ---
export const UTL1_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['UTL1'] },
  { name: 'totalDebitAmount', start: 4, length: 13, type: 'number', required: true },
  { name: 'totalCreditAmount', start: 17, length: 13, type: 'number', required: true },
  { name: 'totalDebitCount', start: 30, length: 7, type: 'number', required: true },
  { name: 'totalCreditCount', start: 37, length: 7, type: 'number', required: true },
  { name: 'reserved1', start: 44, length: 10, type: 'string' },
  { name: 'reserved2', start: 54, length: 26, type: 'string' },
];

// --- Data Record (100 bytes) ---
export const DATA_FIELD_SPECS_100: FieldSpec[] = [
  { name: 'destinationSortCode', start: 0, length: 6, type: 'string', required: true },
  { name: 'destinationAccountNumber', start: 6, length: 8, type: 'string', required: true },
  { name: 'typeOfAccount', start: 14, length: 1, type: 'string', required: true },
  { name: 'transactionCode', start: 15, length: 2, type: 'code', allowedValues: Object.values(TransactionCode) },
  { name: 'originatorSortCode', start: 17, length: 6, type: 'string', required: true },
  { name: 'originatorAccountNumber', start: 23, length: 8, type: 'string', required: true },
  { name: 'freeFormat', start: 31, length: 4, type: 'string' },
  { name: 'amount', start: 35, length: 11, type: 'number', required: true },
  { name: 'originatorName', start: 46, length: 18, type: 'string' },
  { name: 'reference', start: 64, length: 18, type: 'string' },
  { name: 'destinationName', start: 82, length: 18, type: 'string' },
];

// Keep a placeholder for 106-byte records (unused in current files)
export const DATA_FIELD_SPECS_106: FieldSpec[] = DATA_FIELD_SPECS_100; // will be replaced if needed