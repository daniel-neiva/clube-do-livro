import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Get active book
    const activeBook = await prisma.book.findFirst({
      where: { isActive: true },
      include: {
        chapters: true,
      },
    });

    if (!activeBook) {
      return NextResponse.json({
        totalParticipants: 0,
        notReadingThisWeek: 0,
        averageProgress: 0,
        activeBook: null,
      });
    }

    // Get all participants with their reading progress
    const participants = await prisma.user.findMany({
      where: { role: 'participant' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const totalParticipants = participants.length;

    // Calculate current week
    const now = new Date();
    const startDate = new Date(activeBook.startDate);
    const weeksPassed = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const currentWeek = Math.min(Math.max(weeksPassed + 1, 1), activeBook.durationWeeks);

    // Get chapters for current week
    const currentWeekChapters = activeBook.chapters.filter(
      (ch) => ch.weekNumber === currentWeek
    );

    // Count participants who haven't read any chapter this week
    let notReadingThisWeek = 0;
    let totalProgress = 0;

    // Build per-user progress data
    const userProgress = [];

    for (const participant of participants) {
      // Check if participant has read any chapter this week
      const readThisWeek = await prisma.readingProgress.count({
        where: {
          userId: participant.id,
          chapterId: {
            in: currentWeekChapters.map((ch) => ch.id),
          },
          isRead: true,
        },
      });

      if (readThisWeek === 0 && currentWeekChapters.length > 0) {
        notReadingThisWeek++;
      }

      // Calculate total progress
      const totalRead = await prisma.readingProgress.count({
        where: {
          userId: participant.id,
          chapter: {
            bookId: activeBook.id,
          },
          isRead: true,
        },
      });

      totalProgress += totalRead;

      // Calculate user's percentage
      const userPercentage = activeBook.totalChapters > 0
        ? Math.round((totalRead / activeBook.totalChapters) * 100)
        : 0;

      userProgress.push({
        id: participant.id,
        name: participant.name || participant.email,
        chaptersRead: totalRead,
        totalChapters: activeBook.totalChapters,
        percentage: userPercentage,
      });
    }

    // Sort by percentage (highest first)
    userProgress.sort((a, b) => b.percentage - a.percentage);

    const averageProgress =
      totalParticipants > 0 && activeBook.totalChapters > 0
        ? Math.round((totalProgress / (totalParticipants * activeBook.totalChapters)) * 100)
        : 0;

    return NextResponse.json({
      totalParticipants,
      notReadingThisWeek,
      averageProgress,
      activeBook: {
        id: activeBook.id,
        title: activeBook.title,
        author: activeBook.author,
        currentWeek,
        totalWeeks: activeBook.durationWeeks,
      },
      userProgress,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
