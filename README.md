# CareLink — NDIS Support Platform (PoC)

A full-stack web application for NDIS participants and support workers. Built with Next.js 14, Supabase, and a Groq AI assistant.

> **Demo mode** — This is a proof of concept using fictional seed data. Do not use with real participant information.

---

## Tech stack

- **Framework**: Next.js 14 (App Router)
- **Database + Auth**: Supabase (Postgres + Row-Level Security)
- **Styling**: Tailwind CSS + Instrument Sans / Lora fonts
- **AI**: Groq API (`llama-3.3-70b-versatile`) via a server-side proxy
- **Deployment**: Vercel-compatible

---

## Quick start

### 1. Clone and install

```bash
git clone <repo-url>
cd carelink
npm install
```

### 2. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** to get your URL and keys

### 3. Set environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
PROVIDER=groq
```

Get a Groq API key at [console.groq.com](https://console.groq.com) (free tier available).

### 4. Set up the database

In your Supabase project → **SQL Editor**, run:

```sql
-- Paste contents of supabase/schema.sql
```

### 5. Create demo auth users

In Supabase → **Authentication → Users**, create these users manually (or use the Supabase CLI):

| Email | Password | Role |
|-------|----------|------|
| `jordan@carelink.demo` | `Demo1234!` | worker |
| `sam@carelink.demo` | `Demo1234!` | worker |
| `aisha@carelink.demo` | `Demo1234!` | participant |
| `marcus@carelink.demo` | `Demo1234!` | participant |
| `priya@carelink.demo` | `Demo1234!` | participant |

After creating users, copy their UUIDs from the Users table.

### 6. Run the seed data

Edit `supabase/seed.sql` — replace the placeholder UUIDs at the top of the `do $$ declare` block with the actual auth user UUIDs from step 5.

Then run the seed SQL in **Supabase SQL Editor**.

### 7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Log in with `jordan@carelink.demo` / `Demo1234!`.

---

## Demo flows

| Flow | How to test |
|------|-------------|
| Worker sees linked participants | Log in as Jordan → Dashboard shows Aisha + Marcus |
| Participant profile tabs | Click any participant → Overview, Manual, Incidents, etc. |
| AI chat — seizure protocol | Chat with Aisha → "What do I do if Aisha has a seizure?" |
| AI chat — dietary check | Chat with Aisha → "Dietary check" quick action |
| Shift note | Chat page → "Help me write a shift note" |
| Worker isolation | Log in as Sam → only Marcus + Priya visible (not Aisha) |

---

## Privacy

See [PRIVACY.md](./PRIVACY.md) for the full privacy posture, what data goes where, AU data sovereignty migration guide, and Australian Privacy Principles compliance gaps.

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for Stage 2 production features including consent flow, worker verification, Ollama migration, and security hardening.

---

## Project structure

```
app/
  (auth)/              Login, register
  (dashboard)/         Authenticated pages (nav + privacy banner)
    dashboard/         Role-aware home
    participants/[id]/ Participant profile (8 sub-pages)
    chat/[id]/         AI assistant
    profile/[id]/edit  Participant self-edit
  api/
    chat/              AI proxy (server-side only)
    participants/      Participant list API
    shift-notes/       Shift notes API

lib/
  ai/                  provider.ts, buildContext.ts, prompts.ts
  supabase/            client.ts (browser), server.ts (SSR + service)

components/            PrivacyBanner, ChatWindow, IncidentCard, etc.
types/database.ts      All TypeScript types
supabase/
  schema.sql           Full database schema + RLS policies
  seed.sql             3 participants + 2 workers with full data
```
