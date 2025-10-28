'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Bot } from 'lucide-react';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/documents', label: 'Ask-the-PDF' },
  { href: '/rewrite', label: 'Rewrite' },
  { href: '/translate', label: 'Translate' },
  { href: '/legal', label: 'Legal Checker' },
  { href: '/policy', label: 'Policy Compliance' },
  { href: '/math-solver', label: 'Math Solver' },
];

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <Link
            href="#"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <Bot className="h-6 w-6" />
            <span className="sr-only">AI Toolbox</span>
          </Link>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
