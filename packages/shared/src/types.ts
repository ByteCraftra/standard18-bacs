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

// export enum WorkCode {
//   LIVE = '0',
//   TEST = '1',
// }

export enum WorkCode {
  MULTI = '4',
  SINGLE = '1',
}

export interface Vol1 {
  type: RecordType.VOL1;
  label: string;
  serialNumber: string;
  accessibility: string;
  reserved1: string;
  reserved2: string;
  sun: string;
  reserved3: string;
  reserved4: string;
  format: string;
}

export interface Hdr1 {
  type: RecordType.HDR1;
  label: string;
  fileIdentifier: string;
  sun: string;
  fileIdentifier2: string;
  reserved1: string;
  reserved2: string;
  reserved3: string;
  serialNumber: string;
  fileSectionNumber: string;
  fileSequenceNumber: string;
  generationNumber: string;
  generationVersion: string;
  creationDate: string;
  expirationDate: string;
  accessibility: string;
  blockCount: string;
  systemCode: string;
  reserved4: string;
}

export interface Hdr2 {
  type: RecordType.HDR2;
  label: string;
  format: string;
  blockLength: string;
  recordLength: string;
  reserved1: string;
  bufferOffset: string;
  reserved2: string;
}

export interface Uhl1 {
  type: RecordType.UHL1;
  label: string;
  processingDate: string;
  reserved1: string;
  currencyCode: string;
  countryCode: string;
  workCode: string;
  fileNumber: string;
  reserved2: string;
  auditPrintIdentifier: string;
  userBureau: string;
}

export interface DataRecord {
  type: RecordType.DATA;
  destinationSortCode: string;
  destinationAccountNumber: string;
  typeOfAccount: string;
  transactionCode: string;
  originatorSortCode: string;
  originatorAccountNumber: string;
  freeFormat: string;
  amount: string;
  originatorName: string;
  reference: string;
  destinationName: string;
  processingDate: string;
}

export interface Eof1 {
  type: RecordType.EOF1;
  label: string;
  fileIdentifier: string;
  sun: string;
  fileIdentifier2: string;
  reserved1: string;
  reserved2: string;
  reserved3: string;
  serialNumber: string;
  fileSectionNumber: string;
  fileSequenceNumber: string;
  generationNumber: string;
  generationVersion: string;
  creationDate: string;
  expirationDate: string;
  accessibility: string;
  blockCount: string;
  systemCode: string;
  reserved4: string;
}

export interface Eof2 {
  type: RecordType.EOF2;
  label: string;
  format: string;
  blockLength: string;
  recordLength: string;
  reserved1: string;
  bufferOffset: string;
  reserved2: string;
}

export interface Utl1 {
  type: RecordType.UTL1;
  label: string;
  totalDebitAmount: string;
  totalCreditAmount: string;
  totalDebitCount: string;
  totalCreditCount: string;
  reserved1: string;
  reserved2: string;
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
  dataRecordLength: 100 | 106;
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