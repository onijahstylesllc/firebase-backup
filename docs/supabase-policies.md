# Supabase Row-Level Security (RLS) Policies

This document describes the Row-Level Security policies implemented for all Supabase tables used in the application, along with migration instructions.

## Overview

Row-Level Security (RLS) is enabled on all tables to ensure that users can only access their own data. This provides a robust security layer that prevents unauthorized access at the database level.

## Tables and Policies

### 1. Documents (`documents`)

**Location:** `supabase/policies/documents_rls.sql`

**Policies:**
- `users_select_own_documents` - Users can view only their own documents
- `users_insert_own_documents` - Users can create documents associated with their account
- `users_update_own_documents` - Users can update only their own documents
- `users_delete_own_documents` - Users can delete only their own documents

**Access Pattern:** Scoped by `auth.uid() = user_id`

### 2. AI Messages (`ai_messages`)

**Location:** `supabase/policies/ai_messages_rls.sql`

**Policies:**
- `users_select_own_ai_messages` - Users can view messages in their threads
- `users_insert_own_ai_messages` - Users can create messages in their threads
- `users_update_own_ai_messages` - Users can update messages in their threads
- `users_delete_own_ai_messages` - Users can delete messages in their threads

**Access Pattern:** Scoped by checking thread ownership via `ai_memory_threads.user_id = auth.uid()`

**Note:** Messages are tied to threads, so access is controlled through the thread's `user_id`.

### 3. AI Memory Threads (`ai_memory_threads`)

**Location:** `supabase/policies/ai_memory_threads_rls.sql`

**Policies:**
- `users_select_own_memory_threads` - Users can view only their own threads
- `users_insert_own_memory_threads` - Users can create threads for their account
- `users_update_own_memory_threads` - Users can update only their own threads
- `users_delete_own_memory_threads` - Users can delete only their own threads

**Access Pattern:** Scoped by `auth.uid() = user_id`

### 4. Activity (`activity`)

**Location:** `supabase/policies/activity_rls.sql`

**Policies:**
- `users_select_own_activity` - Users can view only their own activity
- `users_insert_own_activity` - Users can create activity records for their account
- `users_update_own_activity` - Users can update only their own activity
- `users_delete_own_activity` - Users can delete only their own activity

**Access Pattern:** Scoped by `auth.uid() = user_id`

### 5. Usage (`usage`)

**Location:** `supabase/policies/usage_rls.sql`

**Policies:**
- `users_select_own_usage` - Users can view their own usage data
- `users_insert_own_usage` - Users can create usage records for their account
- `users_update_own_usage` - Users can update their own usage data
- `users_delete_own_usage` - Users can delete their own usage data

**Access Pattern:** Scoped by `auth.uid() = user_id`

**Legacy File:** `setup_usage_table.sql` (includes table creation and basic SELECT policy)

### 6. Profiles (`profiles`)

**Location:** `supabase/policies/profiles_rls.sql`

**Policies:**
- `users_select_own_profile` - Users can view their own profile
- `users_insert_own_profile` - Users can create their own profile
- `users_update_own_profile` - Users can update their own profile
- `users_delete_own_profile` - Users can delete their own profile

**Access Pattern:** Scoped by `auth.uid() = id`

**Legacy File:** `profiles_rls_policy.sql` (includes basic SELECT policy)

## Migration Instructions

### Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

### Applying Policies

You have several options to apply these policies:

#### Option 1: Using Supabase CLI (Recommended)

Apply all policies at once:

```bash
# Apply each policy file
supabase db push --include supabase/policies/documents_rls.sql
supabase db push --include supabase/policies/ai_messages_rls.sql
supabase db push --include supabase/policies/ai_memory_threads_rls.sql
supabase db push --include supabase/policies/activity_rls.sql
supabase db push --include supabase/policies/usage_rls.sql
supabase db push --include supabase/policies/profiles_rls.sql
```

#### Option 2: Using Supabase Dashboard

1. Log into your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste each policy file's contents
4. Execute the SQL for each table

#### Option 3: Create a Migration

Create a single migration file that includes all policies:

```bash
# Create a new migration
supabase migration new enable_rls_policies

# Copy all policy files into the migration
cat supabase/policies/*.sql > supabase/migrations/[timestamp]_enable_rls_policies.sql

# Apply the migration
supabase db push
```

### Verification

After applying the policies, verify they are active:

```sql
-- Check if RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('documents', 'ai_messages', 'ai_memory_threads', 'activity', 'usage', 'profiles');

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

Expected result: All tables should have `rowsecurity = true` and each should have 4 policies (SELECT, INSERT, UPDATE, DELETE).

## Security Considerations

### Client-Side vs Server-Side Keys

**Client-Side Code** (Browser/React Components):
- **Always use:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- RLS policies automatically protect data
- Users can only access their own rows through `auth.uid()`

**Server-Side Code** (Edge Functions, API Routes):
- **Use:** `SUPABASE_SERVICE_ROLE_KEY` (when needed)
- Service role key **bypasses RLS**
- Only use when you need to perform administrative operations
- Never expose service role key to the client

### Environment Variables

Required environment variables:

```bash
# Client-side (required in .env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Server-side only (for Edge Functions)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:** The service role key is automatically available to Supabase Edge Functions through environment variables. You do not need to set it manually.

### Testing RLS Policies

Test that RLS is working correctly:

```javascript
// Should succeed - user accessing their own data
const { data, error } = await supabase
  .from('documents')
  .select('*')
  
// Should return empty - user trying to access others' data
const { data, error } = await supabase
  .from('documents')
  .select('*')
  .eq('user_id', 'some-other-user-id')
```

## Supabase Edge Function

### Location
`supabase/functions/summarize-and-archive/index.ts`

### Environment Variables
The Edge Function correctly reads credentials from environment variables:
- `SUPABASE_URL` - Automatically set by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically set by Supabase

### Shared Modules
Shared logic is placed in `supabase/functions/_shared/` to ensure:
- No imports from `src/` directory (which isn't available in Edge Functions)
- Deployment-safe modules compatible with Deno runtime
- Reusable across multiple Edge Functions

### Deploying Edge Functions

```bash
# Deploy the edge function
supabase functions deploy summarize-and-archive

# Test the function
supabase functions invoke summarize-and-archive --body '{"documentId":"test-id"}'
```

## Troubleshooting

### Issue: Policies not working
**Solution:** Ensure RLS is enabled with `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`

### Issue: Users can't access their own data
**Solution:** Verify the `auth.uid()` matches the `user_id` column in your table

### Issue: Edge Function fails with import errors
**Solution:** Ensure you're only importing from:
- Deno-compatible ESM URLs (e.g., `https://esm.sh/...`)
- Local `_shared` directory
- Never import from `src/` directory

### Issue: Service role key not found
**Solution:** In Edge Functions, environment variables are automatically provided by Supabase. Use `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`

## Best Practices

1. **Always use parameterized queries** to prevent SQL injection
2. **Test policies thoroughly** with different user accounts
3. **Use the principle of least privilege** - only grant necessary permissions
4. **Audit policies regularly** as your application evolves
5. **Never expose service role keys** to client-side code
6. **Use transactions** when performing multiple related operations
7. **Monitor query performance** - complex RLS policies can impact performance
8. **Document policy changes** when modifying security rules

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
