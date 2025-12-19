import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

export async function GET(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { chapters: true }
        }
      }
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, author, totalChapters, durationWeeks, startDate, isActive } = body;

    const numChapters = parseInt(totalChapters);
    const numWeeks = parseInt(durationWeeks);

    // If this book will be active, deactivate others
    if (isActive) {
      await prisma.book.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    // Create book with chapters in a transaction
    const book = await prisma.book.create({
      data: {
        title,
        author,
        totalChapters: numChapters,
        durationWeeks: numWeeks,
        startDate: new Date(startDate),
        meetingDates: [],
        isActive: isActive || false,
        chapters: {
          create: Array.from({ length: numChapters }, (_, i) => ({
            chapterNumber: i + 1,
            weekNumber: Math.ceil((i + 1) / Math.ceil(numChapters / numWeeks)),
          })),
        },
      },
      include: {
        chapters: true,
      },
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
