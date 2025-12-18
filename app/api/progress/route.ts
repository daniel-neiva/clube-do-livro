import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Toggle chapter read status
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { chapterId, isRead } = body;

    if (!chapterId) {
      return NextResponse.json({ error: 'ID do capítulo é obrigatório' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Check if progress record exists
    const existingProgress = await prisma.readingProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });

    let progress;
    if (existingProgress) {
      // Update existing progress
      progress = await prisma.readingProgress.update({
        where: { id: existingProgress.id },
        data: {
          isRead: isRead,
          readAt: isRead ? new Date() : null,
        },
      });
    } else {
      // Create new progress record
      progress = await prisma.readingProgress.create({
        data: {
          userId,
          chapterId,
          isRead: isRead,
          readAt: isRead ? new Date() : null,
        },
      });
    }

    return NextResponse.json({ progress, message: 'Progresso atualizado!' });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Erro ao atualizar progresso' }, { status: 500 });
  }
}
