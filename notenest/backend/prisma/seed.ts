/**
 * Seeds the database with a demo account and a handful of sample notes,
 * so the app looks alive the first time it's opened instead of showing
 * an empty dashboard.
 *
 * Run with: npm run seed
 * Demo login: demo@notenest.app / password123
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@notenest.app" },
    update: {},
    create: {
      name: "Demo Student",
      email: "demo@notenest.app",
      passwordHash,
    },
  });

  console.log(`Seeded user: ${user.email}`);

  // Clear any previously seeded notes/tags for this user so re-running is idempotent.
  await prisma.note.deleteMany({ where: { authorId: user.id } });
  await prisma.tag.deleteMany({ where: { userId: user.id } });

  const sampleNotes = [
    {
      title: "Welcome to NoteNest 👋",
      content:
        "This is a sample note. Click any note to edit it, use the color dots to re-color it, or the pin icon to keep it at the top.",
      color: "yellow",
      isPinned: true,
      tags: ["getting-started"],
    },
    {
      title: "Data Structures Midterm",
      content:
        "Review: binary search trees, heap operations, hash table collision resolution (chaining vs open addressing). Practice Big-O analysis for each.",
      color: "blue",
      isPinned: true,
      tags: ["school", "cs"],
    },
    {
      title: "Grocery List",
      content: "Eggs, oat milk, spinach, chicken breast, rice, coffee beans, bananas.",
      color: "green",
      isPinned: false,
      tags: ["personal"],
    },
    {
      title: "Project Ideas",
      content:
        "1. Habit tracker with streaks\n2. Markdown-based blog engine\n3. Note-taking app with tags + search (this one!)",
      color: "purple",
      isPinned: false,
      tags: ["ideas", "coding"],
    },
    {
      title: "Book Recommendations",
      content: "Atomic Habits, Deep Work, The Pragmatic Programmer, Clean Architecture.",
      color: "pink",
      isPinned: false,
      tags: ["personal"],
    },
    {
      title: "Archived Note Example",
      content: "This note starts out archived, so you can see how the Archive view works.",
      color: "default",
      isPinned: false,
      isArchived: true,
      tags: [],
    },
  ];

  for (const n of sampleNotes) {
    await prisma.note.create({
      data: {
        title: n.title,
        content: n.content,
        color: n.color,
        isPinned: n.isPinned,
        isArchived: n.isArchived ?? false,
        authorId: user.id,
        tags: n.tags.length
          ? {
              connectOrCreate: n.tags.map((name) => ({
                where: { userId_name: { userId: user.id, name } },
                create: { name, userId: user.id },
              })),
            }
          : undefined,
      },
    });
  }

  console.log(`Seeded ${sampleNotes.length} sample notes.`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
