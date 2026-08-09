import { ValidationWarning, BacsFile } from '@standard18/shared';

/**
 * Detects duplicate payments and generates warnings.
 */
export function checkDuplicates(
  bacsFile: BacsFile,
  warnings: ValidationWarning[],
): void {
  // Duplicate SUNs
  const sunMap = new Map<string, number>();
  bacsFile.transactions.forEach((txn, idx) => {
    const sun = txn.sun.trim();
    if (sun) {
      sunMap.set(sun, (sunMap.get(sun) || 0) + 1);
    }
  });
  for (const [sun, count] of sunMap.entries()) {
    if (count > 1) {
      warnings.push({
        code: 'DUPLICATE_SUN',
        message: `SUN ${sun} appears ${count} times`,
        line: 0,
        severity: 'warning',
      });
    }
  }

  // Duplicate amount + destination account
  const amountAccountMap = new Map<string, number>();
  bacsFile.transactions.forEach((txn) => {
    const key = `${txn.amount.trim()}-${txn.destinationSortCode.trim()}-${txn.destinationAccountNumber.trim()}`;
    amountAccountMap.set(key, (amountAccountMap.get(key) || 0) + 1);
  });
  for (const [key, count] of amountAccountMap.entries()) {
    if (count > 1) {
      const [amount, sort, account] = key.split('-');
      warnings.push({
        code: 'DUPLICATE_AMOUNT_ACCOUNT',
        message: `Payment of ${amount} to sort ${sort} account ${account} appears ${count} times`,
        line: 0,
        severity: 'warning',
      });
    }
  }

  // Duplicate account + reference
  const accountRefMap = new Map<string, number>();
  bacsFile.transactions.forEach((txn) => {
    const key = `${txn.destinationSortCode.trim()}-${txn.destinationAccountNumber.trim()}-${txn.reference.trim()}`;
    if (txn.reference.trim()) {
      accountRefMap.set(key, (accountRefMap.get(key) || 0) + 1);
    }
  });
  for (const [key, count] of accountRefMap.entries()) {
    if (count > 1) {
      const [sort, account, ref] = key.split('-');
      warnings.push({
        code: 'DUPLICATE_ACCOUNT_REFERENCE',
        message: `Payment to sort ${sort} account ${account} with reference "${ref}" appears ${count} times`,
        line: 0,
        severity: 'warning',
      });
    }
  }
}