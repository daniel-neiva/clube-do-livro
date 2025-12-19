import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// This endpoint creates chapters for books that don't have them
// Only admins can call this
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Apenas admins podem executar esta ação' }, { status: 403 });
        }

        // Find all books without chapters
        const books = await prisma.book.findMany({
            include: {
                chapters: true,
            },
        });

        const results = [];

        for (const book of books) {
            if (book.chapters.length === 0 && book.totalChapters > 0) {
                // Create chapters for this book
                const chaptersPerWeek = Math.ceil(book.totalChapters / book.durationWeeks);
                const createdChapters = [];

                for (let i = 1; i <= book.totalChapters; i++) {
                    const weekNumber = Math.ceil(i / chaptersPerWeek);
                    const chapter = await prisma.chapter.create({
                        data: {
                            bookId: book.id,
                            chapterNumber: i,
                            weekNumber: weekNumber,
                        },
                    });
                    createdChapters.push(chapter);
                }

                results.push({
                    bookId: book.id,
                    bookTitle: book.title,
                    chaptersCreated: createdChapters.length,
                });
            }
        }

        if (results.length === 0) {
            return NextResponse.json({
                message: 'Todos os livros já possuem capítulos cadastrados',
                books: books.map(b => ({ id: b.id, title: b.title, chapters: b.chapters.length })),
            });
        }

        return NextResponse.json({
            message: 'Capítulos criados com sucesso',
            results,
        });
    } catch (error) {
        console.error('Error creating chapters:', error);
        return NextResponse.json({ error: 'Erro ao criar capítulos' }, { status: 500 });
    }
}

// GET to check current status
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const books = await prisma.book.findMany({
            include: {
                _count: {
                    select: { chapters: true },
                },
            },
        });

        return NextResponse.json({
            books: books.map(b => ({
                id: b.id,
                title: b.title,
                totalChapters: b.totalChapters,
                actualChapters: b._count.chapters,
                needsChapters: b._count.chapters === 0 && b.totalChapters > 0,
            })),
        });
    } catch (error) {
        console.error('Error checking chapters:', error);
        return NextResponse.json({ error: 'Erro ao verificar capítulos' }, { status: 500 });
    }
}
