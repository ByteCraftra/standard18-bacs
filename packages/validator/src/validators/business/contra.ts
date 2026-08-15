import { ValidationWarning, BacsFile, TransactionCode } from '@standard18/shared';

export function checkContra(
  bacsFile: BacsFile,
  warnings: ValidationWarning[],
): void {
  bacsFile.transactions.forEach((txn, idx) => {
    const isDebit = txn.transactionCode === TransactionCode.DEBIT;
    const isSelf = txn.destinationSortCode === txn.originatorSortCode &&
                   txn.destinationAccountNumber === txn.originatorAccountNumber;
    if (isDebit && isSelf) {
      warnings.push({
        code: 'CONTRA_DEBIT',
        message: `Transaction ${idx + 1} is a debit to the originator account – contra entry.`,
        line: 5 + idx,
        severity: 'warning',
      });
    } else if (!isDebit && isSelf) {
      warnings.push({
        code: 'SELF_CREDIT',
        message: `Transaction ${idx + 1} is a credit to the originator account – self‑payment.`,
        line: 5 + idx,
        severity: 'warning',
      });
    }
  });
}