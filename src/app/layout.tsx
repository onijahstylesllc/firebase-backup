
'use client';

import type { ReactNode } from 'react';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';
import { ParallaxProvider } from '@/components/parallax-provider';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
});

const unprotectedRoutes = ['/', '/login'];

type User = {
    name: string;
    email: string;
    avatar: string;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isAppRoute = !unprotectedRoutes.includes(pathname);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (loading) return;
    if (!session && isAppRoute) {
      router.push('/login');
    }
    if (session && !isAppRoute && pathname !== '/') {
      router.push('/dashboard');
    }
  }, [loading, session, isAppRoute, pathname, router]);

  const needsRedirect = (!session && isAppRoute) || (session && !isAppRoute && pathname !== '/');

  if (loading || needsRedirect) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (isAppRoute && session) {
    const user: User = {
      name: session.user.user_metadata.full_name || 'Anonymous',
      email: session.user.email || '',
      avatar: session.user.user_metadata.avatar_url || `https://picsum.photos/seed/${session.user.id}/40/40`,
    };

    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <SidebarNav user={user} />
          <div className="flex flex-col">
            <Header user={user} />
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return <>{children}</>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'antialiased',
          fontBody.variable,
          fontHeadline.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ParallaxProvider>
            <AuthProvider>{children}</AuthProvider>
          </ParallaxProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
