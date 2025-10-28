# AI Endpoints Migration Status

This document tracks the migration of AI flows from direct server action imports to authenticated API endpoints.

## ✅ Completed Migrations

The following AI flows have been successfully migrated to authenticated API endpoints with rate limiting:

### 1. Chat Flow (`ai-chat-flow`)
- **Original**: `src/ai/flows/ai-chat-flow.ts`
- **API Endpoint**: `POST /api/ai/chat`
- **Client Usage**: `src/app/documents/[id]/page.tsx`
- **Status**: ✅ Migrated
- **Rate Limit**: 20 requests/minute

### 2. Translate Flow (`ai-translate-text`)
- **Original**: `src/ai/ai-translate-text.ts`
- **API Endpoint**: `POST /api/ai/translate`
- **Client Usage**: `src/app/translate/page.tsx`
- **Status**: ✅ Migrated
- **Rate Limit**: 15 requests/minute

### 3. Rewrite Flow (`ai-rewrite-text`)
- **Original**: `src/ai/ai-rewrite-text.ts`
- **API Endpoint**: `POST /api/ai/rewrite`
- **Client Usage**: `src/app/rewrite/page.tsx`
- **Status**: ✅ Migrated
- **Rate Limit**: 15 requests/minute

## 🔄 Pending Migrations

The following AI flows still use the `'use server'` pattern and should be migrated in future tickets:

### Document Operations

#### 1. Analyze Document (`ai-analyze-document`)
- **File**: `src/ai/flows/ai-analyze-document.ts`
- **Description**: Analyzes document content and extracts key insights
- **Priority**: High (likely used in document viewer)
- **Suggested Rate Limit**: 10 requests/minute
- **Future Endpoint**: `POST /api/ai/analyze`

#### 2. Compress Document (`ai-compress-document`)
- **File**: `src/ai/flows/ai-compress-document.ts`
- **Description**: Compresses PDF documents using AI optimization
- **Priority**: Medium
- **Suggested Rate Limit**: 5 requests/minute
- **Future Endpoint**: `POST /api/ai/compress`

#### 3. Convert Document (`ai-convert-document`)
- **File**: `src/ai/flows/ai-convert-document.ts`
- **Description**: Converts documents between different formats
- **Priority**: Medium
- **Suggested Rate Limit**: 10 requests/minute
- **Future Endpoint**: `POST /api/ai/convert`

#### 4. Merge Documents (`ai-merge-documents`)
- **File**: `src/ai/flows/ai-merge-documents.ts`
- **Description**: Merges multiple documents into one
- **Priority**: Medium
- **Suggested Rate Limit**: 5 requests/minute
- **Future Endpoint**: `POST /api/ai/merge`

#### 5. Split Document (`ai-split-document`)
- **File**: `src/ai/flows/ai-split-document.ts`
- **Description**: Splits documents into separate files
- **Priority**: Medium
- **Suggested Rate Limit**: 5 requests/minute
- **Future Endpoint**: `POST /api/ai/split`

### Content Analysis

#### 6. Legal Checker (`ai-legal-checker`)
- **File**: `src/ai/flows/ai-legal-checker.ts`
- **Description**: Checks documents for legal issues and compliance
- **Priority**: High
- **Suggested Rate Limit**: 10 requests/minute
- **Future Endpoint**: `POST /api/ai/legal-check`

#### 7. Policy Checker (`ai-policy-checker`)
- **File**: `src/ai/flows/ai-policy-checker.ts`
- **Description**: Analyzes documents for policy compliance
- **Priority**: High
- **Suggested Rate Limit**: 10 requests/minute
- **Future Endpoint**: `POST /api/ai/policy-check`

#### 8. Math Solver (`ai-math-solver`)
- **File**: `src/ai/flows/ai-math-solver.ts`
- **Description**: Solves mathematical problems from documents
- **Priority**: Medium
- **Suggested Rate Limit**: 15 requests/minute
- **Future Endpoint**: `POST /api/ai/solve-math`

#### 9. Summarize Meeting (`ai-summarize-meeting-context`)
- **File**: `src/ai/flows/ai-summarize-meeting-context.ts`
- **Description**: Summarizes meeting notes and context
- **Priority**: Medium
- **Suggested Rate Limit**: 10 requests/minute
- **Future Endpoint**: `POST /api/ai/summarize-meeting`

### Automation

#### 10. Auto Generate File Names (`ai-auto-generate-file-names`)
- **File**: `src/ai/flows/ai-auto-generate-file-names.ts`
- **Description**: Generates descriptive file names based on content
- **Priority**: Low (automation task, may run server-side)
- **Suggested Rate Limit**: N/A (consider keeping as server action)
- **Note**: This might be better as a server-side only action

#### 11. Archive Old Docs (`ai-archive-old-docs`)
- **File**: `src/ai/flows/ai-archive-old-docs.ts`
- **Description**: Suggests archival of old documents
- **Priority**: Low (background task)
- **Suggested Rate Limit**: N/A (consider keeping as server action)
- **Note**: This might be better as a cron job or background task

## Migration Pattern

When migrating a flow, follow this pattern:

### 1. Create API Route

```typescript
// src/app/api/ai/[endpoint]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { [rateLimiter] } from '@/lib/security/rate-limit';
import { ai } from '@/ai/genkit';

// Define schemas
const InputSchema = z.object({
  // ... input fields
});

const OutputSchema = z.object({
  // ... output fields
});

// Define prompt and flow
const prompt = ai.definePrompt({
  // ... prompt config
});

const flow = ai.defineFlow({
  // ... flow config
});

export async function POST(request: NextRequest) {
  // 1. Verify authentication
  // 2. Apply rate limiting
  // 3. Validate input
  // 4. Call flow
  // 5. Return response with rate limit headers
}
```

### 2. Update Client Code

Replace direct server action import:
```typescript
// Before
import { flowFunction } from '@/ai/flows/ai-flow';
const result = await flowFunction(input);

// After
const response = await fetch('/api/ai/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(input),
});

if (!response.ok) {
  // Handle errors (401, 429, 400, 500)
}

const result = await response.json();
```

### 3. Add Rate Limiter (if needed)

```typescript
// src/lib/security/rate-limit.ts
export const newFlowRateLimiter = rateLimit({
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 10, // 10 requests per minute
});
```

### 4. Update Documentation

Add the new endpoint to `/docs/api.md` with:
- Endpoint path and method
- Authentication requirements
- Rate limit
- Request/response schemas
- Example usage
- Error codes

## Why Migrate?

### Benefits of API Endpoints over Direct Server Actions

1. **Security**
   - Explicit authentication checks
   - Rate limiting to prevent abuse
   - Better control over who can call what

2. **Observability**
   - Easier to monitor and log requests
   - Rate limit headers for debugging
   - Clear error responses

3. **Architecture**
   - Clean separation of concerns
   - Standard REST patterns
   - Easier to version and evolve

4. **Testing**
   - Can test endpoints independently
   - Easier to mock in tests
   - Can use standard HTTP testing tools

5. **Client Experience**
   - Better error handling
   - Rate limit awareness
   - Standard fetch API

## Notes

- Keep the original flow files intact for now (they may be used server-side)
- Remove `'use server'` directive only if flow is not used server-side
- Consider keeping pure automation tasks (like archiving) as server actions
- Background jobs should use separate patterns (cron, queues)
