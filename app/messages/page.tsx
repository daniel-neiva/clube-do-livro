"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Heart, Loader2, Send, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
  };
}

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
  const [comments, setComments] = useState<{ [messageId: string]: Comment[] }>({});
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState<{ [messageId: string]: string }>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const fetchComments = async (messageId: string) => {
    setLoadingComments((prev) => new Set(prev).add(messageId));
    try {
      const response = await fetch(`/api/messages/${messageId}/comments`);
      const data = await response.json();
      setComments((prev) => ({ ...prev, [messageId]: data }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  const toggleComments = async (messageId: string) => {
    const isExpanded = expandedMessages.has(messageId);
    if (isExpanded) {
      setExpandedMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    } else {
      setExpandedMessages((prev) => new Set(prev).add(messageId));
      if (!comments[messageId]) {
        await fetchComments(messageId);
      }
    }
  };

  const handleSubmitComment = async (messageId: string) => {
    const content = newComment[messageId]?.trim();
    if (!content) return;

    setSubmittingComment(messageId);
    try {
      const response = await fetch(`/api/messages/${messageId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments((prev) => ({
          ...prev,
          [messageId]: [...(prev[messageId] || []), comment],
        }));
        setNewComment((prev) => ({ ...prev, [messageId]: "" }));
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmittingComment(null);
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
            messages.map((message) => {
              const isExpanded = expandedMessages.has(message.id);
              const messageComments = comments[message.id] || [];
              const isLoadingComments = loadingComments.has(message.id);

              return (
                <Card key={message.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">
                          {message?.author?.name ?? 'Admin'}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                        {mounted ? format(new Date(message.createdAt), "d 'de' MMMM, yyyy", { locale: ptBR }) : ''}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>

                    {/* Comments Section */}
                    <div className="border-t border-border pt-4">
                      <button
                        onClick={() => toggleComments(message.id)}
                        className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">
                          {messageComments.length > 0
                            ? `${messageComments.length} comentário${messageComments.length > 1 ? 's' : ''}`
                            : 'Comentar'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-4 space-y-4">
                          {/* Loading comments */}
                          {isLoadingComments && (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            </div>
                          )}

                          {/* Comments list */}
                          {!isLoadingComments && messageComments.length > 0 && (
                            <div className="space-y-3">
                              {messageComments.map((comment) => (
                                <div key={comment.id} className="bg-secondary rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-foreground text-sm">
                                      {comment.author?.name ?? 'Usuário'}
                                    </span>
                                    <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                                      {mounted ? format(new Date(comment.createdAt), "d MMM, HH:mm", { locale: ptBR }) : ''}
                                    </span>
                                  </div>
                                  <p className="text-foreground text-sm">{comment.content}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* New comment input */}
                          <div className="flex space-x-2">
                            <Textarea
                              placeholder="Escreva um comentário..."
                              value={newComment[message.id] || ""}
                              onChange={(e) =>
                                setNewComment((prev) => ({
                                  ...prev,
                                  [message.id]: e.target.value,
                                }))
                              }
                              className="flex-1 min-h-[60px] resize-none"
                              disabled={submittingComment === message.id}
                            />
                            <Button
                              onClick={() => handleSubmitComment(message.id)}
                              disabled={!newComment[message.id]?.trim() || submittingComment === message.id}
                              className="bg-primary hover:bg-primary/90"
                            >
                              {submittingComment === message.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
