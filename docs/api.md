# AI API Endpoints

This document describes the authenticated AI API endpoints available in the application.

## Overview

All AI endpoints are protected with:
- **Authentication**: Users must be logged in via Supabase auth
- **Rate Limiting**: Requests are rate-limited per user/IP to prevent abuse
- **Input Validation**: All payloads are validated using Zod schemas

## Rate Limits

Default rate limits per endpoint (per minute):
- `/api/ai/chat`: 20 requests
- `/api/ai/translate`: 15 requests
- `/api/ai/rewrite`: 15 requests

Rate limit information is returned in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed in the time window
- `X-RateLimit-Remaining`: Number of requests remaining
- `X-RateLimit-Reset`: Timestamp when the rate limit resets

## Endpoints

### POST /api/ai/chat

AI-powered chat about documents with context awareness and personalization.

**Authentication**: Required

**Rate Limit**: 20 requests per minute

**Request Body**:
```json
{
  "message": "string (required) - The user's message",
  "documentImage": "string (optional) - Data URI of document page image",
  "history": [
    {
      "role": "user | model",
      "content": [{ "text": "string" }]
    }
  ],
  "personalization": {
    "role": "string (optional) - User's professional role",
    "tone": "string (optional) - Desired tone of voice",
    "outputFormat": "string (optional) - Desired output format"
  }
}
```

**Success Response** (200):
```json
{
  "response": "string - AI's response to the user's message"
}
```

**Error Responses**:
- `401 Unauthorized`: User is not authenticated
- `429 Too Many Requests`: Rate limit exceeded
- `400 Bad Request`: Invalid request payload
- `500 Internal Server Error`: Server error

**Example Usage**:
```javascript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Summarize this document',
    documentImage: 'data:image/png;base64,...',
    personalization: {
      tone: 'professional'
    }
  }),
});

if (response.ok) {
  const data = await response.json();
  console.log(data.response);
}
```

### POST /api/ai/translate

Translate text into different languages while preserving formatting.

**Authentication**: Required

**Rate Limit**: 15 requests per minute

**Request Body**:
```json
{
  "text": "string (required) - The text to translate",
  "targetLanguage": "string (required) - Target language name (e.g., 'Spanish', 'French')"
}
```

**Success Response** (200):
```json
{
  "translatedText": "string - The translated text"
}
```

**Error Responses**:
- `401 Unauthorized`: User is not authenticated
- `429 Too Many Requests`: Rate limit exceeded
- `400 Bad Request`: Invalid request payload
- `500 Internal Server Error`: Server error

**Example Usage**:
```javascript
const response = await fetch('/api/ai/translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Hello, world!',
    targetLanguage: 'Spanish'
  }),
});

if (response.ok) {
  const data = await response.json();
  console.log(data.translatedText); // "¡Hola, mundo!"
}
```

### POST /api/ai/rewrite

Rewrite text to improve tone, grammar, or format with AI assistance.

**Authentication**: Required

**Rate Limit**: 15 requests per minute

**Request Body**:
```json
{
  "text": "string (required) - The text to rewrite",
  "style": "string (optional) - Desired style or instructions (e.g., 'Make this more formal')"
}
```

**Success Response** (200):
```json
{
  "rewrittenText": "string - The rewritten text"
}
```

**Error Responses**:
- `401 Unauthorized`: User is not authenticated
- `429 Too Many Requests`: Rate limit exceeded
- `400 Bad Request`: Invalid request payload
- `500 Internal Server Error`: Server error

**Example Usage**:
```javascript
const response = await fetch('/api/ai/rewrite', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'The thing is good.',
    style: 'Make this more professional and detailed'
  }),
});

if (response.ok) {
  const data = await response.json();
  console.log(data.rewrittenText);
}
```

## Error Handling Best Practices

Always check the response status and handle errors gracefully:

```javascript
try {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    
    switch (response.status) {
      case 401:
        // Redirect to login or show auth error
        break;
      case 429:
        // Show rate limit message with retry time
        const resetTime = response.headers.get('X-RateLimit-Reset');
        break;
      case 400:
        // Show validation errors
        console.error(errorData.details);
        break;
      default:
        // Show generic error
        break;
    }
    return;
  }

  const data = await response.json();
  // Process successful response
} catch (error) {
  // Handle network errors
  console.error('Network error:', error);
}
```

## Other AI Flows

The following AI flows are still implemented as server actions and should be migrated to API endpoints in future tickets:

### Document Operations
- `ai-analyze-document` - Analyzes document content and extracts insights
- `ai-compress-document` - Compresses PDF documents
- `ai-convert-document` - Converts documents between formats
- `ai-merge-documents` - Merges multiple documents
- `ai-split-document` - Splits documents into separate files

### Content Analysis
- `ai-legal-checker` - Checks documents for legal issues
- `ai-policy-checker` - Analyzes documents for policy compliance
- `ai-math-solver` - Solves mathematical problems
- `ai-summarize-meeting-context` - Summarizes meeting notes

### Automation
- `ai-auto-generate-file-names` - Generates descriptive file names
- `ai-archive-old-docs` - Suggests archival of old documents

## Security Considerations

1. **Authentication**: All endpoints verify Supabase session before processing
2. **Rate Limiting**: In-memory LRU cache tracks requests per user/IP
3. **Input Validation**: Zod schemas validate all inputs before processing
4. **Error Messages**: Error responses don't expose sensitive system information
5. **CORS**: Endpoints only accept same-origin requests

## Configuration

Rate limits can be adjusted in `/src/lib/security/rate-limit.ts`:

```typescript
export const chatRateLimiter = rateLimit({
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 20, // 20 requests per minute
});
```

## Future Improvements

- Persistent rate limiting (Redis/database)
- Tiered rate limits based on user subscription
- Request queuing for rate-limited requests
- API key authentication for external clients
- Detailed usage analytics and monitoring
