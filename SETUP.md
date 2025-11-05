# Ouija Poker Planning - Setup Instructions

## Quick Start

### 1. Create a Free Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up for free
2. Create a new project (choose any name, set a database password)
3. Wait for the project to be ready (takes ~2 minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy the **anon/public key** (a long string)

### 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and paste your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Set Up Database Tables

Run this SQL in your Supabase SQL Editor (**SQL Editor** in the sidebar):

```sql
-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  story_name TEXT DEFAULT 'User Story',
  mode TEXT DEFAULT 'voting',
  card_x REAL DEFAULT 50,
  card_y REAL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cursor_x REAL DEFAULT 0,
  cursor_y REAL DEFAULT 0,
  vote_value INTEGER,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## How It Works

1. **Create/Join Session**: Enter your name and either create a new session or join an existing one
2. **Voting Mode**: Each user moves their cursor to their preferred story point value
3. **Ouija Mode**: All users collaboratively move the story card together
4. **Story Points**: Uses Fibonacci sequence (1, 2, 3, 5, 8, 13, 21)
5. **Controls**:
   - Edit the user story name
   - Toggle between Voting and Ouija modes
   - Reset all votes

## Free Tier Limits

Supabase free tier includes:
- 500 MB database space
- 200 concurrent realtime connections
- 2 GB bandwidth per month

Perfect for team planning poker! 🎯
