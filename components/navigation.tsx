"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut, Users, MessageSquare, BarChart3, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const { data: session } = useSession() || {};
  const userRole = session?.user ? session.user.role : null;
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (!session?.user) return;

    const checkUnreadMessages = async () => {
      try {
        const lastSeen = localStorage.getItem('lastSeenMessages');
        const url = lastSeen
          ? `/api/messages/unread?lastSeen=${encodeURIComponent(lastSeen)}`
          : '/api/messages/unread';

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unreadCount || 0);

          // Initialize lastSeen if not set
          if (!lastSeen && data.latestMessageAt) {
            localStorage.setItem('lastSeenMessages', data.latestMessageAt);
          }
        }
      } catch (error) {
        console.error('Error checking unread messages:', error);
      }
    };

    checkUnreadMessages();

    // Check every 30 seconds for new messages
    const interval = setInterval(checkUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [session?.user]);

  // Mark messages as seen when visiting the messages page
  useEffect(() => {
    if (pathname === '/messages') {
      const markAsSeen = async () => {
        try {
          const response = await fetch('/api/messages/unread');
          if (response.ok) {
            const data = await response.json();
            if (data.latestMessageAt) {
              localStorage.setItem('lastSeenMessages', data.latestMessageAt);
              setUnreadCount(0);
            }
          }
        } catch (error) {
          console.error('Error marking messages as seen:', error);
        }
      };
      markAsSeen();
    }
  }, [pathname]);

  if (!session) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold text-lg text-gray-800">Clube do Livro</span>
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-700">
                  <Home className="h-4 w-4 mr-2" />
                  Início
                </Button>
              </Link>

              {userRole === 'admin' && (
                <>
                  <Link href="/admin/stats">
                    <Button variant="ghost" size="sm" className="text-gray-700">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Estatísticas
                    </Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button variant="ghost" size="sm" className="text-gray-700">
                      <Users className="h-4 w-4 mr-2" />
                      Usuários
                    </Button>
                  </Link>
                  <Link href="/admin/books">
                    <Button variant="ghost" size="sm" className="text-gray-700">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Livros
                    </Button>
                  </Link>
                </>
              )}

              <Link href="/messages">
                <Button variant="ghost" size="sm" className="text-gray-700 relative">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mensagens
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-xs text-gray-500">
                {userRole === 'admin' ? 'Administrador' : 'Participante'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
