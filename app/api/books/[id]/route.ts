import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user?.role === 'admin';
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const book = await prisma.book.findUnique({
            where: { id: params.id },
            include: {
                chapters: {
                    orderBy: { chapterNumber: 'asc' }
                }
            }
        });

        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        return NextResponse.json(book);
    } catch (error) {
        console.error('Error fetching book:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, author, totalChapters, durationWeeks, startDate, isActive } = body;

        const numChapters = parseInt(totalChapters);
        const numWeeks = parseInt(durationWeeks);

        // Logic to handle "Active" toggle - prevent multiple active books if needed, or allow it
        if (isActive) {
            // Deactivate other books if we want only one active book at a time
            await prisma.book.updateMany({
                where: { id: { not: params.id }, isActive: true },
                data: { isActive: false }
            });
        }

        // Check if book has chapters
        const existingChapters = await prisma.chapter.count({
            where: { bookId: params.id }
        });

        // Update the book
        const book = await prisma.book.update({
            where: { id: params.id },
            data: {
                title,
                author,
                totalChapters: numChapters,
                durationWeeks: numWeeks,
                startDate: new Date(startDate),
                isActive
            },
        });

        // Create chapters if they don't exist
        if (existingChapters === 0 && numChapters > 0) {
            const chaptersToCreate = Array.from({ length: numChapters }, (_, i) => ({
                bookId: params.id,
                chapterNumber: i + 1,
                weekNumber: Math.ceil((i + 1) / Math.ceil(numChapters / numWeeks)),
            }));

            await prisma.chapter.createMany({
                data: chaptersToCreate
            });
        }

        return NextResponse.json(book);
    } catch (error) {
        console.error('Error updating book:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await prisma.book.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
