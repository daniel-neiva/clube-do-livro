
import { prisma } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789");

type NotificationType = "BOOK" | "MESSAGE" | "INACTIVITY";

interface SendNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
}

export async function sendNotification({ userId, type, title, message }: SendNotificationParams) {
    try {
        // 1. Create In-App Notification
        await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                read: false,
            },
        });

        // 2. Send Email Notification
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        });

        if (user && user.email) {
            // Basic email templates based on type
            let subject = title;
            let html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #EAB308;">Clube do Livro Edificando</h1>
          <h2>${title}</h2>
          <p>Olá, ${user.name || 'Participante'}!</p>
          <p>${message}</p>
          <hr />
          <p style="font-size: 12px; color: #666;">
            Acesse sua conta para ver mais detalhes: <a href="${process.env.NEXTAUTH_URL}/dashboard">Acessar Clube</a>
          </p>
        </div>
      `;

            if (process.env.RESEND_API_KEY) {
                await resend.emails.send({
                    from: "Clube do Livro <onboarding@resend.dev>",
                    to: user.email,
                    subject: subject,
                    html: html,
                });
                console.log(`📧 Email sent to ${user.email}`);
            } else {
                console.log(`📧 [MOCK] Email would be sent to ${user.email} (No API Key)`);
            }
        }
    } catch (error) {
        console.error("Error sending notification:", error);
        // Don't throw, so main flow continues even if notification fails
    }
}

export async function notifyAllParticipants({ type, title, message }: Omit<SendNotificationParams, "userId">) {
    try {
        const participants = await prisma.user.findMany({
            where: { role: "participant" },
            select: { id: true },
        });

        // Create notifications in batched promises
        // In production with many users, this should be a queue/background job
        await Promise.all(
            participants.map((user) =>
                sendNotification({
                    userId: user.id,
                    type,
                    title,
                    message,
                })
            )
        );

        console.log(`📢 Notified all ${participants.length} participants`);
    } catch (error) {
        console.error("Error notifying all participants:", error);
    }
}
