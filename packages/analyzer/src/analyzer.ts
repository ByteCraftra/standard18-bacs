import { BacsFile, TransactionCode } from '@standard18/shared';
import { AnalyzerResult, DestinationSummary, AnalysisWarning } from './types';

const LARGE_PAYMENT_THRESHOLD = 1_000_000_00; // £1,000,000 in pence

export function analyze(bacsFile: BacsFile): AnalyzerResult {
  const { transactions, uhl1, vol1, dataRecordLength } = bacsFile;

  // --- File info ---
  const originatorSortCode = transactions.length > 0 ? transactions[0].originatorSortCode.trim() : '';
  const originatorAccountNumber = transactions.length > 0 ? transactions[0].originatorAccountNumber.trim() : '';
  const recordCount = 7 + transactions.length; // VOL1, HDR1, HDR2, UHL1, EOF1, EOF2, UTL1
  const fileInfo = {
    recordCount,
    dataRecordLength,
    processingDate: uhl1.processingDate.trim(),
    workCode: uhl1.workCode.trim(),
    fileLabel: vol1.serialNumber.trim(), // no dedicated file label in current spec, use serial
    originatorSortCode,
    originatorAccountNumber,
  };

  // --- Payments aggregation ---
  let creditCount = 0;
  let creditAmount = 0;
  let debitCount = 0;
  let debitAmount = 0;

  for (const txn of transactions) {
    const amount = parseInt(txn.amount, 10) || 0;
    if (txn.transactionCode === TransactionCode.CREDIT) {
      creditCount++;
      creditAmount += amount;
    } else if (txn.transactionCode === TransactionCode.DEBIT) {
      debitCount++;
      debitAmount += amount;
    }
  }

  const totalCount = transactions.length;
  const totalAmount = creditAmount;
  const averageAmount = creditCount > 0 ? Math.round(creditAmount / creditCount) : 0;

  const payments = {
    totalCount,
    totalAmount,
    creditCount,
    creditAmount,
    debitCount,
    debitAmount,
    averageAmount,
  };

  // --- Destination summary ---
  const destinationMap = new Map<string, DestinationSummary>();

  for (const txn of transactions) {
    const key = `${txn.destinationSortCode.trim()}-${txn.destinationAccountNumber.trim()}`;
    const amount = parseInt(txn.amount, 10) || 0;

    if (!destinationMap.has(key)) {
      destinationMap.set(key, {
        sortCode: txn.destinationSortCode.trim(),
        accountNumber: txn.destinationAccountNumber.trim(),
        totalAmount: 0,
        count: 0,
      });
    }
    const entry = destinationMap.get(key)!;
    entry.totalAmount += amount;
    entry.count += 1;
  }

  const allDestinations = Array.from(destinationMap.values());
  const uniqueAccounts = allDestinations.length;
  const topByAmount = allDestinations
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10); // top 10

  const destinations = {
    uniqueAccounts,
    topByAmount,
  };

  // --- Duplicate detection ---
  // Duplicate references (non‑empty)
  const referenceMap = new Map<string, number>();
  for (const txn of transactions) {
    const ref = txn.reference.trim();
    if (ref) {
      referenceMap.set(ref, (referenceMap.get(ref) || 0) + 1);
    }
  }
  const duplicateReferences = Array.from(referenceMap.entries())
    .filter(([, count]) => count > 1)
    .map(([ref]) => ref);

  // Duplicate amount + destination account
  const amountAccountMap = new Map<string, { sortCode: string; accountNumber: string; amount: number; count: number }>();
  for (const txn of transactions) {
    const key = `${txn.destinationSortCode.trim()}-${txn.destinationAccountNumber.trim()}-${txn.amount.trim()}`;
    if (!amountAccountMap.has(key)) {
      amountAccountMap.set(key, {
        sortCode: txn.destinationSortCode.trim(),
        accountNumber: txn.destinationAccountNumber.trim(),
        amount: parseInt(txn.amount, 10) || 0,
        count: 0,
      });
    }
    amountAccountMap.get(key)!.count++;
  }

  const duplicateAmountAccount = Array.from(amountAccountMap.values())
    .filter(entry => entry.count > 1)
    .map(({ sortCode, accountNumber, amount, count }) => ({
      sortCode,
      accountNumber,
      amount,
      count,
    }));

  const duplicates = {
    duplicateReferences,
    duplicateAmountAccount,
  };

  // --- Warnings ---
  const warnings: AnalysisWarning[] = [];

  // Large payment warning
  for (const txn of transactions) {
    const amount = parseInt(txn.amount, 10) || 0;
    if (amount > LARGE_PAYMENT_THRESHOLD) {
      warnings.push({
        code: 'LARGE_PAYMENT',
        message: `Payment of ${(amount / 100).toFixed(2)} to ${txn.destinationSortCode.trim()} ${txn.destinationAccountNumber.trim()} exceeds £1,000,000`,
        severity: 'warning',
      });
    }
  }

  // Multiple payments to same account
  const accountCountMap = new Map<string, number>();
  for (const txn of transactions) {
    const key = `${txn.destinationSortCode.trim()}-${txn.destinationAccountNumber.trim()}`;
    accountCountMap.set(key, (accountCountMap.get(key) || 0) + 1);
  }
  for (const [key, count] of accountCountMap.entries()) {
    if (count > 3) {
      const [sortCode, accountNumber] = key.split('-');
      warnings.push({
        code: 'MULTIPLE_PAYMENTS_SAME_ACCOUNT',
        message: `${count} payments to sort code ${sortCode}, account ${accountNumber}`,
        severity: 'info',
      });
    }
  }

  return {
    fileInfo,
    payments,
    destinations,
    duplicates,
    warnings,
  };
}