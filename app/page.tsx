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
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1920&q=80"
            alt="Rows of books on warmly lit library shelves"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/35" />
        </div>
        <div className="relative flex min-h-[520px] flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="max-w-2xl font-serif text-4xl font-bold text-white sm:text-5xl">
            Library Management System
          </h1>
          <p className="mt-4 max-w-xl text-lg text-gray-100">
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
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Browse by Genre</h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          Create a free account to start building your own shelf.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {COMMON_GENRES.map((genre) => (
            <Link key={genre} href="/register" className="chip">
              {genre}
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 border-t border-gray-100">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card shadow-md hover:shadow-lg transition-shadow text-left">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUOTES.map((q) => (
            <blockquote key={q.author} className="text-center">
              <p className="font-serif text-lg text-gray-700">&ldquo;{q.text}&rdquo;</p>
              <footer className="mt-3 text-sm font-medium text-gray-500">— {q.author}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-8 text-center">
        <p className="text-sm font-semibold text-gray-900">LibraryMS</p>
        <p className="mt-1 text-xs text-gray-500">
          Your personal library, organized and always within reach.
        </p>
      </footer>
    </div>
  );
}
