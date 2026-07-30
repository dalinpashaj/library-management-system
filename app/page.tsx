import Link from "next/link";
import { BookOpen, Search, Sparkles } from "lucide-react";

// Kept in sync with COMMON_GENRES in components/BookForm.tsx — duplicated rather than
// imported so this page doesn't touch that component's file at all.
const COMMON_GENRES = [
  "Fantasy", "Science Fiction", "Mystery", "Thriller", "Romance",
  "Historical Fiction", "Literary Fiction", "Horror", "Biography",
  "Non-Fiction", "Self-Help", "Technology", "Classic", "Dystopian", "Other",
];

const FEATURES = [
  {
    icon: BookOpen,
    title: "Track Your Books",
    desc: "Keep a reading list with statuses: Want to Read, Reading, or Completed.",
  },
  {
    icon: Search,
    title: "Organize & Filter",
    desc: "Filter by genre, author, or reading status to find exactly what you need.",
  },
  {
    icon: Sparkles,
    title: "AI Query Agent",
    desc: "Ask natural-language questions about the library and get instant answers.",
  },
];

const QUOTES = [
  { text: "A reader lives a thousand lives before he dies.", author: "George R.R. Martin" },
  { text: "Books are a uniquely portable magic.", author: "Stephen King" },
  { text: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
  { text: "Once you learn to read, you will be forever free.", author: "Frederick Douglass" },
];

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-ink via-accent-dark to-accent flex min-h-[520px] flex-col items-center justify-center gap-8 px-4 py-24 text-center sm:flex-row">
        <div className="flex flex-col items-center">
          <h1 className="max-w-2xl font-heading text-4xl font-bold text-white sm:text-5xl">
            Library Management System
          </h1>
          <p className="mt-4 max-w-xl text-lg text-cream/90">
            Track your reading list, manage your personal book collection, and discover insights
            about your library.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/login" className="btn-primary text-base px-6 py-3">
              Sign In
            </Link>
            <Link href="/register" className="btn-secondary text-base px-6 py-3">
              Create Account
            </Link>
          </div>
        </div>

        <div className="hidden items-end gap-1 sm:flex" aria-hidden="true">
          <div className="h-[140px] w-8 -rotate-6 rounded-sm bg-cream" />
          <div className="h-[175px] w-8 rounded-sm bg-status-reading" />
          <div className="h-[125px] w-8 rotate-3 rounded-sm bg-status-want" />
          <div className="h-[195px] w-8 rounded-sm bg-status-completed" />
          <div className="h-[105px] w-8 -rotate-3 rounded-sm bg-cream" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-heading text-2xl font-bold text-ink text-center mb-2">Browse by Genre</h2>
        <p className="text-sm text-muted text-center mb-8">
          Create a free account to start building your own shelf.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {COMMON_GENRES.map((genre) => (
            <Link
              key={genre}
              href="/register"
              className="inline-flex items-center justify-center rounded-full border border-divider bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent"
            >
              {genre}
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 border-t border-divider">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card shadow-md hover:shadow-lg transition-shadow text-left">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-semibold text-ink mb-1">{f.title}</h3>
              <p className="text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUOTES.map((q) => (
            <blockquote key={q.author} className="text-center">
              <p className="font-heading text-lg text-ink">&ldquo;{q.text}&rdquo;</p>
              <footer className="mt-3 text-sm font-medium text-muted">— {q.author}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <footer className="border-t border-divider bg-white py-8 text-center">
        <p className="font-heading text-sm font-semibold text-ink">LibraryMS</p>
        <p className="mt-1 text-xs text-muted">
          Your personal library, organized and always within reach.
        </p>
      </footer>
    </div>
  );
}
