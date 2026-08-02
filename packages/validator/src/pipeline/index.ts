import { ValidationError, ValidationWarning, ValidationSummary } from '@standard18/shared';
import { checkFileNotEmpty } from '../validators/file';
import { checkRecordLengths } from '../validators/records';
import { checkRecordOrder } from '../validators/records';

export function pipeline(
  content: string,
  errors: ValidationError[],
  warnings: ValidationWarning[],
  summary: ValidationSummary,
): void {
  // Level 1: File-level checks
  checkFileNotEmpty(content, errors);

  // Split into lines
  const lines = content.split('\n').filter(line => line.trim() !== ''); // remove blank lines for now
  summary.recordCount = lines.length;

  // Level 2 & 3: Record-level checks
  checkRecordLengths(lines, errors);
  checkRecordOrder(lines, errors);
}