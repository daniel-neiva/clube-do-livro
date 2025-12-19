"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { BookOpen, Edit, Trash2, Loader2, Plus, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface Book {
    id: string;
    title: string;
    author: string;
    startDate: string;
    durationWeeks: number;
    totalChapters: number;
    isActive: boolean;
}

export default function BooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await fetch("/api/books");
            if (!response.ok) throw new Error("Falha ao buscar livros");

            const data = await response.json();
            setBooks(data);
        } catch (error) {
            console.error("Error fetching books:", error);
            toast.error("Erro ao carregar livros");
        } finally {
            setLoading(false);
        }
    };

    const deleteBook = async (id: string, title: string) => {
        if (!confirm(`Tem certeza que deseja excluir o livro "${title}"? Todos os progressos e check-ins associados serão perdidos. Essa ação não pode ser desfeita.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/books/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Livro excluído com sucesso");
                fetchBooks();
            } else {
                toast.error("Erro ao excluir livro");
            }
        } catch (error) {
            console.error("Error deleting book:", error);
            toast.error("Erro ao excluir livro");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                <Navigation />
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciar Livros</h1>
                        <p className="text-muted-foreground">Catálogo de leituras do clube</p>
                    </div>
                    <Link href="/admin/books/new">
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Livro
                        </Button>
                    </Link>
                </div>

                <Card className="shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Autor</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Duração</TableHead>
                                    <TableHead>Início</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {books.map((book) => (
                                    <TableRow key={book.id}>
                                        <TableCell className="font-medium">{book.title}</TableCell>
                                        <TableCell>{book.author}</TableCell>
                                        <TableCell>
                                            {book.isActive ? (
                                                <div className="flex items-center text-green-600">
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    <span className="text-sm font-medium">Ativo</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-muted-foreground">
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    <span className="text-sm">Inativo</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>{book.durationWeeks} semanas</TableCell>
                                        <TableCell>
                                            {format(new Date(book.startDate), "dd/MM/yyyy", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/admin/books/${book.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600"
                                                onClick={() => deleteBook(book.id, book.title)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {books.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhum livro cadastrado
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
