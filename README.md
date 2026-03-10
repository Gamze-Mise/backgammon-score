# Backgammon Scoreboard

Two-player backgammon score tracker. The loser confirms each result with their password. Points: normal 1, gammon 2, backgammon 3.

**Stack:** Next.js (App Router), Neon Postgres, Drizzle ORM, bcryptjs, Tailwind CSS, TypeScript.

---

## Setup

### Database (Neon)

1. Create a project at [neon.tech](https://neon.tech) and copy the pooled connection string.
2. In the SQL Editor, run:

```sql
CREATE TABLE IF NOT EXISTS "players" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "must_change_password" boolean NOT NULL DEFAULT true,
  "password_hash" text
);

CREATE TABLE IF NOT EXISTS "games" (
  "id" serial PRIMARY KEY,
  "winner_id" text NOT NULL REFERENCES "players"("id"),
  "loser_id" text NOT NULL REFERENCES "players"("id"),
  "is_mars" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "result_type" text NOT NULL DEFAULT 'normal'
);
```

3. Set `DATABASE_URL` in `.env.local` (see `.env.example`).

On first load the app inserts two players (`player1`, `player2`) if the table is empty.

### Local run

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy (Vercel)

Import the repo, add `DATABASE_URL`, deploy. Tables must already exist in Neon.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/players` | List players (id, name, mustChangePassword) |
| PATCH | `/api/players/[id]` | Update name. Body: `{ "name": "..." }`. Id: `player1` or `player2`. |
| PATCH | `/api/players/[id]/password` | Change password. Body: `{ "currentPassword", "newPassword" }`. |
| GET | `/api/games` | List games (last 100) |
| POST | `/api/games` | Create game. Body: winnerId, loserId, resultType, approverId, password. |
| DELETE | `/api/games` | Remove last game |
| GET | `/api/stats` | Aggregated stats (wins, gammons, backgammons, points, losses per player) |

Scoring: normal = 1 pt, gammon = 2 pts, backgammon = 3 pts. First-time password is `12345`; user is prompted to change it once after saving a game.

---

## Schema (reference)

**players:** `id` (text PK), `name`, `created_at`, `must_change_password`, `password_hash`  
**games:** `id` (serial PK), `winner_id`, `loser_id` (FK → players), `is_mars`, `created_at`, `result_type` (`'normal'|'gammon'|'backgammon'`)

GIFs: `src/lib/gifs.ts`. Player names: update in DB or via PATCH above.
