# Testing Route Boundaries

This document provides guidance on testing the route boundaries implemented in the application.

## Overview

The application now has comprehensive loading, error, and not-found boundaries across all major routes. This guide will help you verify that these boundaries work as expected.

## Testing Loading Boundaries

### Automatic Testing
Loading boundaries are shown automatically when:
- Navigating to a new route
- The route component is suspended while fetching data
- Network conditions are slow

### Manual Testing with Network Throttling
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Select "Slow 3G" or "Fast 3G" from the throttling dropdown
4. Navigate to any route with a loading boundary
5. Verify the loading indicator appears

### Routes to Test
- `/documents` - Should show ThreeDot spinner
- `/documents/[id]` - Should show "Loading Document..." message
- `/profile` - Should show ThreeDot spinner
- `/teams` - Should show ThreeDot spinner
- `/settings` - Should show ThreeDot spinner
- All AI tool pages - Should show ThreeDot spinner
- All document utility pages - Should show ThreeDot spinner

## Testing Error Boundaries

### Method 1: Temporarily Break Data Fetching

For routes that fetch from Supabase (e.g., `/documents`):

```typescript
// In src/app/documents/page.tsx
// Temporarily modify the query to cause an error:
const { data, error } = await supabase.from('nonexistent_table').select('*');
```

### Method 2: Network Offline Mode
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Navigate to a route that fetches data
5. Verify error boundary appears with retry option

### Method 3: Simulate Supabase Error
Temporarily add this in a page's useEffect:
```typescript
throw new Error('Test error for boundary');
```

### Expected Error Boundary Behavior
Each error boundary should display:
1. ✅ AlertCircle icon with red/destructive styling
2. ✅ Clear, user-friendly error title
3. ✅ Contextual description of what went wrong
4. ✅ Technical error message in a code block
5. ✅ "Try Again" button that calls reset()
6. ✅ Navigation button to safe location (Dashboard or parent)
7. ✅ Console log of the error

### Routes to Test
- `/documents` - Test with invalid Supabase query
- `/documents/[id]` - Test with invalid document ID
- `/profile` - Test with profile fetch error
- `/teams` - Test with team data error
- `/settings` - Test with settings error
- `/memory-threads` - Test with chat history error
- AI tool pages - Test by temporarily breaking AI service calls

## Testing Not-Found Boundaries

### Method 1: Navigate to Invalid Routes
1. Navigate to `/documents/invalid-uuid-here`
2. Should show document not-found page
3. Navigate to `/completely-invalid-route`
4. Should show global not-found page

### Method 2: Test notFound() Calls
The `/documents/[id]` route calls `notFound()` when:
- Document doesn't exist
- User doesn't have permission
- Database returns an error

Test by:
1. Creating a valid document
2. Noting its ID
3. Deleting it from the database
4. Navigating to `/documents/[deleted-id]`

### Expected Not-Found Behavior
Not-found pages should display:
1. ✅ FileQuestion icon
2. ✅ Clear "not found" messaging
3. ✅ Explanation of why resource isn't available
4. ✅ Navigation button(s) to safe location
5. ✅ Consistent shadcn/ui styling

### Routes to Test
- `/documents/[id]/not-found.tsx` - Invalid document ID
- Root `/not-found.tsx` - Any invalid route

## Testing Error Propagation

### Verify Errors Are Thrown (Not Just Logged)

Check that these routes **throw** errors instead of just logging them:

1. **Documents Page** (`/documents/page.tsx`)
   ```typescript
   if (error) {
     console.error('Error fetching documents:', error);
     throw new Error(`Failed to fetch documents: ${error.message}`);
   }
   ```

2. **Profile Page** (`/profile/page.tsx`)
   ```typescript
   if (error) {
     throw new Error(`Failed to fetch profile: ${error.message}`);
   }
   ```

3. **Memory Threads Page** (`/memory-threads/page.tsx`)
   ```typescript
   if (error) {
     console.error("Error fetching threads:", error);
     throw new Error(`Failed to fetch chat history: ${error.message}`);
   }
   ```

### Test Error Propagation
1. Temporarily break a Supabase query
2. Navigate to the route
3. Verify error boundary catches it (not just console log)
4. Verify "Try Again" button works
5. Revert the breaking change
6. Click "Try Again" - should succeed

## Regression Testing

After implementing boundaries, verify:

### ✅ Navigation Works Normally
- All routes accessible via navigation
- No unnecessary loading flashes
- Smooth transitions between routes

### ✅ SSR/CSR Behavior
- Server-side rendering still works
- Client-side navigation is smooth
- No hydration errors

### ✅ Data Fetching
- Supabase queries still work
- Real-time subscriptions function
- Authentication flows work

### ✅ Layout Stability
- Loading states don't cause layout shifts
- Skeletons match final content layout
- Spinners are centered and sized appropriately

## Common Issues & Solutions

### Issue: Loading boundary not showing
**Solution:** Ensure the page component uses `async` operations or Suspense-triggering patterns.

### Issue: Error boundary not catching errors
**Solution:** Verify errors are **thrown** (not just logged). Check that the error occurs during render, not in event handlers (which need try-catch).

### Issue: "Try Again" button not working
**Solution:** Ensure the error boundary's `reset()` function is properly connected. May need to refresh data dependencies.

### Issue: Not-found page not showing
**Solution:** Verify `notFound()` is being called. Check that `not-found.tsx` exists in the correct directory.

## Best Practices Verification

After implementation, verify:
- [ ] All major routes have loading.tsx
- [ ] All major routes have error.tsx
- [ ] Dynamic routes have not-found.tsx
- [ ] Error messages are user-friendly
- [ ] Technical details available for debugging
- [ ] Navigation options always available
- [ ] Consistent styling with shadcn/ui
- [ ] Console errors logged for debugging
- [ ] No "stuck" states (user can always navigate away)

## Automated Testing (Future Enhancement)

Consider adding:
- E2E tests with Playwright/Cypress for boundary flows
- Unit tests for error boundary components
- Integration tests for error propagation
- Visual regression tests for loading states

## Documentation

After testing, ensure:
- [ ] `docs/routing.md` is up to date
- [ ] This testing guide reflects actual implementation
- [ ] Team is aware of new boundaries
- [ ] Error monitoring service is configured (future)
