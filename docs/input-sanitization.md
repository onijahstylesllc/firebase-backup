# Input Sanitization Strategy

This document outlines the input sanitization and validation strategy implemented across the application to ensure secure handling of user-provided files and text inputs.

## Overview

All user-provided inputs, especially file uploads, are sanitized and validated before being stored in Supabase storage or database. This prevents security vulnerabilities such as:

- Path traversal attacks
- Filename injection
- Control character injection
- Storage of oversized files
- Upload of disallowed file types

## File Upload Security

### Allowed File Types

#### Documents
The following MIME types are accepted for document uploads:

- `application/pdf` - PDF documents
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Word (.docx)
- `application/msword` - Word (.doc)
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` - Excel (.xlsx)
- `application/vnd.ms-excel` - Excel (.xls)
- `application/vnd.openxmlformats-officedocument.presentationml.presentation` - PowerPoint (.pptx)
- `application/vnd.ms-powerpoint` - PowerPoint (.ppt)
- `text/plain` - Plain text files

#### Images
The following MIME types are accepted for image uploads:

- `image/jpeg` - JPEG images
- `image/png` - PNG images
- `image/gif` - GIF images
- `image/webp` - WebP images
- `image/svg+xml` - SVG images

### File Size Limits

- **Documents**: Maximum 50MB per file
- **Images**: Maximum 10MB per file

These limits are enforced before any upload is attempted, preventing unnecessary network traffic and storage consumption.

## Sanitization Functions

### `sanitizeFilename(filename: string): string`

Sanitizes filenames to prevent security vulnerabilities:

- Removes path traversal patterns (`../`, `..\\`, `/`, `\\`)
- Replaces dangerous characters (`<>:"|?*` and control characters) with underscores
- Normalizes Unicode characters (removes diacritics)
- Converts spaces to underscores
- Truncates to 255 characters maximum while preserving file extension
- Handles edge cases (empty names, only dots, etc.)

**Example:**
```typescript
sanitizeFilename('../../../etc/passwd.pdf') // Returns: 'etcpasswd.pdf'
sanitizeFilename('my document?.pdf')         // Returns: 'my_document_.pdf'
sanitizeFilename('café résumé.pdf')          // Returns: 'cafe_resume.pdf'
```

### `sanitizeTextInput(input: string, maxLength?: number): string`

Sanitizes general text inputs:

- Trims leading/trailing whitespace
- Rejects inputs containing control characters (throws error)
- Collapses excessive whitespace to single spaces
- Truncates to specified maximum length (default: 10,000 characters)

**Example:**
```typescript
sanitizeTextInput('  Hello   World  ')    // Returns: 'Hello World'
sanitizeTextInput('Text\x00WithNull')     // Throws error
```

### `generateSafeStoragePath(userId: string, fileId: string, filename: string): string`

Generates safe storage paths for Supabase:

- Sanitizes user ID, file ID, and filename
- Creates structured path: `{userId}/{fileId}-{sanitizedFilename}`
- Ensures no path traversal or unsafe characters

**Example:**
```typescript
generateSafeStoragePath('user123', 'abc-def', 'document.pdf')
// Returns: 'user123/abc-def-document.pdf'
```

## Validation Functions

### `validateDocumentFile(file: File): FileValidationResult`

Validates document files:
- Checks if file type is in allowed document MIME types
- Checks if file size is within document size limit (50MB)
- Returns validation result with error message if invalid

### `validateImageFile(file: File): FileValidationResult`

Validates image files:
- Checks if file type is in allowed image MIME types
- Checks if file size is within image size limit (10MB)
- Returns validation result with error message if invalid

### `validateFileType(file: File, allowedTypes: readonly string[]): FileValidationResult`

Generic file type validator:
- Checks if file MIME type is in the allowed list
- Returns descriptive error messages for user feedback

### `validateFileSize(file: File, maxSize: number): FileValidationResult`

Generic file size validator:
- Checks if file size is within specified limit
- Provides human-readable size information in error messages

## Implementation in Upload Components

### File Upload Component (`file-upload.tsx`)

1. **Pre-upload Validation**: Files are validated before any upload is initiated
2. **Sanitization**: Filenames are sanitized before storage path generation
3. **Safe Storage Paths**: Uses UUID-based file IDs with sanitized filenames
4. **User Feedback**: Invalid files trigger toast notifications with specific error messages
5. **Database Safety**: Only sanitized filenames are stored in the database

### Image Uploader Component (`image-uploader.tsx`)

1. **Image-Specific Validation**: Uses `validateImageFile()` with image size limits
2. **Sanitized Paths**: Document IDs and filenames are sanitized
3. **Error Handling**: Validation failures show user-friendly toast messages
4. **No Silent Failures**: All upload errors are surfaced to the user

### New Document Dialog (`new-document-dialog.tsx`)

1. **Text Input Sanitization**: Document names are sanitized using `sanitizeTextInput()`
2. **Control Character Prevention**: Rejects names with control characters
3. **Filename Safety**: Applies `sanitizeFilename()` to ensure safe storage

### Upload Utility (`uploadFile.ts`)

1. **Centralized Validation**: Validates documents before upload
2. **User Authentication**: Ensures user is authenticated before allowing uploads
3. **Safe Path Generation**: Uses UUID-based paths with sanitized user IDs
4. **Error Returns**: Returns structured error objects instead of logging

## Security Benefits

### Path Traversal Prevention
All filenames and path components are sanitized to prevent directory traversal attacks. Attempts to use `../` or similar patterns are neutralized.

### Storage Isolation
Files are stored in user-specific directories with UUID-based names, preventing:
- Name collisions
- Enumeration attacks
- Direct access to other users' files

### Type Safety
Only explicitly allowed file types can be uploaded, preventing:
- Executable uploads
- Script injection
- Malicious file types

### Size Limits
File size validation prevents:
- Storage exhaustion
- Denial of service attacks
- Excessive bandwidth usage

## Usage Examples

### Uploading a Document
```typescript
// User selects file: "../../../etc/passwd.pdf"
// 1. Validation checks MIME type and size
// 2. Filename sanitized to: "etcpasswd.pdf"
// 3. Storage path: "user-abc-123/file-uuid-xyz/etcpasswd.pdf"
// 4. Database stores sanitized filename: "etcpasswd.pdf"
```

### Creating a Document
```typescript
// User enters name: "My <script>alert('xss')</script> Document"
// 1. Text input sanitized: "My _script_alert('xss')__script_ Document"
// 2. Filename sanitized: "My__script_alert(xss)__script__Document.pdf"
// 3. Stored safely in database
```

### Rejected Upload Examples
```typescript
// Too large: "huge-file.pdf" (60MB) -> "File size (60.00MB) exceeds maximum allowed size of 50.00MB"
// Wrong type: "malware.exe" -> "File type 'application/x-msdownload' is not allowed"
// Empty file: "empty.pdf" (0 bytes) -> "File is empty"
```

## Testing

Unit tests are provided in `src/__tests__/sanitize.test.ts` covering:

- Basic filename sanitization
- Path traversal attempts
- Dangerous character removal
- Emoji and Unicode handling
- Long filename truncation
- Control character rejection in text inputs
- Edge cases and malformed inputs

Run tests with:
```bash
npm test
# or
pnpm test
```

## Best Practices

1. **Always Validate Before Upload**: Never upload files without validation
2. **Use UUIDs for Storage**: Don't use user-provided names as storage keys
3. **Sanitize Database Inputs**: Apply sanitization before database writes
4. **Provide User Feedback**: Show clear error messages for validation failures
5. **Log Security Events**: Monitor for patterns of malicious input attempts
6. **Keep Allowed Types Minimal**: Only allow file types that are actually needed
7. **Update Limits as Needed**: Adjust size limits based on actual requirements

## Future Enhancements

Potential improvements for consideration:

1. **Content-Based Type Detection**: Use magic numbers to verify file types beyond MIME type
2. **Virus Scanning**: Integrate antivirus scanning for uploaded files
3. **Image Processing**: Automatically strip EXIF data from uploaded images
4. **Rate Limiting**: Add per-user upload rate limits
5. **Quarantine System**: Temporarily quarantine suspicious uploads for review
6. **Audit Logging**: Detailed logging of all upload attempts and validation failures
