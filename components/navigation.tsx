"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BookOpen, LogOut, Users, MessageSquare, BarChart3, Home, Menu, X, History } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Navigation() {
  const { data: session } = useSession() || {};
  const userRole = session?.user ? session.user.role : null;
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (!session) {
    return null;
  }

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Link href="/dashboard" onClick={() => mobile && setMobileMenuOpen(false)}>
        <Button
          variant={pathname === '/dashboard' ? 'secondary' : 'ghost'}
          size={mobile ? 'default' : 'sm'}
          className={`${mobile ? 'w-full justify-start text-base' : ''} text-foreground`}
        >
          <Home className="h-4 w-4 mr-2" />
          Início
        </Button>
      </Link>

      {userRole === 'admin' && (
        <>
          <Link href="/admin/stats" onClick={() => mobile && setMobileMenuOpen(false)}>
            <Button
              variant={pathname === '/admin/stats' ? 'secondary' : 'ghost'}
              size={mobile ? 'default' : 'sm'}
              className={`${mobile ? 'w-full justify-start text-base' : ''} text-foreground`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Estatísticas
            </Button>
          </Link>
          <Link href="/admin/users" onClick={() => mobile && setMobileMenuOpen(false)}>
            <Button
              variant={pathname === '/admin/users' ? 'secondary' : 'ghost'}
              size={mobile ? 'default' : 'sm'}
              className={`${mobile ? 'w-full justify-start text-base' : ''} text-foreground`}
            >
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </Button>
          </Link>
          <Link href="/admin/books" onClick={() => mobile && setMobileMenuOpen(false)}>
            <Button
              variant={pathname === '/admin/books' ? 'secondary' : 'ghost'}
              size={mobile ? 'default' : 'sm'}
              className={`${mobile ? 'w-full justify-start text-base' : ''} text-foreground`}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Livros
            </Button>
          </Link>
        </>
      )}

      <Link href="/messages" onClick={() => mobile && setMobileMenuOpen(false)}>
        <Button
          variant={pathname === '/messages' ? 'secondary' : 'ghost'}
          size={mobile ? 'default' : 'sm'}
          className={`${mobile ? 'w-full justify-start text-base' : ''} text-foreground relative`}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Mensagens
          {unreadCount > 0 && (
            <span className={`${mobile ? 'ml-auto' : 'absolute -top-1 -right-1'} bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${!mobile && 'animate-pulse'}`}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </Link>

      <Link href="/history" onClick={() => mobile && setMobileMenuOpen(false)}>
        <Button
          variant={pathname === '/history' ? 'secondary' : 'ghost'}
          size={mobile ? 'default' : 'sm'}
          className={`${mobile ? 'w-full justify-start text-base' : ''} text-foreground`}
        >
          <History className="h-4 w-4 mr-2" />
          Histórico
        </Button>
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Image
                src="/logo.jpg"
                alt="Clube do Livro"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="font-semibold text-lg text-foreground">Clube do Livro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLinks />
          </div>

          {/* Desktop User Info */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {userRole === 'admin' ? 'Administrador' : 'Participante'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile notification indicator */}
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetHeader className="text-left border-b pb-4 mb-4">
                  <SheetTitle className="flex items-center space-x-2">
                    <Image
                      src="/logo.jpg"
                      alt="Clube do Livro"
                      width={32}
                      height={32}
                      className="rounded-lg"
                    />
                    <span>Menu</span>
                  </SheetTitle>
                </SheetHeader>

                {/* User Info in Mobile */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-accent/20 p-2 rounded-full">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{session?.user?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {userRole === 'admin' ? 'Administrador' : 'Participante'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <div className="flex flex-col space-y-2">
                  <NavLinks mobile />
                </div>

                {/* Logout Button */}
                <div className="mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/login' });
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair da conta
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
