export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'text/plain',
] as const;

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024;
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFileType(file: File, allowedTypes: readonly string[]): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!file.type) {
    return { valid: false, error: 'File type cannot be determined' };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Accepted types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

export function validateFileSize(file: File, maxSize: number = MAX_FILE_SIZE): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

export function validateDocumentFile(file: File): FileValidationResult {
  const typeResult = validateFileType(file, ALLOWED_DOCUMENT_MIME_TYPES);
  if (!typeResult.valid) {
    return typeResult;
  }

  return validateFileSize(file, MAX_DOCUMENT_SIZE);
}

export function validateImageFile(file: File): FileValidationResult {
  const typeResult = validateFileType(file, ALLOWED_IMAGE_MIME_TYPES);
  if (!typeResult.valid) {
    return typeResult;
  }

  return validateFileSize(file, MAX_IMAGE_SIZE);
}

export function getFileTypeCategory(mimeType: string): 'document' | 'image' | 'unknown' {
  if (ALLOWED_DOCUMENT_MIME_TYPES.includes(mimeType as any)) {
    return 'document';
  }
  if (ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as any)) {
    return 'image';
  }
  return 'unknown';
}
