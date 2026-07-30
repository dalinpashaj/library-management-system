# Library Management System

A full-stack library management system built with Next.js, Prisma, and PostgreSQL. Users track a personal reading list; admins manage the full catalog and user base; an AI Query Agent answers natural-language questions about the library.

**Live demo:** https://library-management-system-jet-eta.vercel.app/

## Features

- **Authentication** — email/password signup and login via NextAuth, passwords hashed with bcrypt.
- **Book management** — add, edit, and delete books, with genre, price, and optional rating and page count.
- **Public book search** — search the Open Library catalog when adding a book to auto-fill title, author, page count, and cover image.
- **Reading progress tracking** — mark a book as Want to Read, Reading, or Completed, log current page, and get a milestone notification when you pass the halfway point.
- **Admin dashboard** — manage all users (promote/demote, delete) and all books across the system, plus library-wide stats (genre and status breakdowns, most active users).
- **AI Query Agent** — ask natural-language questions about the library (e.g. "what are the 5 most expensive books", "who owns the most books", "how many books are in Fantasy"). Answered by a fast rule-based parser, with an optional OpenAI-powered fallback for questions the rules don't cover.
- **Warm editorial UI** — a custom design system (serif headings, warm neutral palette, tonal status badges) applied consistently across the app.

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js with credentials provider, bcrypt password hashing
- **AI:** OpenAI API (optional fallback), regex-based intent parser (primary)
- **External data:** Open Library Search API for book lookup
- **Styling:** Tailwind CSS
- **Testing:** Vitest
- **Deployment:** Vercel (app) + Neon (Postgres)

## Data model

- **User** — name, email, hashed password, role (`user` / `admin`), owns many books.
- **Book** — title, author, genre, price, optional rating, optional total/current page, optional cover image URL, reading status (`want_to_read` / `reading` / `completed`), owned by one user.

## Getting started

### Prerequisites

- Node.js 18+
- Docker Desktop (for local PostgreSQL) or your own PostgreSQL instance

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template and fill in values
cp .env.example .env

# 3. Start a local PostgreSQL database
docker compose up -d db

# 4. Push the schema to the database
npm run db:push

# 5. Seed sample data (optional)
npm run db:seed

# 6. Start the dev server
npm run dev
```

The app runs at `http://localhost:3000`.

### Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Base URL of the app (`http://localhost:3000` for local dev) |
| `NEXTAUTH_SECRET` | Random secret for session encryption — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `OPENAI_API_KEY` | Optional. Enables the LLM fallback in the AI Query Agent. The app works fully without it, using the rule-based parser only. |

## Testing

```bash
npm test              # run the full test suite
npm run test:watch    # watch mode
npm run test:integration
```

## Project structure

```
app/                  Next.js App Router pages and API routes
  api/                 REST endpoints (auth, books, users, ai-query, book-search)
  dashboard/            User-facing book list and forms
  admin/                Admin dashboard and management pages
components/            Reusable React components
lib/                   Business logic (auth, reading progress, AI query parser/executor, Open Library integration)
prisma/                Database schema and seed script
tests/                 Unit and integration tests
```

## Deployment

The app is deployed on Vercel with a managed PostgreSQL database on Neon. Environment variables are configured in the Vercel project settings; `prisma generate` runs automatically on build via the `postinstall` script.

## Author

Dalin Pashaj
