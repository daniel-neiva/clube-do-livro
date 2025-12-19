"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Heart, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string | null;
  };
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mensagens Pastorais</h1>
          <p className="text-muted-foreground">Palavras de encorajamento para sua jornada</p>
        </div>

        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card key={message.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">
                        {message?.author?.name ?? 'Admin'}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(message.createdAt), "d 'de' MMMM, yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
