import { describe, it, expect } from 'vitest';
import {
  sanitizeFilename,
  isValidFileType,
  isValidFileSize,
  validateUploadedFile,
  sanitizeUserInput,
  sanitizeUrl,
  generateSafeFilename,
  MAX_FILE_SIZE,
} from '@/lib/security/sanitize';

describe('sanitizeFilename', () => {
  it('should return valid filename unchanged', () => {
    expect(sanitizeFilename('document.pdf')).toBe('document.pdf');
    expect(sanitizeFilename('my-file.docx')).toBe('my-file.docx');
    expect(sanitizeFilename('report_2024.txt')).toBe('report_2024.txt');
  });

  it('should remove path traversal attempts', () => {
    expect(sanitizeFilename('../../../etc/passwd.pdf')).toBe('passwd.pdf');
    expect(sanitizeFilename('..\\..\\windows\\system32\\file.pdf')).toBe('file.pdf');
    expect(sanitizeFilename('/absolute/path/document.pdf')).toBe('document.pdf');
  });

  it('should remove null bytes', () => {
    expect(sanitizeFilename('file\0name.pdf')).toBe('filename.pdf');
    expect(sanitizeFilename('doc\0\0ument.pdf')).toBe('document.pdf');
  });

  it('should remove control characters', () => {
    expect(sanitizeFilename('file\x00name.pdf')).toBe('filename.pdf');
    expect(sanitizeFilename('doc\x1Fument.pdf')).toBe('document.pdf');
  });

  it('should remove leading dots', () => {
    expect(sanitizeFilename('...hidden.pdf')).toBe('hidden.pdf');
    expect(sanitizeFilename('.gitignore.pdf')).toBe('gitignore.pdf');
  });

  it('should trim whitespace', () => {
    expect(sanitizeFilename('  document.pdf  ')).toBe('document.pdf');
    expect(sanitizeFilename('\tdocument.pdf\n')).toBe('document.pdf');
  });

  it('should handle long filenames', () => {
    const longName = 'a'.repeat(300) + '.pdf';
    const result = sanitizeFilename(longName);
    expect(result).not.toBeNull();
    expect(result!.length).toBeLessThanOrEqual(255);
    expect(result!.endsWith('.pdf')).toBe(true);
  });

  it('should reject filenames without valid extensions', () => {
    expect(sanitizeFilename('document.exe')).toBeNull();
    expect(sanitizeFilename('malware.sh')).toBeNull();
    expect(sanitizeFilename('script.js')).toBeNull();
  });

  it('should reject empty or invalid input', () => {
    expect(sanitizeFilename('')).toBeNull();
    expect(sanitizeFilename('   ')).toBeNull();
    expect(sanitizeFilename(null as any)).toBeNull();
    expect(sanitizeFilename(undefined as any)).toBeNull();
  });

  it('should reject filename that becomes empty after sanitization', () => {
    expect(sanitizeFilename('...')).toBeNull();
    expect(sanitizeFilename('\0\0\0.pdf')).toBeNull();
  });

  it('should handle various document extensions', () => {
    expect(sanitizeFilename('doc.pdf')).toBe('doc.pdf');
    expect(sanitizeFilename('doc.doc')).toBe('doc.doc');
    expect(sanitizeFilename('doc.docx')).toBe('doc.docx');
    expect(sanitizeFilename('doc.txt')).toBe('doc.txt');
    expect(sanitizeFilename('doc.odt')).toBe('doc.odt');
    expect(sanitizeFilename('doc.rtf')).toBe('doc.rtf');
  });

  it('should be case insensitive for extensions', () => {
    expect(sanitizeFilename('document.PDF')).toBe('document.PDF');
    expect(sanitizeFilename('document.DOCX')).toBe('document.DOCX');
  });
});

describe('isValidFileType', () => {
  it('should accept valid PDF files', () => {
    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
    expect(isValidFileType(file)).toBe(true);
  });

  it('should accept valid Word documents', () => {
    const docFile = new File(['content'], 'document.doc', { type: 'application/msword' });
    expect(isValidFileType(docFile)).toBe(true);

    const docxFile = new File(['content'], 'document.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    expect(isValidFileType(docxFile)).toBe(true);
  });

  it('should accept valid text files', () => {
    const file = new File(['content'], 'document.txt', { type: 'text/plain' });
    expect(isValidFileType(file)).toBe(true);
  });

  it('should reject files with mismatched extension and MIME type', () => {
    const file = new File(['content'], 'document.pdf', { type: 'image/png' });
    expect(isValidFileType(file)).toBe(false);
  });

  it('should reject executable files', () => {
    const file = new File(['content'], 'malware.exe', { type: 'application/x-msdownload' });
    expect(isValidFileType(file)).toBe(false);
  });

  it('should reject files without name or type', () => {
    const fileNoType = new File(['content'], 'document.pdf', { type: '' });
    expect(isValidFileType(fileNoType)).toBe(false);
  });

  it('should reject null or undefined', () => {
    expect(isValidFileType(null as any)).toBe(false);
    expect(isValidFileType(undefined as any)).toBe(false);
  });
});

describe('isValidFileSize', () => {
  it('should accept files within size limit', () => {
    const file = new File(['a'.repeat(1000)], 'small.pdf', { type: 'application/pdf' });
    expect(isValidFileSize(file)).toBe(true);
  });

  it('should accept files at maximum size', () => {
    const content = new Uint8Array(MAX_FILE_SIZE);
    const file = new File([content], 'max.pdf', { type: 'application/pdf' });
    expect(isValidFileSize(file)).toBe(true);
  });

  it('should reject files exceeding size limit', () => {
    const content = new Uint8Array(MAX_FILE_SIZE + 1);
    const file = new File([content], 'toolarge.pdf', { type: 'application/pdf' });
    expect(isValidFileSize(file)).toBe(false);
  });

  it('should reject empty files', () => {
    const file = new File([], 'empty.pdf', { type: 'application/pdf' });
    expect(isValidFileSize(file)).toBe(false);
  });

  it('should reject null or undefined', () => {
    expect(isValidFileSize(null as any)).toBe(false);
    expect(isValidFileSize(undefined as any)).toBe(false);
  });
});

describe('validateUploadedFile', () => {
  it('should validate a correct file', () => {
    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
    const result = validateUploadedFile(file);

    expect(result.valid).toBe(true);
    expect(result.sanitizedName).toBe('document.pdf');
    expect(result.error).toBeUndefined();
  });

  it('should reject file that is too large', () => {
    const content = new Uint8Array(MAX_FILE_SIZE + 1);
    const file = new File([content], 'toolarge.pdf', { type: 'application/pdf' });
    const result = validateUploadedFile(file);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('File size must be');
  });

  it('should reject file with invalid type', () => {
    const file = new File(['content'], 'image.png', { type: 'image/png' });
    const result = validateUploadedFile(file);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('File type not allowed');
  });

  it('should reject file with malicious filename', () => {
    const file = new File(['content'], '../../../etc/passwd.exe', {
      type: 'application/pdf',
    });
    const result = validateUploadedFile(file);

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject null file', () => {
    const result = validateUploadedFile(null as any);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('No file provided');
  });

  it('should sanitize filename in successful validation', () => {
    const file = new File(['content'], '  document.pdf  ', {
      type: 'application/pdf',
    });
    const result = validateUploadedFile(file);

    expect(result.valid).toBe(true);
    expect(result.sanitizedName).toBe('document.pdf');
  });
});

describe('sanitizeUserInput', () => {
  it('should return clean input unchanged', () => {
    const input = 'This is a normal message';
    expect(sanitizeUserInput(input)).toBe(input);
  });

  it('should trim whitespace', () => {
    expect(sanitizeUserInput('  test  ')).toBe('test');
    expect(sanitizeUserInput('\n\ttest\n\t')).toBe('test');
  });

  it('should remove null bytes', () => {
    expect(sanitizeUserInput('test\0input')).toBe('testinput');
  });

  it('should respect max length', () => {
    const longInput = 'a'.repeat(20000);
    const result = sanitizeUserInput(longInput);
    expect(result.length).toBe(10000);
  });

  it('should allow custom max length', () => {
    const input = 'a'.repeat(200);
    const result = sanitizeUserInput(input, 100);
    expect(result.length).toBe(100);
  });

  it('should handle empty or invalid input', () => {
    expect(sanitizeUserInput('')).toBe('');
    expect(sanitizeUserInput('   ')).toBe('');
    expect(sanitizeUserInput(null as any)).toBe('');
    expect(sanitizeUserInput(undefined as any)).toBe('');
  });

  it('should remove control characters', () => {
    expect(sanitizeUserInput('test\x00input')).toBe('testinput');
    expect(sanitizeUserInput('test\x1Finput')).toBe('testinput');
  });

  it('should preserve newlines and tabs (printable whitespace)', () => {
    const input = 'Line 1\nLine 2\tTab';
    const result = sanitizeUserInput(input);
    expect(result).toContain('\n');
    expect(result).toContain('\t');
  });
});

describe('sanitizeUrl', () => {
  it('should accept valid HTTP URLs', () => {
    const url = 'http://example.com/path';
    expect(sanitizeUrl(url)).toBe('http://example.com/path');
  });

  it('should accept valid HTTPS URLs', () => {
    const url = 'https://example.com/path';
    expect(sanitizeUrl(url)).toBe('https://example.com/path');
  });

  it('should reject javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
  });

  it('should reject data: URLs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
  });

  it('should reject file: URLs', () => {
    expect(sanitizeUrl('file:///etc/passwd')).toBeNull();
  });

  it('should reject ftp: URLs by default', () => {
    expect(sanitizeUrl('ftp://example.com')).toBeNull();
  });

  it('should allow custom protocols', () => {
    const url = 'ftp://example.com';
    expect(sanitizeUrl(url, ['ftp:'])).toBe('ftp://example.com/');
  });

  it('should handle invalid URLs', () => {
    expect(sanitizeUrl('not a url')).toBeNull();
    expect(sanitizeUrl('htt p://broken.com')).toBeNull();
  });

  it('should trim input', () => {
    const url = '  https://example.com  ';
    expect(sanitizeUrl(url)).toBe('https://example.com/');
  });

  it('should reject empty or null input', () => {
    expect(sanitizeUrl('')).toBeNull();
    expect(sanitizeUrl(null as any)).toBeNull();
    expect(sanitizeUrl(undefined as any)).toBeNull();
  });

  it('should normalize URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
    expect(sanitizeUrl('https://example.com/')).toBe('https://example.com/');
  });
});

describe('generateSafeFilename', () => {
  it('should generate unique filenames', () => {
    const name1 = generateSafeFilename('document.pdf', 'user123');
    const name2 = generateSafeFilename('document.pdf', 'user123');

    expect(name1).not.toBe(name2);
    expect(name1.startsWith('user123-')).toBe(true);
    expect(name2.startsWith('user123-')).toBe(true);
  });

  it('should preserve extension', () => {
    const result = generateSafeFilename('document.pdf', 'user123');
    expect(result.endsWith('.pdf')).toBe(true);
  });

  it('should sanitize base name', () => {
    const result = generateSafeFilename('my document!@#$.pdf', 'user123');
    expect(result).toContain('my-document');
    expect(result).not.toContain('!');
    expect(result).not.toContain('@');
  });

  it('should include user ID', () => {
    const result = generateSafeFilename('document.pdf', 'user456');
    expect(result.startsWith('user456-')).toBe(true);
  });

  it('should include timestamp', () => {
    const before = Date.now();
    const result = generateSafeFilename('document.pdf', 'user123');
    const after = Date.now();

    // Extract timestamp from filename (format: userId-basename-timestamp-random.ext)
    const parts = result.split('-');
    const timestamp = parseInt(parts[parts.length - 2]);

    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });

  it('should include random component', () => {
    const name1 = generateSafeFilename('document.pdf', 'user123');
    const name2 = generateSafeFilename('document.pdf', 'user123');

    const random1 = name1.split('-').slice(-1)[0].replace('.pdf', '');
    const random2 = name2.split('-').slice(-1)[0].replace('.pdf', '');

    expect(random1).not.toBe(random2);
  });

  it('should handle invalid filenames', () => {
    const result = generateSafeFilename('', 'user123');
    expect(result).toContain('document-');
    expect(result.endsWith('.pdf')).toBe(true);
  });

  it('should limit basename length', () => {
    const longName = 'a'.repeat(200) + '.pdf';
    const result = generateSafeFilename(longName, 'user123');

    const parts = result.split('-');
    const basename = parts[1];
    expect(basename.length).toBeLessThanOrEqual(50);
  });

  it('should handle different extensions', () => {
    expect(generateSafeFilename('doc.pdf', 'user1').endsWith('.pdf')).toBe(true);
    expect(generateSafeFilename('doc.docx', 'user1').endsWith('.docx')).toBe(true);
    expect(generateSafeFilename('doc.txt', 'user1').endsWith('.txt')).toBe(true);
  });
});
