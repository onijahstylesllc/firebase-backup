# Routing & Error Boundaries

This document describes the routing architecture and error boundary philosophy for the DocuMind application.

## Overview

DocuMind uses Next.js 15 App Router with a comprehensive boundary strategy that ensures:
- Graceful error handling at all route levels
- Consistent loading states during data fetches
- User-friendly 404 pages for missing resources
- Proper error logging for debugging and monitoring

## Route Boundaries

### Loading Boundaries (`loading.tsx`)

Loading boundaries provide fallback UI while a route segment and its children are loading. They are automatically wrapped in a Suspense boundary by Next.js.

**Implemented at:**
- `/documents` - Shows spinner while document list loads
- `/documents/[id]` - Shows loading state with document-specific messaging
- `/profile` - Shows spinner while profile data loads
- `/teams` - Shows spinner while team data loads
- `/settings` - Shows spinner while settings load
- `/templates` - Shows spinner while templates load
- `/memory-threads` - Shows spinner while chat history loads
- Document utility pages (`/convert`, `/compress`, `/merge`, `/split`, `/edit-pdf`)
- AI tool pages (`/translate`, `/analyze`, `/rewrite`, `/math-solver`, `/legal`, `/policy`, `/summarize-meeting`)

**Design Pattern:**
- Use `ThreeDot` spinner from `react-loading-indicators` for simple page loads
- Use custom loading UI with `Loader2` icon for pages with specific context (e.g., "Loading Document...")
- Maintain consistent styling with Tailwind classes and shadcn/ui design tokens

### Error Boundaries (`error.tsx`)

Error boundaries catch JavaScript errors anywhere in the route's component tree and display a fallback UI instead of crashing the page. They must be Client Components (`'use client'`).

**Implemented at:**
- `/documents` - Catches Supabase fetch errors, network issues
- `/documents/[id]` - Catches document-specific errors
- `/profile` - Catches profile fetch errors
- `/teams` - Catches team data errors
- `/settings` - Catches settings errors
- `/templates` - Catches template loading errors
- `/memory-threads` - Catches chat history fetch errors
- Document utility pages (`/convert`, `/compress`, `/merge`, `/split`, `/edit-pdf`) - Catches processing errors
- AI tool pages (`/translate`, `/analyze`, `/rewrite`, `/math-solver`, `/legal`, `/policy`, `/summarize-meeting`) - Catches AI service errors, API failures

**Design Pattern:**
- Display user-friendly error messages with context
- Show technical error details in a muted code block for debugging
- Provide two action buttons:
  - **Try Again**: Calls the `reset()` function to re-attempt rendering
  - **Navigation Link**: Returns user to a safe location (Dashboard or parent route)
- Log errors to console using `useEffect` for debugging
- Use shadcn/ui Card, Button components with AlertCircle icon
- Future enhancement: Hook into error monitoring service (e.g., Sentry)

**Error Throwing Strategy:**
- Components should throw errors (not just log them) when Supabase operations fail
- This allows error boundaries to catch and display them properly
- Example:
  ```typescript
  if (error) {
    console.error('Error fetching data:', error);
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
  ```

### Not Found Pages (`not-found.tsx`)

Not found pages are displayed when `notFound()` is called within a route segment or when a route doesn't match.

**Implemented at:**
- `/documents/[id]` - When document doesn't exist or user lacks permission
- Root `/` - Global 404 for unmatched routes

**Design Pattern:**
- Use FileQuestion icon to indicate missing resource
- Provide clear explanation of why content isn't available
- Offer navigation back to safe locations
- Use shadcn/ui Card components for consistency

## Error Handling Philosophy

### Supabase Integration

When fetching data from Supabase:

1. **Always check for errors** from Supabase responses
2. **Log errors** to console for debugging
3. **Throw errors** for the boundary to catch (don't silently fail)
4. **Use appropriate boundaries**:
   - `notFound()` for missing resources (404)
   - `throw new Error()` for fetch failures, network issues, permission errors

### Client-Side Data Fetching

For client components (`'use client'`) that fetch data in `useEffect`:
- Errors thrown in useEffect are caught by the nearest error boundary
- Maintain local loading states for inline feedback
- Use toast notifications for non-critical errors that shouldn't break the page

### Navigation Safety

All error and not-found pages provide navigation options:
- **Primary action**: Try again or go to most relevant parent
- **Secondary action**: Return to Dashboard (safe fallback)
- This ensures users are never "stuck" on an error page

## Testing Boundaries

### Manual Testing

To test error boundaries:
1. **Simulate Supabase errors**: Temporarily modify queries to force failures
2. **Network issues**: Use browser DevTools to throttle/block network
3. **Invalid routes**: Navigate to non-existent routes for 404 testing
4. **Missing data**: Try accessing documents with invalid IDs

### Future Enhancements

- Integrate error monitoring service (Sentry, LogRocket, etc.)
- Add error boundary at root layout for global fallback
- Implement error recovery strategies (retry with exponential backoff)
- Add user feedback mechanism for recurring errors
- Track error rates and patterns for proactive debugging

## Best Practices

1. **Always provide context**: Error messages should explain what failed and why
2. **Maintain UI consistency**: Use shadcn/ui components throughout
3. **Log for debugging**: Console logs help developers troubleshoot
4. **Guide users forward**: Always provide clear next steps
5. **Avoid layout shift**: Loading skeletons should match final content layout
6. **Test error paths**: Error handling is as important as happy paths
7. **Document patterns**: Keep this guide updated as patterns evolve

## Route Segment Structure

```
src/app/
├── layout.tsx (root layout with providers)
├── page.tsx (landing page)
├── not-found.tsx (global 404)
│
├── dashboard/
│   ├── loading.tsx
│   └── page.tsx
│
├── documents/
│   ├── loading.tsx
│   ├── error.tsx
│   ├── page.tsx
│   └── [id]/
│       ├── loading.tsx
│       ├── error.tsx
│       ├── not-found.tsx
│       └── page.tsx
│
├── profile/
│   ├── loading.tsx
│   ├── error.tsx
│   └── page.tsx
│
├── teams/
│   ├── loading.tsx
│   ├── error.tsx
│   └── page.tsx
│
├── settings/
│   ├── loading.tsx
│   ├── error.tsx
│   └── page.tsx
│
├── templates/
│   ├── loading.tsx
│   ├── error.tsx
│   └── page.tsx
│
├── memory-threads/
│   ├── loading.tsx
│   ├── error.tsx
│   └── page.tsx
│
├── [document-utility]/ (convert, compress, merge, split, edit-pdf)
│   ├── loading.tsx
│   ├── error.tsx
│   └── page.tsx
│
└── [ai-tool]/ (translate, analyze, rewrite, math-solver, legal, policy, summarize-meeting)
    ├── loading.tsx
    ├── error.tsx
    └── page.tsx
```

Each major route segment has the appropriate boundaries to handle loading, errors, and not-found scenarios gracefully.
