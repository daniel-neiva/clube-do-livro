import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Chapter } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const activeBook = await prisma.book.findFirst({
      where: { isActive: true },
      include: {
        chapters: {
          orderBy: { chapterNumber: 'asc' },
        },
      },
    });

    if (!activeBook) {
      return NextResponse.json({ book: null });
    }

    // Get user's reading progress
    const userId = (session.user as any).id;
    const progress = await prisma.readingProgress.findMany({
      where: {
        userId: userId,
        chapter: {
          bookId: activeBook.id,
        },
      },
      include: {
        chapter: true,
      },
    });

    // Group chapters by week
    const chaptersByWeek: { [key: number]: any[] } = {};
    activeBook.chapters.forEach((chapter: Chapter) => {
      if (!chaptersByWeek[chapter.weekNumber]) {
        chaptersByWeek[chapter.weekNumber] = [];
      }
      const progressItem = progress.find((p) => p.chapterId === chapter.id);
      chaptersByWeek[chapter.weekNumber].push({
        ...chapter,
        isRead: progressItem?.isRead || false,
        progressId: progressItem?.id,
      });
    });

    // Calculate progress percentage
    const totalChapters = activeBook.chapters.length;
    const readChapters = progress.filter((p) => p.isRead).length;
    const progressPercentage = totalChapters > 0 ? Math.round((readChapters / totalChapters) * 100) : 0;

    // Calculate current week
    const now = new Date();
    const startDate = new Date(activeBook.startDate);
    const weeksPassed = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const currentWeek = Math.min(Math.max(weeksPassed + 1, 1), activeBook.durationWeeks);

    // Calculate expected chapters read
    const chaptersPerWeek = Math.ceil(activeBook.totalChapters / activeBook.durationWeeks);
    const expectedChaptersRead = Math.min(currentWeek * chaptersPerWeek, activeBook.totalChapters);

    // Determine status
    let status = 'Em dia';
    if (readChapters > expectedChaptersRead) {
      status = 'Adiantado';
    } else if (readChapters < expectedChaptersRead - 2) {
      status = 'Um pouco atrasado';
    }

    return NextResponse.json({
      book: activeBook,
      chaptersByWeek,
      progressPercentage,
      readChapters,
      totalChapters,
      currentWeek,
      status,
    });
  } catch (error) {
    console.error('Error fetching active book:', error);
    return NextResponse.json({ error: 'Erro ao buscar livro ativo' }, { status: 500 });
  }
}
