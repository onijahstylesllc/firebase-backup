# Supabase RLS Policies

This directory contains Row-Level Security (RLS) policy definitions for all Supabase tables used in the application.

## Files

- `documents_rls.sql` - RLS policies for the documents table
- `ai_messages_rls.sql` - RLS policies for the ai_messages table
- `ai_memory_threads_rls.sql` - RLS policies for the ai_memory_threads table
- `activity_rls.sql` - RLS policies for the activity table
- `usage_rls.sql` - RLS policies for the usage table
- `profiles_rls.sql` - RLS policies for the profiles table

## Policy Naming Convention

Policies follow the naming pattern: `users_{operation}_own_{table_name}`

For example:
- `users_select_own_documents`
- `users_insert_own_activity`
- `users_update_own_profiles`

## Applying Policies

See the main documentation at `/docs/supabase-policies.md` for detailed instructions on applying these policies to your Supabase database.

## Policy Structure

Each policy file includes:
1. RLS enablement statement
2. DROP POLICY IF EXISTS statements (for idempotency)
3. Four policies per table:
   - SELECT (read access)
   - INSERT (create access)
   - UPDATE (modify access)
   - DELETE (remove access)

All policies are scoped to `authenticated` users and use `auth.uid()` to match the user's ID.
