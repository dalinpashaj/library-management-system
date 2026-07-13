import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Library Management System</h1>
        <p className="text-lg text-gray-600 mb-8">
          Track your reading list, manage your personal book collection, and discover insights
          about your library.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="btn-primary text-base px-6 py-3">
            Sign In
          </Link>
          <Link href="/register" className="btn-secondary text-base px-6 py-3">
            Create Account
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            {
              icon: "📚",
              title: "Track Your Books",
              desc: "Keep a reading list with statuses: Want to Read, Reading, or Completed.",
            },
            {
              icon: "🔍",
              title: "Organize & Filter",
              desc: "Filter by genre, author, or reading status to find exactly what you need.",
            },
            {
              icon: "🤖",
              title: "AI Query Agent",
              desc: "Ask natural-language questions about the library and get instant answers.",
            },
          ].map((f) => (
            <div key={f.title} className="card">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
