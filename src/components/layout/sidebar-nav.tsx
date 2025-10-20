
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Settings,
  Sparkles,
  Gavel,
  Calculator,
  Languages,
  FileEdit,
  BrainCircuit,
  ShieldCheck,
  Users,
  Bell,
  BookMarked,
  FileUp,
  Archive,
  Combine,
  Split,
  Minimize,
  FileCog,
} from 'lucide-react';
import { Logo } from '../logo';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

type User = {
  name: string;
  email: string;
  avatar: string;
};

const mainNav = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/documents', icon: FileText, label: 'Documents' },
    { href: '/templates', icon: BookMarked, label: 'Templates' },
];

const aiTools = [
  { href: '/analyze', icon: FileUp, label: 'Analyze Document' },
  { href: '/memory-threads', icon: BrainCircuit, label: 'Memory Threads' },
  { href: '/rewrite', icon: FileEdit, label: 'Rewrite Text' },
  { href: '/translate', icon: Languages, label: 'Translate Text' },
  { href: '/summarize-meeting', icon: Users, label: 'Summarize Meeting' },
  { href: '/legal', icon: Gavel, label: 'Legal Checker' },
  { href: '/policy', icon: ShieldCheck, label: 'Policy Compliance' },
  { href: '/math-solver', icon: Calculator, label: 'Math Solver' },
];

const pdfTools = [
    { href: '/convert', icon: FileCog, label: 'Convert PDF' },
    { href: '/merge', icon: Combine, label: 'Merge PDFs' },
    { href: '/split', icon: Split, label: 'Split PDF' },
    { href: '/compress', icon: Minimize, label: 'Compress PDF' },
];

const managementNav = [
    { href: '/teams', icon: Users, label: 'Teams' },
    { href: '/settings', icon: Settings, label: 'Settings' },
]

export function SidebarNav({ user, isSheet = false }: { user: User, isSheet?: boolean }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/documents' && pathname.startsWith('/documents')) return true;
    if (path === '/settings' && pathname.startsWith('/settings')) return true;
    if (path === '/teams' && pathname.startsWith('/teams')) return true;
    if (path === '/templates' && pathname.startsWith('/templates')) return true;
    if (aiTools.some(tool => path === tool.href && pathname.startsWith(tool.href))) return true;
    if (pdfTools.some(tool => path === tool.href && pathname.startsWith(tool.href))) return true;
    return pathname === path;
  };
  
  const allTools = [...pdfTools, ...aiTools];

  const navContent = (
      <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
        {mainNav.map((item) => (
             <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive(item.href) && "bg-muted text-primary"
                )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
        ))}

        <Accordion type="multiple" className="w-full" defaultValue={['ai-tools']}>
            <AccordionItem value="ai-tools" className="border-none">
                <AccordionTrigger className={cn(
                  "py-2 px-3 text-sm flex items-center gap-3 rounded-lg text-muted-foreground transition-all hover:text-primary hover:no-underline [&[data-state=open]>svg]:rotate-180",
                  allTools.some(tool => pathname.startsWith(tool.href)) && "text-primary"
                  )}>
                     <Sparkles className="h-4 w-4" />
                    AI & PDF Tools
                </AccordionTrigger>
                <AccordionContent className="p-0 pl-7">
                    <nav className="grid items-start text-sm font-medium">
                        {allTools.map((tool) => (
                             <Link
                              key={tool.label}
                              href={tool.href}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                isActive(tool.href) && "bg-muted text-primary"
                                )}
                            >
                              <tool.icon className="h-4 w-4" />
                              {tool.label}
                            </Link>
                        ))}
                    </nav>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        
        <div className="my-2 border-t -mx-2"></div>
        
        {managementNav.map((item) => (
            <Link
                key={item.label}
                href={item.href}
                className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive(item.href) && "bg-muted text-primary"
                )}
            >
                <item.icon className="h-4 w-4" />
                {item.label}
            </Link>
        ))}
      </nav>
  );

  if (isSheet) {
      return (
          <>
            <Link
                href="#"
                className="mb-4 flex items-center gap-2 text-lg font-semibold"
            >
                <Logo className="h-6 w-6 text-primary" />
                <span>DocuMind AI</span>
            </Link>
            {navContent}
          </>
      )
  }

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6 text-primary" />
            <span className="">DocuMind AI</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
            {navContent}
        </div>
        <div className="mt-auto p-4">
          <Card>
            <CardHeader className="p-2 pt-0 md:p-4">
              <CardTitle>Upgrade to Pro</CardTitle>
              <CardDescription>
                Unlock all features and get unlimited access to our support
                team.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
              <Button size="sm" className="w-full">
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
