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
  reserved1: string;
  fileType: string;
  reserved2: string;
  format: string;
  reserved3: string;
}

export interface Hdr1 {
  type: RecordType.HDR1;
  label: string;
  fileIdentifier: string;
  serialNumber: string;
  processingDate: string;
  reserved1: string;
  fileNumber: string;
  reserved2: string;
}

export interface Hdr2 {
  type: RecordType.HDR2;
  label: string;
  fileIdentifier: string;
  serialNumber: string;
  workCode: string;
  reserved1: string;
}

export interface Uhl1 {
  type: RecordType.UHL1;
  label: string;
  originatorSortCode: string;
  reserved1: string;
  originatorAccountNumber: string;
  reserved2: string;
  originatorName: string;
  reserved3: string;
  processingDate: string;
  reserved4: string;
  currency: string;
  reserved5: string;
}

export interface DataRecord {
  type: RecordType.DATA;
  destinationSortCode: string;
  destinationAccountNumber: string;
  transactionCode: string;
  amount: string;
  originatorSortCode: string;
  originatorAccountNumber: string;
  processingDate: string;
  originatorName: string;
  destinationName: string;
  reference: string;
  sun: string;
}

export interface Eof1 {
  type: RecordType.EOF1;
  label: string;
  fileIdentifier: string;
  serialNumber: string;
  reserved1: string;
  totalDebitCount: string;
  totalDebitAmount: string;
  totalCreditCount: string;
  totalCreditAmount: string;
  reserved2: string;
}

export interface Eof2 {
  type: RecordType.EOF2;
  label: string;
  fileIdentifier: string;
  serialNumber: string;
  reserved1: string;
  totalDebitCount: string;
  totalDebitAmount: string;
  totalCreditCount: string;
  totalCreditAmount: string;
  reserved2: string;
}

export interface Utl1 {
  type: RecordType.UTL1;
  label: string;
  serialNumber: string;
  reserved1: string;
}

export interface BacsRecordBase {
  line: number;
  type: RecordType;
  raw: string;
}

export type BacsRecord = Vol1 | Hdr1 | Hdr2 | Uhl1 | DataRecord | Eof1 | Eof2 | Utl1;

export interface BacsFile {
  vol1: Vol1;
  hdr1: Hdr1;
  hdr2: Hdr2;
  uhl1: Uhl1;
  transactions: DataRecord[];
  eof1: Eof1;
  eof2: Eof2;
  utl1: Utl1;
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