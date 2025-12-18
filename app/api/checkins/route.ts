import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET check-ins (admin can see all, participants see their own)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    const searchParams = req.nextUrl.searchParams;
    const bookId = searchParams.get('bookId');

    let whereClause: any = {};
    if (bookId) {
      whereClause.bookId = bookId;
    }
    if (userRole !== 'admin') {
      whereClause.userId = userId;
    }

    const checkIns = await prisma.checkIn.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json({ error: 'Erro ao buscar check-ins' }, { status: 500 });
  }
}

// POST create check-in
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { bookId, weekNumber, reflection1, reflection2 } = body;

    if (!bookId || !weekNumber) {
      return NextResponse.json(
        { error: 'ID do livro e número da semana são obrigatórios' },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;

    // Check if check-in already exists
    const existingCheckIn = await prisma.checkIn.findUnique({
      where: {
        userId_bookId_weekNumber: {
          userId,
          bookId,
          weekNumber: parseInt(weekNumber),
        },
      },
    });

    let checkIn;
    if (existingCheckIn) {
      // Update existing check-in
      checkIn = await prisma.checkIn.update({
        where: { id: existingCheckIn.id },
        data: {
          reflection1: reflection1 || null,
          reflection2: reflection2 || null,
        },
      });
    } else {
      // Create new check-in
      checkIn = await prisma.checkIn.create({
        data: {
          userId,
          bookId,
          weekNumber: parseInt(weekNumber),
          reflection1: reflection1 || null,
          reflection2: reflection2 || null,
        },
      });
    }

    return NextResponse.json({ checkIn, message: 'Check-in salvo com sucesso!' });
  } catch (error) {
    console.error('Error creating check-in:', error);
    return NextResponse.json({ error: 'Erro ao salvar check-in' }, { status: 500 });
  }
}
