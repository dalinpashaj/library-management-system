import { PrismaClient, Role, ReadingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);
  const userPassword = await bcrypt.hash("user123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@library.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@library.com",
      password: adminPassword,
      role: Role.admin,
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Smith",
      email: "alice@example.com",
      password: userPassword,
      role: Role.user,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob Jones",
      email: "bob@example.com",
      password: userPassword,
      role: Role.user,
    },
  });

  const books = [
    { title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", price: 14.99, rating: 5, totalPages: 310, currentPage: 310, readingStatus: ReadingStatus.completed, ownerId: alice.id },
    { title: "Dune", author: "Frank Herbert", genre: "Science Fiction", price: 18.5, rating: 4, totalPages: 412, currentPage: 250, readingStatus: ReadingStatus.reading, ownerId: alice.id },
    { title: "1984", author: "George Orwell", genre: "Dystopian", price: 12.99, rating: 5, totalPages: 328, currentPage: 328, readingStatus: ReadingStatus.completed, ownerId: alice.id },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classic", price: 10.5, readingStatus: ReadingStatus.want_to_read, ownerId: alice.id },
    { title: "Neuromancer", author: "William Gibson", genre: "Science Fiction", price: 16.75, totalPages: 300, readingStatus: ReadingStatus.want_to_read, ownerId: bob.id },
    { title: "Foundation", author: "Isaac Asimov", genre: "Science Fiction", price: 15.25, rating: 4, totalPages: 255, currentPage: 255, readingStatus: ReadingStatus.completed, ownerId: bob.id },
    { title: "The Name of the Wind", author: "Patrick Rothfuss", genre: "Fantasy", price: 19.99, rating: 3, totalPages: 662, currentPage: 200, readingStatus: ReadingStatus.reading, ownerId: bob.id },
    { title: "Clean Code", author: "Robert C. Martin", genre: "Technology", price: 42.0, rating: 5, totalPages: 464, currentPage: 464, readingStatus: ReadingStatus.completed, ownerId: admin.id },
    // Duplicate title/owner-pair so "most popular book" (most-owned title) has a clear, non-tied answer.
    { title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", price: 14.99, rating: 4, totalPages: 310, readingStatus: ReadingStatus.want_to_read, ownerId: bob.id },
    { title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", price: 13.5, readingStatus: ReadingStatus.completed, ownerId: admin.id },
  ];

  await prisma.book.deleteMany();
  for (const book of books) {
    await prisma.book.create({ data: book });
  }

  console.log("Seed complete.");
  console.log("Admin: admin@library.com / admin123");
  console.log("User:  alice@example.com / user123");
  console.log("User:  bob@example.com   / user123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
