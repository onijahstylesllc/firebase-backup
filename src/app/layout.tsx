
'use client';

import type { ReactNode } from 'react';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { useUser, useProfile } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
});

const unprotectedRoutes = ['/', '/login'];

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const isAppRoute = !unprotectedRoutes.includes(pathname);

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
          <FirebaseClientProvider>
            {isAppRoute ? <AppLayout>{children}</AppLayout> : children}
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

function AppLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const userProps = {
    name: profile?.name || user.displayName || 'Anonymous',
    email: profile?.email || user.email || '',
    avatar: profile?.profilePictureUrl || user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`,
  };

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <SidebarNav user={userProps} />
        <div className="flex flex-col">
          <Header user={userProps} />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
