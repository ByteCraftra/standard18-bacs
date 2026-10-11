export interface AnalysisWarning {
  code: string;
  message: string;
  severity: 'info' | 'warning';
}

export interface DestinationSummary {
  sortCode: string;
  accountNumber: string;
  totalAmount: number;
  count: number;
}

export interface AnalyzerResult {
  fileInfo: {
    recordCount: number;
    dataRecordLength: 100 | 106;
    processingDate: string;
    workCode: string;
    fileLabel: string;
    originatorSortCode: string;
    originatorAccountNumber: string;
  };
  payments: {
    totalCount: number;
    totalAmount: number;       // sum of credit amounts (actual payments)
    creditCount: number;
    creditAmount: number;
    debitCount: number;
    debitAmount: number;
    averageAmount: number;     // average credit amount (if creditCount > 0)
  };
  destinations: {
    uniqueAccounts: number;
    topByAmount: DestinationSummary[];
  };
  duplicates: {
    duplicateReferences: string[];
    duplicateAmountAccount: {
      sortCode: string;
      accountNumber: string;
      amount: number;
      count: number;
    }[];
  };
  warnings: AnalysisWarning[];
}