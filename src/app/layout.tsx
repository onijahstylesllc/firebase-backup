import { Figtree, Bricolage_Grotesque, Press_Start_2P, VT323 } from 'next/font/google';
import './globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { ParallaxProvider } from '@/components/parallax-provider';
import SupabaseProvider from '@/lib/supabase-provider';

const fontBody = Figtree({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-headline',
});

const fontCode = VT323({
  subsets: ['latin'],
  variable: '--font-code',
  weight: '400',
});

const fontPixel = Press_Start_2P({
  subsets: ['latin'],
  variable: '--font-pixel',
  weight: '400',
});

export const metadata = {
  title: 'AI Toolbox - Your All-in-One AI-Powered Document Assistant',
  description: 'Unlock the full potential of your documents with AI Toolbox. Summarize, translate, rewrite, and more. Effortlessly manage your documents with our intelligent, secure, and intuitive platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'antialiased',
          fontBody.variable,
          fontHeadline.variable,
          fontCode.variable,
          fontPixel.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ParallaxProvider>
            <SupabaseProvider>
              {children}
            </SupabaseProvider>
          </ParallaxProvider>
          <Toaster />
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
