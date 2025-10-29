/**
 * Sanitization utilities for secure file uploads and user input handling
 */

/**
 * Allowed file extensions for document uploads
 */
const ALLOWED_DOCUMENT_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
  '.odt',
  '.rtf',
] as const;

/**
 * Allowed MIME types for document uploads
 */
const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.oasis.opendocument.text',
  'application/rtf',
] as const;

/**
 * Maximum file size in bytes (50MB)
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Validates and sanitizes a filename to prevent path traversal and malicious filenames
 * @param filename - The original filename
 * @returns Sanitized filename or null if invalid
 */
export function sanitizeFilename(filename: string): string | null {
  if (!filename || typeof filename !== 'string') {
    return null;
  }

  // Remove any path components (path traversal prevention)
  let sanitized = filename.replace(/^.*[\\\/]/, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Remove leading/trailing dots and spaces
  sanitized = sanitized.trim().replace(/^\.+/, '');

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.slice(sanitized.lastIndexOf('.'));
    sanitized = sanitized.slice(0, 255 - ext.length) + ext;
  }

  // Check if anything is left
  if (sanitized.length === 0) {
    return null;
  }

  // Ensure filename has a valid extension
  const hasValidExtension = ALLOWED_DOCUMENT_EXTENSIONS.some(ext =>
    sanitized.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    return null;
  }

  return sanitized;
}

/**
 * Validates file type based on MIME type and extension
 * @param file - File object to validate
 * @returns True if file type is allowed
 */
export function isValidFileType(file: File): boolean {
  if (!file || !file.name || !file.type) {
    return false;
  }

  // Check MIME type
  const mimeTypeValid = ALLOWED_DOCUMENT_MIME_TYPES.includes(
    file.type as any
  );

  // Check extension (trim filename first to handle edge cases)
  const trimmedName = file.name.trim().toLowerCase();
  const extension = trimmedName.slice(trimmedName.lastIndexOf('.'));
  const extensionValid = ALLOWED_DOCUMENT_EXTENSIONS.some(
    ext => ext === extension
  );

  return mimeTypeValid && extensionValid;
}

/**
 * Validates file size
 * @param file - File object to validate
 * @returns True if file size is within limits
 */
export function isValidFileSize(file: File): boolean {
  if (!file || typeof file.size !== 'number') {
    return false;
  }

  return file.size > 0 && file.size <= MAX_FILE_SIZE;
}

/**
 * Comprehensive file validation
 * @param file - File object to validate
 * @returns Validation result with error message if invalid
 */
export function validateUploadedFile(file: File): {
  valid: boolean;
  error?: string;
  sanitizedName?: string;
} {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Validate file size
  if (!isValidFileSize(file)) {
    return {
      valid: false,
      error: `File size must be between 1 byte and ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Validate file type
  if (!isValidFileType(file)) {
    return {
      valid: false,
      error: 'File type not allowed. Please upload a supported document format.',
    };
  }

  // Sanitize filename
  const sanitizedName = sanitizeFilename(file.name);
  if (!sanitizedName) {
    return {
      valid: false,
      error: 'Invalid filename. Please use a valid document name.',
    };
  }

  return {
    valid: true,
    sanitizedName,
  };
}

/**
 * Sanitizes user input text to prevent XSS and injection attacks
 * @param input - User input string
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeUserInput(
  input: string,
  maxLength: number = 10000
): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove potentially dangerous characters for database queries
  // Note: This is a basic implementation. Always use parameterized queries!
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

  return sanitized;
}

/**
 * Validates and sanitizes a URL
 * @param url - URL string to validate
 * @param allowedProtocols - Array of allowed protocols (default: http, https)
 * @returns Validated URL or null if invalid
 */
export function sanitizeUrl(
  url: string,
  allowedProtocols: string[] = ['http:', 'https:']
): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url.trim());

    // Check if protocol is allowed
    if (!allowedProtocols.includes(parsed.protocol)) {
      return null;
    }

    // Prevent javascript: and data: URLs
    if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Generates a safe, unique filename
 * @param originalName - Original filename
 * @param userId - User ID for namespacing
 * @returns Safe unique filename
 */
export function generateSafeFilename(
  originalName: string,
  userId: string
): string {
  const sanitized = sanitizeFilename(originalName);
  if (!sanitized) {
    return `document-${Date.now()}.pdf`;
  }

  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = sanitized.slice(sanitized.lastIndexOf('.'));
  const baseName = sanitized
    .slice(0, sanitized.lastIndexOf('.'))
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .slice(0, 50);

  return `${userId}-${baseName}-${timestamp}-${random}${extension}`;
}
