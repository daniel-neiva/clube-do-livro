import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET count of unread messages (messages after a certain timestamp)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const lastSeenStr = searchParams.get('lastSeen');

        let lastSeen: Date | undefined;
        if (lastSeenStr) {
            lastSeen = new Date(lastSeenStr);
        }

        // If no lastSeen provided, just get the latest message timestamp
        if (!lastSeen) {
            const latestMessage = await prisma.message.findFirst({
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true },
            });

            return NextResponse.json({
                unreadCount: 0,
                latestMessageAt: latestMessage?.createdAt || null,
            });
        }

        // Count messages created after lastSeen
        const unreadCount = await prisma.message.count({
            where: {
                createdAt: { gt: lastSeen },
            },
        });

        const latestMessage = await prisma.message.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
        });

        return NextResponse.json({
            unreadCount,
            latestMessageAt: latestMessage?.createdAt || null,
        });
    } catch (error) {
        console.error('Error checking unread messages:', error);
        return NextResponse.json({ error: 'Erro ao verificar mensagens' }, { status: 500 });
    }
}
