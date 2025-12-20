import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Get all books where user has reading progress
        const booksWithProgress = await prisma.book.findMany({
            where: {
                chapters: {
                    some: {
                        readingProgress: {
                            some: {
                                userId: userId,
                            },
                        },
                    },
                },
            },
            include: {
                chapters: {
                    include: {
                        readingProgress: {
                            where: {
                                userId: userId,
                            },
                        },
                    },
                    orderBy: {
                        chapterNumber: 'asc',
                    },
                },
            },
            orderBy: {
                startDate: 'desc',
            },
        });

        const history = booksWithProgress.map((book) => {
            const totalChapters = book.chapters.length;
            const readChapters = book.chapters.filter(
                (ch) => ch.readingProgress.some((p) => p.isRead)
            ).length;

            // Get first and last read dates
            const readDates = book.chapters
                .flatMap((ch) => ch.readingProgress)
                .filter((p) => p.isRead && p.readAt)
                .map((p) => new Date(p.readAt!))
                .sort((a, b) => a.getTime() - b.getTime());

            const firstReadDate = readDates[0] || null;
            const lastReadDate = readDates[readDates.length - 1] || null;

            // Calculate reading duration in days
            let readingDurationDays = 0;
            if (firstReadDate && lastReadDate) {
                readingDurationDays = Math.ceil(
                    (lastReadDate.getTime() - firstReadDate.getTime()) / (1000 * 60 * 60 * 24)
                );
            }

            const progressPercentage = totalChapters > 0
                ? Math.round((readChapters / totalChapters) * 100)
                : 0;

            const isCompleted = readChapters === totalChapters && totalChapters > 0;

            return {
                id: book.id,
                title: book.title,
                author: book.author,
                totalChapters,
                readChapters,
                progressPercentage,
                isCompleted,
                isActive: book.isActive,
                startDate: book.startDate,
                firstReadDate,
                lastReadDate,
                readingDurationDays,
            };
        });

        // Sort: active first, then completed, then by last read date
        history.sort((a, b) => {
            if (a.isActive && !b.isActive) return -1;
            if (!a.isActive && b.isActive) return 1;
            if (a.isCompleted && !b.isCompleted) return -1;
            if (!a.isCompleted && b.isCompleted) return 1;
            return (b.lastReadDate?.getTime() || 0) - (a.lastReadDate?.getTime() || 0);
        });

        return NextResponse.json(history);
    } catch (error) {
        console.error('Error fetching reading history:', error);
        return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 });
    }
}
