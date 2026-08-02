import { ValidationError, ValidationWarning, ValidationSummary, BacsFile } from '@standard18/shared';
import { parse } from '@standard18/parser';
import { checkFileNotEmpty } from '../validators/file';
import { checkRecordLengths, checkRecordOrder, checkFieldValidators, checkBusinessRules } from '../validators/records';

export function pipeline(
  content: string,
  errors: ValidationError[],
  warnings: ValidationWarning[],
  summary: ValidationSummary,
): void {
  // Level 1
  checkFileNotEmpty(content, errors);
  if (errors.length > 0) return;

  const lines = content.split('\n').filter(line => line.trim() !== '');
  summary.recordCount = lines.length;

  // Level 2 & 3: Record length and order (still useful even before parsing)
  checkRecordLengths(lines, errors);
  checkRecordOrder(lines, errors);

  // Parse the file (if no critical errors so far)
  let bacsFile: BacsFile | null = null;
  if (errors.length === 0) {
    bacsFile = parse(content);
  }

  // Level 4: Field validation (requires parsed file)
  if (bacsFile) {
    checkFieldValidators(bacsFile, errors);
  }

  // Level 5: Business rules
  if (bacsFile) {
    checkBusinessRules(bacsFile, errors, warnings, summary);
  }
}