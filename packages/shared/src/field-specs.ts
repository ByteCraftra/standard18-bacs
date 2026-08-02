import { RecordType, TransactionCode, CurrencyCode, WorkCode } from './types';

export interface FieldSpec {
  name: string;
  start: number; // 0-based index
  length: number;
  type: 'string' | 'number' | 'date' | 'code';
  required?: boolean;
  allowedValues?: readonly string[];
  padChar?: string; // expected padding character
  padSide?: 'left' | 'right';
  description?: string;
  validator?: (value: string) => string | null; // returns error message or null
}

// --- VOL1 ---
export const VOL1_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['VOL1'], padSide: 'right', padChar: ' ', description: 'Must be VOL1' },
  { name: 'serialNumber', start: 4, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0', description: 'File serial number (000001-999999)' },
  { name: 'accessibility', start: 10, length: 1, type: 'code', allowedValues: [' ', 'A', 'B'], padSide: 'right', padChar: ' ', description: 'Accessibility indicator' },
  { name: 'fileLabel', start: 11, length: 20, type: 'string', required: true, padSide: 'right', padChar: ' ', description: 'User‑defined file label' },
  { name: 'reserved1', start: 31, length: 4, type: 'string', padSide: 'right', padChar: ' ', description: 'Reserved' },
  { name: 'fileType', start: 35, length: 1, type: 'code', allowedValues: ['0', '1'], padSide: 'right', padChar: ' ', description: 'File type (0=production, 1=test)' },
  { name: 'reserved2', start: 36, length: 12, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'format', start: 48, length: 1, type: 'code', allowedValues: ['S'], padSide: 'right', padChar: ' ', description: 'Standard format indicator' },
  { name: 'reserved3', start: 49, length: 31, type: 'string', padSide: 'right', padChar: ' ' },
];

// --- HDR1 ---
export const HDR1_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['HDR1'] },
  { name: 'fileIdentifier', start: 4, length: 1, type: 'code', allowedValues: ['A'], description: 'File identifier A' },
  { name: 'serialNumber', start: 5, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'processingDate', start: 11, length: 6, type: 'date', required: true, description: 'YYDDD' },
  { name: 'reserved1', start: 17, length: 1, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'fileNumber', start: 18, length: 6, type: 'string', padSide: 'left', padChar: '0', description: 'File number' },
  { name: 'reserved2', start: 24, length: 56, type: 'string', padSide: 'right', padChar: ' ' },
];

// --- HDR2 ---
export const HDR2_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['HDR2'] },
  { name: 'fileIdentifier', start: 4, length: 1, type: 'code', allowedValues: ['S'], description: 'File identifier S' },
  { name: 'serialNumber', start: 5, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'workCode', start: 11, length: 1, type: 'code', allowedValues: ['0', '1', ' '], padSide: 'right', padChar: ' ', description: 'Work code (0=live, 1=test)' },
  { name: 'reserved1', start: 12, length: 68, type: 'string', padSide: 'right', padChar: ' ' },
];

// --- UHL1 ---
export const UHL1_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['UHL1'] },
  { name: 'originatorSortCode', start: 4, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'reserved1', start: 10, length: 2, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'originatorAccountNumber', start: 12, length: 8, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'reserved2', start: 20, length: 2, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'originatorName', start: 22, length: 18, type: 'string', padSide: 'right', padChar: ' ', description: 'Originator name' },
  { name: 'reserved3', start: 40, length: 4, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'processingDate', start: 44, length: 6, type: 'date', required: true },
  { name: 'reserved4', start: 50, length: 6, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'currency', start: 56, length: 3, type: 'code', allowedValues: ['GBP', 'EUR', 'USD'], padSide: 'right', padChar: ' ' },
  { name: 'reserved5', start: 59, length: 21, type: 'string', padSide: 'right', padChar: ' ' },
];

// --- Data Record ---
export const DATA_FIELD_SPECS: FieldSpec[] = [
  { name: 'destinationSortCode', start: 0, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'destinationAccountNumber', start: 6, length: 8, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'transactionCode', start: 14, length: 2, type: 'code', allowedValues: Object.values(TransactionCode), padSide: 'right', padChar: ' ' },
  { name: 'amount', start: 16, length: 13, type: 'number', required: true, padSide: 'left', padChar: '0', description: 'In pence, zero‑filled' },
  { name: 'originatorSortCode', start: 29, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'originatorAccountNumber', start: 35, length: 8, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'processingDate', start: 43, length: 6, type: 'date', required: true },
  { name: 'originatorName', start: 49, length: 18, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'destinationName', start: 67, length: 18, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'reference', start: 85, length: 18, type: 'string', padSide: 'right', padChar: ' ', description: 'Payment reference' },
  { name: 'sun', start: 103, length: 3, type: 'string', required: true, padSide: 'left', padChar: '0', description: 'Service User Number (SUN)' },
];

// --- EOF1 ---
export const EOF1_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['EOF1'] },
  { name: 'fileIdentifier', start: 4, length: 1, type: 'code', allowedValues: ['A'] },
  { name: 'serialNumber', start: 5, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'reserved1', start: 11, length: 9, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'totalDebitCount', start: 20, length: 6, type: 'number', required: true, padSide: 'left', padChar: '0' },
  { name: 'totalDebitAmount', start: 26, length: 13, type: 'number', required: true, padSide: 'left', padChar: '0' },
  { name: 'totalCreditCount', start: 39, length: 6, type: 'number', required: true, padSide: 'left', padChar: '0' },
  { name: 'totalCreditAmount', start: 45, length: 13, type: 'number', required: true, padSide: 'left', padChar: '0' },
  { name: 'reserved2', start: 58, length: 22, type: 'string', padSide: 'right', padChar: ' ' },
];

// --- EOF2 ---
export const EOF2_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['EOF2'] },
  { name: 'fileIdentifier', start: 4, length: 1, type: 'code', allowedValues: ['S'] },
  { name: 'serialNumber', start: 5, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'reserved1', start: 11, length: 9, type: 'string', padSide: 'right', padChar: ' ' },
  { name: 'totalDebitCount', start: 20, length: 6, type: 'number', required: true, padSide: 'left', padChar: '0' },
  { name: 'totalDebitAmount', start: 26, length: 13, type: 'number', required: true, padSide: 'left', padChar: '0' },
  { name: 'totalCreditCount', start: 39, length: 6, type: 'number', required: true, padSide: 'left', padChar: '0' },
  { name: 'totalCreditAmount', start: 45, length: 13, type: 'number', required: true, padSide: 'left', padChar: '0' },
  { name: 'reserved2', start: 58, length: 22, type: 'string', padSide: 'right', padChar: ' ' },
];

// --- UTL1 ---
export const UTL1_FIELD_SPECS: FieldSpec[] = [
  { name: 'label', start: 0, length: 4, type: 'string', allowedValues: ['UTL1'] },
  { name: 'serialNumber', start: 4, length: 6, type: 'string', required: true, padSide: 'left', padChar: '0' },
  { name: 'reserved1', start: 10, length: 70, type: 'string', padSide: 'right', padChar: ' ' },
];