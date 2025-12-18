import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Check if users already exist
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('✅ Database already seeded. Skipping...');
    return;
  }

  // Create first admin user (john@doe.com - for testing)
  const hashedPasswordAdmin = await bcrypt.hash('johndoe123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'john@doe.com',
      password: hashedPasswordAdmin,
      name: 'Admin',
      role: 'admin',
      isFirstUser: true,
    },
  });
  console.log('✅ Admin user created:', adminUser.email);

  // Create sample participants
  const hashedPasswordParticipant = await bcrypt.hash('participante123', 10);
  const participant1 = await prisma.user.create({
    data: {
      email: 'maria@exemplo.com',
      password: hashedPasswordParticipant,
      name: 'Maria Silva',
      role: 'participant',
    },
  });
  console.log('✅ Participant 1 created:', participant1.email);

  const participant2 = await prisma.user.create({
    data: {
      email: 'joao@exemplo.com',
      password: hashedPasswordParticipant,
      name: 'João Santos',
      role: 'participant',
    },
  });
  console.log('✅ Participant 2 created:', participant2.email);

  const participant3 = await prisma.user.create({
    data: {
      email: 'ana@exemplo.com',
      password: hashedPasswordParticipant,
      name: 'Ana Costa',
      role: 'participant',
    },
  });
  console.log('✅ Participant 3 created:', participant3.email);

  // Create a sample active book
  const startDate = new Date();
  const book = await prisma.book.create({
    data: {
      title: 'O Peregrino',
      author: 'John Bunyan',
      totalChapters: 12,
      durationWeeks: 4,
      startDate: startDate,
      meetingDates: [
        new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        new Date(startDate.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      ],
      isActive: true,
    },
  });
  console.log('✅ Book created:', book.title);

  // Create chapters for the book (12 chapters, 4 weeks = 3 chapters per week)
  const chaptersPerWeek = Math.ceil(book.totalChapters / book.durationWeeks);
  const chapters = [];
  for (let i = 1; i <= book.totalChapters; i++) {
    const weekNumber = Math.ceil(i / chaptersPerWeek);
    const chapter = await prisma.chapter.create({
      data: {
        bookId: book.id,
        chapterNumber: i,
        weekNumber: weekNumber,
      },
    });
    chapters.push(chapter);
  }
  console.log(`✅ ${chapters.length} chapters created`);

  // Create reading progress for participants
  // Maria has read 6 chapters (first 2 weeks)
  for (let i = 0; i < 6; i++) {
    await prisma.readingProgress.create({
      data: {
        userId: participant1.id,
        chapterId: chapters[i].id,
        isRead: true,
        readAt: new Date(),
      },
    });
  }
  console.log('✅ Reading progress created for Maria');

  // João has read 9 chapters (3 weeks)
  for (let i = 0; i < 9; i++) {
    await prisma.readingProgress.create({
      data: {
        userId: participant2.id,
        chapterId: chapters[i].id,
        isRead: true,
        readAt: new Date(),
      },
    });
  }
  console.log('✅ Reading progress created for João');

  // Ana has read 3 chapters (1 week)
  for (let i = 0; i < 3; i++) {
    await prisma.readingProgress.create({
      data: {
        userId: participant3.id,
        chapterId: chapters[i].id,
        isRead: true,
        readAt: new Date(),
      },
    });
  }
  console.log('✅ Reading progress created for Ana');

  // Create a check-in for Maria (week 1)
  await prisma.checkIn.create({
    data: {
      userId: participant1.id,
      bookId: book.id,
      weekNumber: 1,
      reflection1: 'A jornada de Cristão me lembrou que a vida espiritual é uma caminhada contínua.',
      reflection2: 'Fui confrontada com a importância de perseverar mesmo quando o caminho parece difícil.',
    },
  });
  console.log('✅ Check-in created for Maria');

  // Create a pastoral message from admin
  await prisma.message.create({
    data: {
      authorId: adminUser.id,
      content: 'Olá, queridos! Que alegria ter vocês nessa jornada. Lembrem-se: não há pressa. Cada capítulo traz uma reflexão valiosa. Sigamos juntos com paciência e constância. 📖✨',
    },
  });
  console.log('✅ Welcome message created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
