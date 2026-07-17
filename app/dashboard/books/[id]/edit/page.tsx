import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BookForm } from "@/components/BookForm";

export default async function EditBookPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const book = await prisma.book.findUnique({ where: { id: params.id } });

  if (!book) notFound();

  if (book.ownerId !== session.user.id && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Book</h1>
      <BookForm
        bookId={book.id}
        initial={{
          title: book.title,
          author: book.author,
          genre: book.genre,
          price: book.price,
          rating: book.rating,
          readingStatus: book.readingStatus,
        }}
      />
    </div>
  );
}
