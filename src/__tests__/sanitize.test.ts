import { describe, it, expect } from 'vitest';
import {
  sanitizeFilename,
  sanitizeTextInput,
  generateSafeStoragePath,
  extractFileExtension,
  isValidFilenameLength,
} from '../lib/security/sanitize';

describe('sanitizeFilename', () => {
  it('should sanitize basic filenames', () => {
    expect(sanitizeFilename('document.pdf')).toBe('document.pdf');
    expect(sanitizeFilename('my file.docx')).toBe('my_file.docx');
  });

  it('should remove path traversal attempts', () => {
    expect(sanitizeFilename('../../../etc/passwd')).toBe('etcpasswd');
    expect(sanitizeFilename('..\\..\\windows\\system32')).toBe('windowssystem32');
    expect(sanitizeFilename('./file.pdf')).toBe('file.pdf');
  });

  it('should remove dangerous characters', () => {
    expect(sanitizeFilename('file<script>.pdf')).toBe('file_script_.pdf');
    expect(sanitizeFilename('doc|name?.pdf')).toBe('doc_name_.pdf');
    expect(sanitizeFilename('file:name*.docx')).toBe('file_name_.docx');
  });

  it('should handle emoji and special unicode', () => {
    expect(sanitizeFilename('document😀.pdf')).toBe('document.pdf');
    expect(sanitizeFilename('café.pdf')).toBe('cafe.pdf');
  });

  it('should truncate long filenames', () => {
    const longName = 'a'.repeat(300) + '.pdf';
    const result = sanitizeFilename(longName);
    expect(result.length).toBeLessThanOrEqual(255);
    expect(result.endsWith('.pdf')).toBe(true);
  });

  it('should handle filenames without extensions', () => {
    expect(sanitizeFilename('document')).toBe('document');
    expect(sanitizeFilename('my file')).toBe('my_file');
  });

  it('should handle empty or invalid input', () => {
    expect(() => sanitizeFilename('')).toThrow();
    expect(() => sanitizeFilename('   ')).not.toThrow();
    expect(sanitizeFilename('   ')).toBe('file');
  });

  it('should handle multiple dots in filename', () => {
    expect(sanitizeFilename('file.backup.2024.pdf')).toBe('file.backup.2024.pdf');
    expect(sanitizeFilename('archive.tar.gz')).toBe('archive.tar.gz');
  });

  it('should handle special path separators', () => {
    expect(sanitizeFilename('folder/file.pdf')).toBe('folderfile.pdf');
    expect(sanitizeFilename('folder\\file.pdf')).toBe('folderfile.pdf');
  });

  it('should normalize whitespace', () => {
    expect(sanitizeFilename('my   multiple   spaces.pdf')).toBe('my_multiple_spaces.pdf');
    expect(sanitizeFilename('  leading and trailing  .pdf')).toBe('leading_and_trailing.pdf');
  });
});

describe('sanitizeTextInput', () => {
  it('should trim and normalize whitespace', () => {
    expect(sanitizeTextInput('  hello  world  ')).toBe('hello world');
    expect(sanitizeTextInput('text\n\nwith\n\nnewlines')).toBe('text with newlines');
  });

  it('should reject control characters', () => {
    expect(() => sanitizeTextInput('hello\x00world')).toThrow();
    expect(() => sanitizeTextInput('text\x01\x02')).toThrow();
  });

  it('should truncate to max length', () => {
    const longText = 'a'.repeat(20000);
    const result = sanitizeTextInput(longText, 1000);
    expect(result.length).toBe(1000);
  });

  it('should handle empty input', () => {
    expect(sanitizeTextInput('')).toBe('');
    expect(sanitizeTextInput('   ')).toBe('');
  });

  it('should handle normal text', () => {
    expect(sanitizeTextInput('Hello, World!')).toBe('Hello, World!');
    expect(sanitizeTextInput('Text with numbers 123')).toBe('Text with numbers 123');
  });

  it('should collapse excessive whitespace', () => {
    expect(sanitizeTextInput('word1     word2     word3')).toBe('word1 word2 word3');
  });
});

describe('generateSafeStoragePath', () => {
  it('should generate safe storage paths', () => {
    const path = generateSafeStoragePath('user123', 'file-abc-123', 'document.pdf');
    expect(path).toMatch(/^user123\/file-abc-123-document\.pdf$/);
  });

  it('should sanitize user and file IDs', () => {
    const path = generateSafeStoragePath('user../123', 'file<>id', 'doc.pdf');
    expect(path).not.toContain('..');
    expect(path).not.toContain('<');
    expect(path).not.toContain('>');
  });

  it('should sanitize the filename component', () => {
    const path = generateSafeStoragePath('user1', 'file1', '../../../passwd');
    expect(path).not.toContain('..');
    expect(path).not.toContain('/passwd');
  });
});

describe('extractFileExtension', () => {
  it('should extract file extensions', () => {
    expect(extractFileExtension('document.pdf')).toBe('pdf');
    expect(extractFileExtension('archive.tar.gz')).toBe('gz');
    expect(extractFileExtension('IMAGE.JPG')).toBe('jpg');
  });

  it('should return empty string for files without extension', () => {
    expect(extractFileExtension('document')).toBe('');
    expect(extractFileExtension('README')).toBe('');
  });

  it('should handle malicious filenames', () => {
    const ext = extractFileExtension('../../../etc/passwd.txt');
    expect(ext).toBe('txt');
  });
});

describe('isValidFilenameLength', () => {
  it('should validate filename lengths', () => {
    expect(isValidFilenameLength('short.pdf')).toBe(true);
    expect(isValidFilenameLength('a'.repeat(255))).toBe(true);
    expect(isValidFilenameLength('a'.repeat(256))).toBe(false);
    expect(isValidFilenameLength('')).toBe(false);
  });
});
