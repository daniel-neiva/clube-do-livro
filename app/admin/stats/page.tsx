"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp, Loader2 } from "lucide-react";

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
  userProgress?: {
    id: string;
    name: string;
    chaptersRead: number;
    totalChapters: number;
    percentage: number;
  }[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 25) return "bg-yellow-500";
    return "bg-red-400";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Estatísticas Detalhadas</h1>
          <p className="text-gray-600">Acompanhe o progresso geral do grupo</p>
        </div>

        {stats?.activeBook && (
          <Card className="shadow-md mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
                Livro Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-800">{stats.activeBook.title}</h3>
                <p className="text-gray-600">por {stats.activeBook.author}</p>
                <div className="flex items-center space-x-4 pt-4">
                  <div className="bg-blue-100 px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-600">Semana Atual</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.activeBook.currentWeek}</p>
                  </div>
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-600">Total de Semanas</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.activeBook.totalWeeks}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Participantes Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-800">{stats?.totalParticipants ?? 0}</p>
              <p className="text-sm text-gray-600 mt-2">Total de pessoas no clube</p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Progresso Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-800">{stats?.averageProgress ?? 0}%</p>
              <p className="text-sm text-gray-600 mt-2">Média de leitura do livro</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.averageProgress ?? 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BookOpen className="h-5 w-5 mr-2 text-amber-600" />
                Sem Leitura Esta Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-800">{stats?.notReadingThisWeek ?? 0}</p>
              <p className="text-sm text-gray-600 mt-2">
                Participantes que ainda não marcaram nenhum capítulo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Individual User Progress Section */}
        {stats?.userProgress && stats.userProgress.length > 0 && (
          <Card className="shadow-md mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 mr-2 text-purple-600" />
                Progresso Individual dos Participantes
              </CardTitle>
              <CardDescription>
                Acompanhe o progresso de leitura de cada membro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.userProgress.map((user) => (
                  <div key={user.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">{user.name}</span>
                      <span className="text-sm text-gray-600">
                        {user.chaptersRead}/{user.totalChapters} capítulos ({user.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${getProgressColor(user.percentage)} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${user.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-md mt-8">
          <CardHeader>
            <CardTitle>Orientações Pastorais</CardTitle>
            <CardDescription>
              Como usar esses dados com sabedoria e cuidado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-700">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold text-blue-800 mb-2">✨ Lembre-se:</p>
                <ul className="space-y-2 text-sm">
                  <li>• Esses números são para <strong>acompanhamento</strong>, não para cobrança</li>
                  <li>• Cada pessoa tem seu próprio ritmo de crescimento</li>
                  <li>• O objetivo é <strong>cuidar e encorajar</strong>, nunca comparar ou expor</li>
                  <li>• Use essas informações para identificar quem pode precisar de apoio</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
