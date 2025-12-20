import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    // Verify Cron secret if needed (simplified for MVP)
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { return new Response('Unauthorized', { status: 401 }); }

    try {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        // Find participants
        const participants = await prisma.user.findMany({
            where: { role: 'participant' },
            include: {
                readingProgress: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                checkIns: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                comments: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                notifications: {
                    where: { type: 'INACTIVITY' },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        let notifiedCount = 0;

        for (const user of participants) {
            const lastReading = user.readingProgress[0]?.createdAt || new Date(0);
            const lastCheckIn = user.checkIns[0]?.createdAt || new Date(0);
            const lastComment = user.comments[0]?.createdAt || new Date(0);

            const lastActivity = new Date(Math.max(
                lastReading.getTime(),
                lastCheckIn.getTime(),
                lastComment.getTime(),
                user.createdAt.getTime() // Consider sign up date as activity
            ));

            // Check if inactive for > 5 days
            if (lastActivity < fiveDaysAgo) {
                // Check if we already notified recently (e.g., in the last 5 days) to avoid spam
                const lastNotification = user.notifications[0]?.createdAt || new Date(0);

                if (lastNotification < fiveDaysAgo) {
                    await sendNotification({
                        userId: user.id,
                        type: 'INACTIVITY',
                        title: 'Sentimos sua falta! 📖',
                        message: 'Faz alguns dias que não vemos você por aqui. Que tal continuar sua leitura de hoje?',
                    });
                    notifiedCount++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            checked: participants.length,
            notified: notifiedCount
        });
    } catch (error) {
        console.error('Error in inactivity cron:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
