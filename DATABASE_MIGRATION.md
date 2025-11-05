# Database Migration - Add Session Name

## Migration SQL

Run this SQL in your Supabase SQL Editor to add the `session_name` field:

```sql
-- Add session_name column to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_name TEXT DEFAULT 'Planning Session';

-- Update existing sessions to have a default name
UPDATE sessions SET session_name = 'Planning Session' WHERE session_name IS NULL;
```

This migration adds:
- `session_name` field to store a human-readable name for each session
- Default value of "Planning Session" for new sessions
- Updates existing sessions to have the default name

## Rollback (if needed)

If you need to remove this field:

```sql
ALTER TABLE sessions DROP COLUMN IF EXISTS session_name;
```
