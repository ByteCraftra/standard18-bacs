import { ValidationError } from '@standard18/shared';

export function checkFileNotEmpty(content: string, errors: ValidationError[]): void {
  if (content.trim().length === 0) {
    errors.push({
      code: 'FILE_EMPTY',
      message: 'File is empty',
      line: 0,
      severity: 'error',
    });
  }
}