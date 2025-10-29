const MAX_FILENAME_LENGTH = 255;
const MAX_TEXT_INPUT_LENGTH = 10000;

const DANGEROUS_FILENAME_CHARS = /[<>:"|?*\x00-\x1f]/g;
const PATH_TRAVERSAL_PATTERN = /\.\.|[\/\\]/g;
const CONTROL_CHARS_PATTERN = /[\x00-\x1f\x7f-\x9f]/g;
const EXCESSIVE_WHITESPACE_PATTERN = /\s+/g;

export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename: must be a non-empty string');
  }

  let sanitized = filename.trim();

  sanitized = sanitized.replace(PATH_TRAVERSAL_PATTERN, '');

  sanitized = sanitized.replace(DANGEROUS_FILENAME_CHARS, '_');

  sanitized = sanitized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  sanitized = sanitized.replace(/\s+/g, '_');

  const parts = sanitized.split('.');
  const extension = parts.length > 1 ? parts.pop() : '';
  let baseName = parts.join('.');

  if (!baseName) {
    baseName = 'file';
  }

  if (extension) {
    const maxBaseLength = MAX_FILENAME_LENGTH - extension.length - 1;
    if (baseName.length > maxBaseLength) {
      baseName = baseName.substring(0, maxBaseLength);
    }
    sanitized = `${baseName}.${extension}`;
  } else {
    if (baseName.length > MAX_FILENAME_LENGTH) {
      baseName = baseName.substring(0, MAX_FILENAME_LENGTH);
    }
    sanitized = baseName;
  }

  if (!sanitized || sanitized === '.' || sanitized === '..') {
    sanitized = 'unnamed_file';
  }

  return sanitized;
}

export function sanitizeTextInput(input: string, maxLength: number = MAX_TEXT_INPUT_LENGTH): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  if (CONTROL_CHARS_PATTERN.test(sanitized)) {
    throw new Error('Invalid input: contains control characters');
  }

  sanitized = sanitized.replace(EXCESSIVE_WHITESPACE_PATTERN, ' ');

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

export function generateSafeStoragePath(userId: string, fileId: string, originalFilename: string): string {
  const sanitizedFilename = sanitizeFilename(originalFilename);
  
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-_]/g, '');
  const sanitizedFileId = fileId.replace(/[^a-zA-Z0-9-_]/g, '');
  
  return `${sanitizedUserId}/${sanitizedFileId}-${sanitizedFilename}`;
}

export function extractFileExtension(filename: string): string {
  const sanitized = sanitizeFilename(filename);
  const parts = sanitized.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export function isValidFilenameLength(filename: string): boolean {
  return filename.length > 0 && filename.length <= MAX_FILENAME_LENGTH;
}
