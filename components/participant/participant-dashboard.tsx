"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen, TrendingUp, CheckCircle2, Calendar, Heart, Loader2, Clock } from "lucide-react";
import { format, parseISO, isBefore, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BookData {
  book: any;
  chaptersByWeek: { [key: number]: any[] };
  progressPercentage: number;
  readChapters: number;
  totalChapters: number;
  currentWeek: number;
  status: string;
}

export default function ParticipantDashboard() {
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingChapter, setCheckingChapter] = useState<string | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInForm, setCheckInForm] = useState({
    reflection1: "",
    reflection2: "",
  });
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState("");

  useEffect(() => {
    fetchBookData();
  }, []);

  const fetchBookData = async () => {
    try {
      const response = await fetch("/api/books/active");
      const data = await response.json();
      setBookData(data);
    } catch (error) {
      console.error("Error fetching book data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChapter = async (chapterId: string, currentStatus: boolean) => {
    setCheckingChapter(chapterId);
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, isRead: !currentStatus }),
      });

      if (response.ok) {
        fetchBookData();
      }
    } catch (error) {
      console.error("Error toggling chapter:", error);
    } finally {
      setCheckingChapter(null);
    }
  };

  const handleSubmitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckInLoading(true);
    setCheckInMessage("");

    try {
      const response = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: bookData?.book?.id,
          weekNumber: bookData?.currentWeek,
          ...checkInForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCheckInMessage("Check-in salvo com sucesso!");
        setCheckInForm({ reflection1: "", reflection2: "" });
        setTimeout(() => {
          setShowCheckIn(false);
          setCheckInMessage("");
        }, 2000);
      } else {
        setCheckInMessage(data.error || "Erro ao salvar check-in");
      }
    } catch (error) {
      setCheckInMessage("Erro ao salvar check-in");
    } finally {
      setCheckInLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!bookData?.book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center shadow-lg">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <CardTitle className="text-2xl">Nenhum livro ativo no momento</CardTitle>
              <CardDescription className="text-base">
                Aguarde o próximo ciclo de leitura. Você será notificado quando um novo livro for cadastrado.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Adiantado':
        return 'text-green-600 bg-green-50';
      case 'Um pouco atrasado':
        return 'text-amber-600 bg-amber-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sua Jornada de Leitura</h1>
          <p className="text-gray-600">Cada página é um passo em sua caminhada de crescimento</p>
        </div>

        {/* Book Info & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-1">{bookData.book.title}</CardTitle>
                  <CardDescription className="text-base">por {bookData.book.author}</CardDescription>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progresso Geral</span>
                    <span className="font-semibold text-blue-600">{bookData.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${bookData.progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {bookData.readChapters} de {bookData.totalChapters} capítulos lidos
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Semana {bookData.currentWeek} de {bookData.book.durationWeeks}
                    </span>
                  </div>
                  {bookData.book.startDate && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-500" />
                      {isBefore(new Date(), parseISO(bookData.book.startDate)) ? (
                        <span className="text-sm text-amber-600 font-medium">
                          Início: {format(parseISO(bookData.book.startDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      ) : (
                        <span className="text-sm text-green-600">
                          Iniciado em {format(parseISO(bookData.book.startDate), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  )}
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bookData.status)}`}>
                    {bookData.status}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Sua Identidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Heart className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="text-sm text-gray-700 italic">
                    &quot;Sou alguem que caminha com constância&quot;
                  </p>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Capítulos lidos</span>
                    <span className="font-semibold">{bookData.readChapters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Progresso</span>
                    <span className="font-semibold">{bookData.progressPercentage}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Checklist */}
        <Card className="shadow-md mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-blue-600" />
              Checklist Semanal
            </CardTitle>
            <CardDescription>
              Semana {bookData.currentWeek} - Marque os capítulos conforme for lendo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.keys(bookData.chaptersByWeek || {})
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((weekNum) => {
                  const week = parseInt(weekNum);
                  const chapters = bookData.chaptersByWeek[week] || [];
                  const isCurrentWeek = week === bookData.currentWeek;

                  return (
                    <div key={week} className={`p-4 rounded-lg ${isCurrentWeek ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`}>
                      <h3 className="font-semibold text-gray-800 mb-3">
                        Semana {week}
                        {isCurrentWeek && <span className="ml-2 text-xs text-blue-600">(Semana Atual)</span>}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {chapters.map((chapter: any) => (
                          <div
                            key={chapter.id}
                            className="flex items-center space-x-3 p-3 bg-white rounded-md hover:shadow-sm transition-shadow"
                          >
                            <Checkbox
                              id={chapter.id}
                              checked={chapter.isRead}
                              onCheckedChange={() => handleToggleChapter(chapter.id, chapter.isRead)}
                              disabled={checkingChapter === chapter.id}
                            />
                            <label
                              htmlFor={chapter.id}
                              className="text-sm font-medium cursor-pointer flex-1"
                            >
                              Capítulo {chapter.chapterNumber}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Check-in Card */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Check-in Semanal (Opcional)</CardTitle>
            <CardDescription>
              Compartilhe suas reflexões sobre a leitura desta semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showCheckIn ? (
              <Button
                onClick={() => setShowCheckIn(true)}
                variant="outline"
                className="w-full"
              >
                Fazer Check-in
              </Button>
            ) : (
              <form onSubmit={handleSubmitCheckIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reflection1" className="text-base">
                    O que mais te chamou atenção nessa leitura?
                  </Label>
                  <Textarea
                    id="reflection1"
                    value={checkInForm.reflection1}
                    onChange={(e) => setCheckInForm({ ...checkInForm, reflection1: e.target.value })}
                    placeholder="Compartilhe seus pensamentos..."
                    rows={3}
                    disabled={checkInLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reflection2" className="text-base">
                    Algo te confrontou ou edificou?
                  </Label>
                  <Textarea
                    id="reflection2"
                    value={checkInForm.reflection2}
                    onChange={(e) => setCheckInForm({ ...checkInForm, reflection2: e.target.value })}
                    placeholder="Compartilhe suas reflexões..."
                    rows={3}
                    disabled={checkInLoading}
                  />
                </div>
                {checkInMessage && (
                  <p className="text-sm text-center text-blue-600">{checkInMessage}</p>
                )}
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={checkInLoading}
                  >
                    {checkInLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Salvar Check-in
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCheckIn(false)}
                    disabled={checkInLoading}
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
  );
}
