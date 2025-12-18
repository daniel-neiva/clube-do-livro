import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting mock data seed...');

    // Create a fake participant user
    const hashedPassword = await bcrypt.hash('participante123', 10);
    const participant = await prisma.user.upsert({
        where: { email: 'maria.silva@exemplo.com' },
        update: {},
        create: {
            email: 'maria.silva@exemplo.com',
            password: hashedPassword,
            name: 'Maria Silva',
            role: 'participant',
        },
    });
    console.log('✅ Participant created:', participant.email);

    // Create a book: "O Peregrino" - 12 chapters over 4 weeks
    const startDate = new Date();
    const book = await prisma.book.upsert({
        where: { id: 'mock-book-peregrino' },
        update: {},
        create: {
            id: 'mock-book-peregrino',
            title: 'O Peregrino',
            author: 'John Bunyan',
            totalChapters: 12,
            durationWeeks: 4,
            startDate: startDate,
            meetingDates: [
                new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
                new Date(startDate.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(),
            ],
            isActive: true,
        },
    });
    console.log('✅ Book created:', book.title);

    // Create 12 chapters (3 per week)
    const chaptersPerWeek = 3;
    for (let i = 1; i <= 12; i++) {
        const weekNumber = Math.ceil(i / chaptersPerWeek);
        await prisma.chapter.upsert({
            where: {
                bookId_chapterNumber: {
                    bookId: book.id,
                    chapterNumber: i,
                },
            },
            update: {},
            create: {
                bookId: book.id,
                chapterNumber: i,
                weekNumber: weekNumber,
            },
        });
    }
    console.log('✅ 12 chapters created (3 per week)');

    // Create reading progress for Maria - she has read 6 chapters (weeks 1-2)
    const chapters = await prisma.chapter.findMany({
        where: { bookId: book.id },
        orderBy: { chapterNumber: 'asc' },
    });

    for (let i = 0; i < 6; i++) {
        await prisma.readingProgress.upsert({
            where: {
                userId_chapterId: {
                    userId: participant.id,
                    chapterId: chapters[i].id,
                },
            },
            update: {},
            create: {
                userId: participant.id,
                chapterId: chapters[i].id,
                isRead: true,
                readAt: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
            },
        });
    }
    console.log('✅ Reading progress: Maria read 6/12 chapters');

    // Create a check-in for Maria (week 1)
    await prisma.checkIn.upsert({
        where: {
            userId_bookId_weekNumber: {
                userId: participant.id,
                bookId: book.id,
                weekNumber: 1,
            },
        },
        update: {},
        create: {
            userId: participant.id,
            bookId: book.id,
            weekNumber: 1,
            reflection1: 'A jornada de Cristão me lembrou que a vida espiritual é uma caminhada contínua. Cada obstáculo representa os desafios que enfrentamos no dia a dia.',
            reflection2: 'Fui confrontada com a importância de perseverar mesmo quando o caminho parece difícil. A cena do Pântano do Desânimo foi muito marcante.',
        },
    });
    console.log('✅ Check-in created for week 1');

    // Create a pastoral message from admin
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (admin) {
        await prisma.message.create({
            data: {
                authorId: admin.id,
                content: 'Olá, queridos! Que alegria ter vocês nessa jornada de leitura. Lembrem-se: não há pressa. Cada capítulo traz uma reflexão valiosa. Sigamos juntos com paciência e constância. 📖✨',
            },
        });
        console.log('✅ Pastoral message created');
    }

    console.log('\n🎉 Mock data created successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Participant: maria.silva@exemplo.com (senha: participante123)');
    console.log('   - Book: O Peregrino (12 chapters, 4 weeks)');
    console.log('   - Progress: 6/12 chapters read');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
