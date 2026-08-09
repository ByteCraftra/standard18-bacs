import { ValidationWarning, BacsFile, TransactionCode } from '@standard18/shared';

/**
 * Detects potential contra (self‑payment) records.
 *
 * - A debit (17) to the originator account is a classic contra entry used
 *   to offset credits. Many banks accept this as a valid contra submission.
 * - A credit (99) to the originator account is a self‑payment, often
 *   accepted without issue.
 *
 * Both cases generate a warning (not an error) because they are not
 * formatting violations but may require manual review.
 */
export function checkContra(
  bacsFile: BacsFile,
  warnings: ValidationWarning[],
): void {
  const originatorSort = bacsFile.uhl1.originatorSortCode.trim();
  const originatorAccount = bacsFile.uhl1.originatorAccountNumber.trim();

  bacsFile.transactions.forEach((txn, idx) => {
    const destSort = txn.destinationSortCode.trim();
    const destAccount = txn.destinationAccountNumber.trim();

    if (destSort === originatorSort && destAccount === originatorAccount) {
      if (txn.transactionCode === TransactionCode.DEBIT) {
        warnings.push({
          code: 'CONTRA_DEBIT',
          message: `Transaction ${idx + 1} is a debit (17) to the originator account – likely a contra.`,
          line: 5 + idx,
          severity: 'warning',
        });
      } else if (txn.transactionCode === TransactionCode.CREDIT) {
        warnings.push({
          code: 'SELF_CREDIT',
          message: `Transaction ${idx + 1} is a credit (99) to the originator account – self‑payment.`,
          line: 5 + idx,
          severity: 'warning',
        });
      }
    }
  });
}