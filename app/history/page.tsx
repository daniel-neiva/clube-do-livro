"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, CheckCircle2, Clock, Calendar, Trophy, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BookHistory {
    id: string;
    title: string;
    author: string;
    totalChapters: number;
    readChapters: number;
    progressPercentage: number;
    isCompleted: boolean;
    isActive: boolean;
    startDate: string;
    firstReadDate: string | null;
    lastReadDate: string | null;
    readingDurationDays: number;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<BookHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch("/api/reading-history");
            const data = await response.json();
            setHistory(data);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (days: number) => {
        if (days === 0) return "Mesmo dia";
        if (days === 1) return "1 dia";
        if (days < 7) return `${days} dias`;
        const weeks = Math.floor(days / 7);
        const remainingDays = days % 7;
        if (remainingDays === 0) {
            return weeks === 1 ? "1 semana" : `${weeks} semanas`;
        }
        return `${weeks} semana${weeks > 1 ? 's' : ''} e ${remainingDays} dia${remainingDays > 1 ? 's' : ''}`;
    };

    const completedBooks = history.filter((b) => b.isCompleted);
    const inProgressBooks = history.filter((b) => !b.isCompleted);

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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Meu Histórico de Leitura</h1>
                    <p className="text-muted-foreground">Acompanhe sua jornada literária</p>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-3">
                                <Trophy className="h-8 w-8 text-green-500" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{completedBooks.length}</p>
                                    <p className="text-sm text-muted-foreground">Livros Concluídos</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-3">
                                <BookOpen className="h-8 w-8 text-blue-500" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{inProgressBooks.length}</p>
                                    <p className="text-sm text-muted-foreground">Em Andamento</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-3">
                                <CheckCircle2 className="h-8 w-8 text-purple-500" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">
                                        {history.reduce((acc, b) => acc + b.readChapters, 0)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Capítulos Lidos</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {history.length === 0 ? (
                    <Card className="shadow-md">
                        <CardContent className="py-12 text-center">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-muted-foreground">Você ainda não começou nenhuma leitura</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Completed Books */}
                        {completedBooks.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                                    <Trophy className="h-5 w-5 mr-2 text-green-500" />
                                    Livros Concluídos
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {completedBooks.map((book) => (
                                        <Card key={book.id} className="shadow-md border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">{book.title}</CardTitle>
                                                        <CardDescription>por {book.author}</CardDescription>
                                                    </div>
                                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Progresso</span>
                                                        <span className="font-semibold text-green-500">100% Completo</span>
                                                    </div>
                                                    <div className="w-full bg-muted rounded-full h-2">
                                                        <div className="bg-green-500 h-2 rounded-full w-full" />
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                                                        <div className="flex items-center space-x-1">
                                                            <BookOpen className="h-4 w-4" />
                                                            <span>{book.totalChapters} capítulos</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{formatDuration(book.readingDurationDays)}</span>
                                                        </div>
                                                        {book.lastReadDate && mounted && (
                                                            <div className="flex items-center space-x-1" suppressHydrationWarning>
                                                                <Calendar className="h-4 w-4" />
                                                                <span suppressHydrationWarning>
                                                                    Concluído em {format(new Date(book.lastReadDate), "dd/MM/yyyy", { locale: ptBR })}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* In Progress Books */}
                        {inProgressBooks.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                                    <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                                    Em Andamento
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {inProgressBooks.map((book) => (
                                        <Card key={book.id} className={`shadow-md ${book.isActive ? 'border-primary/30' : ''}`}>
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">
                                                            {book.title}
                                                            {book.isActive && (
                                                                <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                                                    Atual
                                                                </span>
                                                            )}
                                                        </CardTitle>
                                                        <CardDescription>por {book.author}</CardDescription>
                                                    </div>
                                                    <BookOpen className="h-6 w-6 text-primary" />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Progresso</span>
                                                        <span className="font-semibold text-primary">{book.progressPercentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-muted rounded-full h-2">
                                                        <div
                                                            className="bg-primary h-2 rounded-full transition-all"
                                                            style={{ width: `${book.progressPercentage}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                                                        <div className="flex items-center space-x-1">
                                                            <BookOpen className="h-4 w-4" />
                                                            <span>{book.readChapters} de {book.totalChapters} capítulos</span>
                                                        </div>
                                                        {book.readingDurationDays > 0 && (
                                                            <div className="flex items-center space-x-1">
                                                                <Clock className="h-4 w-4" />
                                                                <span>{formatDuration(book.readingDurationDays)} lendo</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
