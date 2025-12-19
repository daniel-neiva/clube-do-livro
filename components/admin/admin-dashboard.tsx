"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Users, AlertCircle, TrendingUp, Plus, Send, Loader2 } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalParticipants: number;
  notReadingThisWeek: number;
  averageProgress: number;
  activeBook: {
    id: string;
    title: string;
    author: string;
    currentWeek: number;
    totalWeeks: number;
  } | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewBookForm, setShowNewBookForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    totalChapters: "",
    durationWeeks: "4",
    startDate: new Date().toISOString().split('T')[0],
  });
  const [messageContent, setMessageContent] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMessage("");

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookForm),
      });

      const data = await response.json();

      if (response.ok) {
        setFormMessage("Livro criado com sucesso!");
        setShowNewBookForm(false);
        setBookForm({
          title: "",
          author: "",
          totalChapters: "",
          durationWeeks: "4",
          startDate: new Date().toISOString().split('T')[0],
        });
        fetchStats();
      } else {
        setFormMessage(data.error || "Erro ao criar livro");
      }
    } catch (error) {
      setFormMessage("Erro ao criar livro");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMessage("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormMessage("Mensagem enviada com sucesso!");
        setMessageContent("");
        setShowMessageForm(false);
      } else {
        setFormMessage(data.error || "Erro ao enviar mensagem");
      }
    } catch (error) {
      setFormMessage("Erro ao enviar mensagem");
    } finally {
      setFormLoading(false);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Painel do Administrador</h1>
          <p className="text-muted-foreground">Acompanhe e cuide do crescimento dos participantes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/users">
            <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer hover:border-primary/50 border-2 border-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Participantes Ativos</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalParticipants ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Clique para gerenciar</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/stats">
            <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer hover:border-amber-300 border-2 border-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sem Leitura Esta Semana</CardTitle>
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.notReadingThisWeek ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Clique para ver detalhes</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/stats">
            <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer hover:border-green-300 border-2 border-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.averageProgress ?? 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">Clique para ver detalhes</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/books">
            <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer hover:border-purple-300 border-2 border-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Livro Ativo</CardTitle>
                <BookOpen className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {stats?.activeBook ? stats.activeBook.title : "Nenhum"}
                </div>
                {stats?.activeBook && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Semana {stats.activeBook.currentWeek} de {stats.activeBook.totalWeeks}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Clique para gerenciar</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Cadastrar Novo Livro</CardTitle>
              <CardDescription>
                Inicie um novo ciclo de leitura com o grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showNewBookForm ? (
                <Button
                  onClick={() => setShowNewBookForm(true)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Livro
                </Button>
              ) : (
                <form onSubmit={handleCreateBook} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Livro</Label>
                    <Input
                      id="title"
                      value={bookForm.title}
                      onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                      required
                      disabled={formLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Autor</Label>
                    <Input
                      id="author"
                      value={bookForm.author}
                      onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                      required
                      disabled={formLoading}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalChapters">Total de Capítulos</Label>
                      <Input
                        id="totalChapters"
                        type="number"
                        min="1"
                        value={bookForm.totalChapters}
                        onChange={(e) => setBookForm({ ...bookForm, totalChapters: e.target.value })}
                        required
                        disabled={formLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="durationWeeks">Duração (semanas)</Label>
                      <select
                        id="durationWeeks"
                        value={bookForm.durationWeeks}
                        onChange={(e) => setBookForm({ ...bookForm, durationWeeks: e.target.value })}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        required
                        disabled={formLoading}
                      >
                        <option value="4">4 semanas</option>
                        <option value="6">6 semanas</option>
                        <option value="8">8 semanas</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={bookForm.startDate}
                      onChange={(e) => setBookForm({ ...bookForm, startDate: e.target.value })}
                      required
                      disabled={formLoading}
                    />
                  </div>
                  {formMessage && (
                    <p className="text-sm text-center text-primary">{formMessage}</p>
                  )}
                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={formLoading}>
                      {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Criar Livro
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewBookForm(false)}
                      disabled={formLoading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Enviar Mensagem Pastoral</CardTitle>
              <CardDescription>
                Envie uma palavra de ânimo para todos os participantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showMessageForm ? (
                <Button
                  onClick={() => setShowMessageForm(true)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Nova Mensagem
                </Button>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Escreva uma mensagem encorajadora..."
                      rows={5}
                      required
                      disabled={formLoading}
                    />
                  </div>
                  {formMessage && (
                    <p className="text-sm text-center text-primary">{formMessage}</p>
                  )}
                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={formLoading}>
                      {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Enviar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMessageForm(false)}
                      disabled={formLoading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
