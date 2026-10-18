import {
  ValidationResult,
  ValidationSummary,
  ValidationError,
  ValidationWarning,   
} from '@standard18/shared';
import { pipeline } from './pipeline';

export function validate(content: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];   // <-- add type annotation
  const summary: ValidationSummary = {
    payments: 0,
    totalAmount: 0,
    currency: '',
    processingDate: '',
    originator: '',
    destinationCount: 0,
    recordCount: 0,
    duplicateAccounts: 0,
    duplicateReferences: 0,
  };

  // Run the pipeline
  pipeline(content, errors, warnings, summary);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary,
  };
}