export enum RecordType {
  VOL1 = 'VOL1',
  HDR1 = 'HDR1',
  HDR2 = 'HDR2',
  UHL1 = 'UHL1',
  DATA = 'DATA',
  EOF1 = 'EOF1',
  EOF2 = 'EOF2',
  UTL1 = 'UTL1',
}

export enum TransactionCode {
  CREDIT = '99',
  DEBIT = '17',
  // Add others as per Standard 18
}

export enum CurrencyCode {
  GBP = 'GBP',
  EUR = 'EUR',
  USD = 'USD',
}

export enum WorkCode {
  LIVE = '0',
  TEST = '1',
}

export interface Vol1 {
  type: RecordType.VOL1;
  label: string;
  serialNumber: string;
  accessibility: string;
  fileLabel: string;
  // ... all other fields will be added later
}

export interface Hdr1 {
  type: RecordType.HDR1;
  // fields...
}

// Placeholder for other record types – I’ll define full interfaces in a future iteration
export interface BacsRecordBase {
  line: number;
  type: RecordType;
  raw: string;
}

export type BacsRecord = Vol1 | Hdr1 | any; // will be refined later

export interface BacsFile {
  vol1: Vol1;
  hdr1: Hdr1;
  hdr2: any;
  uhl1: any;
  transactions: any[];
  eof1: any;
  eof2: any;
  utl1: any;
}

export interface ValidationError {
  code: string;
  message: string;
  line: number;
  field?: string;
  severity: 'error';
}

export interface ValidationWarning {
  code: string;
  message: string;
  line: number;
  severity: 'warning';
}

export interface ValidationSummary {
  payments: number;
  totalAmount: number;
  currency: string;
  processingDate: string;
  originator: string;
  destinationCount: number;
  recordCount: number;
  duplicateAccounts: number;
  duplicateReferences: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: ValidationSummary;
}