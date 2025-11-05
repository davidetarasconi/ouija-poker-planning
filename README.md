# 🔮 Ouija Poker Planning

A collaborative planning poker application with a mystical Ouija board twist! Team members estimate story points by moving their cursors toward their preferred values, with two unique modes for collaborative estimation.

![Ouija Poker Planning](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green)

## ✨ Features

### 🎯 Two Estimation Modes

1. **Voting Mode** - Each team member moves their cursor to their preferred story point value, and the card shows the weighted average of all votes
2. **Ouija Mode** - Like a real Ouija board! All team members collaboratively control the story card together by clicking and dragging

### 🎲 Key Capabilities

- **Real-time Collaboration** - See all team members' cursors moving in real-time
- **Fibonacci Story Points** - Uses the standard Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21
- **Simple Session Management** - Create sessions with unique IDs or join existing ones
- **User Story Editing** - Any team member can edit the current user story name
- **Vote Reset** - Clear all votes and start fresh with one click
- **Live Results** - See vote distribution across all Fibonacci values
- **No Login Required** - Just enter your name and start estimating!

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A free Supabase account (takes 2 minutes to create)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ouija-poker-planning
npm install
```

### 2. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose any name and set a database password)
3. Wait for the project to initialize (~2 minutes)

### 3. Configure Database

In your Supabase project dashboard, go to **SQL Editor** and run this SQL:

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

### 4. Get Your API Keys

1. In Supabase, go to **Settings** → **API**
2. Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy your **anon/public key** (a long string)

### 5. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser! 🎉

## 📖 How to Use

### Creating a Session

1. Open the app and enter your name
2. Click **"Create New Session"**
3. Share the session ID with your team

### Joining a Session

1. Open the app and enter your name
2. Click **"Join Session"**
3. Enter the session ID provided by your team
4. Click **"Join Session"**

### Voting Mode 🗳️

- Move your cursor around the board toward your preferred story point value
- Your vote updates automatically as you move
- The white card shows the average of all team votes
- See everyone's votes in real-time

### Ouija Mode 🔮

- Click and hold on the board to "grab" the card
- Drag it toward your preferred estimate
- Other team members do the same simultaneously
- The card moves based on everyone's input, like a real Ouija board!

### Controls

- **Story Name** - Click the story title to edit it
- **Mode Toggle** - Switch between Voting and Ouija modes
- **Reset** - Clear all votes and reset the card position

## 🏗️ Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Supabase Realtime** - Real-time database and subscriptions
- **UUID** - Unique session and user IDs

## 🎨 Project Structure

```
ouija-poker-planning/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page (session join)
│   ├── session/[id]/
│   │   └── page.tsx            # Session page (planning board)
│   └── globals.css             # Global styles
├── components/
│   ├── PlanningBoard.tsx       # Main planning board component
│   └── SessionJoin.tsx         # Session creation/join component
├── hooks/
│   └── useSession.ts           # Custom hook for session management
├── lib/
│   └── supabase.ts             # Supabase client configuration
├── types/
│   └── index.ts                # TypeScript type definitions
├── .env.local.example          # Environment variables template
├── SETUP.md                    # Detailed setup instructions
└── README.md                   # This file
```

## 🚀 Deployment

### Deploy to Vercel (Free)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your environment variables in Vercel settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests

## 📝 License

MIT License - feel free to use this for your team's planning sessions!

## 🎯 Future Ideas

- [ ] Save session history
- [ ] Export results to CSV/JSON
- [ ] Add custom story point sequences (T-shirt sizes, etc.)
- [ ] Session moderator role
- [ ] Timer for estimation rounds
- [ ] Dark/light theme toggle
- [ ] Mobile touch support optimization
- [ ] Voice chat integration
- [ ] Anonymous voting option
- [ ] Multiple story cards in queue

## 🙏 Acknowledgments

Built with modern web technologies and a touch of mysticism! Perfect for remote teams who want to add some fun to their sprint planning.

---

Made with 💜 and ✨ for collaborative teams everywhere
