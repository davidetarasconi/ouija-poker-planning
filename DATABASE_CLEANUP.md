# Database Cleanup

If you're getting duplicate key errors during development, you can clean up old sessions in Supabase.

## Option 1: Delete Specific Session

In Supabase SQL Editor, run:

```sql
-- Replace 'SESSION_ID' with the actual session ID from the error
DELETE FROM sessions WHERE id = 'SESSION_ID';
```

The users will be automatically deleted due to the CASCADE constraint.

## Option 2: Clear All Sessions (Development Only!)

**⚠️ WARNING: This will delete ALL sessions and users!**

In Supabase SQL Editor, run:

```sql
-- Delete all sessions (users will cascade)
DELETE FROM sessions;
```

## Option 3: Reset Tables Completely

**⚠️ WARNING: This will delete all data and recreate tables!**

```sql
-- Drop tables
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- Recreate them (use the SQL from SETUP.md)
```

## Why This Happens

During development, if you:
1. Create a session
2. Refresh the page or restart the dev server
3. Try to create the same session again

The session ID might persist in the URL but the client-side state is reset, causing it to try to create a duplicate.

The fix I've pushed should prevent this by properly checking if the session exists before trying to create it.
