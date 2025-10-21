
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupabaseCollection } from '@/lib/use-supabase-collection';
import { formatDistanceToNow } from 'date-fns';
import {
  FileUp,
  Clock,
  BarChartBig,
  MessageSquare,
  Repeat,
  Languages,
  Gavel,
  ShieldCheck,
  Calculator,
} from 'lucide-react';
import Link from 'next/link';
import { AiUsage } from '@/components/dashboard/ai-usage';

const recentActivity = [
  {
    id: 'doc-1',
    fileName: 'Project Proposal Q3.pdf',
    action: 'edited',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 'doc-2',
    fileName: 'Marketing Campaign Brief.docx',
    action: 'commented on',
    timestamp: new Date(Date.now() - 1000 * 60 * 22),
  },
  {
    id: 'doc-3',
    fileName: 'Financial-Report-2024.xlsx',
    action: 'shared',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'user-1',
    userName: 'Alice Johnson',
    action: 'joined your team',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
];

const quickAccessTools = [
  { icon: MessageSquare, label: 'Ask-the-PDF', href: '/documents' },
  { icon: Repeat, label: 'Rewrite', href: '/rewrite' },
  { icon: Languages, label: 'Translate', href: '/translate' },
  { icon: Gavel, label: 'Legal Checker', href: '/legal' },
  { icon: ShieldCheck, label: 'Policy Compliance', href: '/policy' },
  { icon: Calculator, label: 'Math Solver', href: '/math-solver' },
];

export default function DashboardPage() {
  const { data: userProfile, isLoading: isProfileLoading } = useSupabaseCollection('profiles', { limit: 1 });
  const usage = userProfile?.[0]?.usage || 0;
  const plan = userProfile?.[0]?.plan || 'Free';
  const usagePercentage = (usage / (plan === 'Pro' ? 200 : 20)) * 100;

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <div className="grid gap-4 md:grid-cols-2 lg:gap-8">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="font-headline">Quick Access</CardTitle>
              <CardDescription>
                Your most-used AI tools, just a click away.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {quickAccessTools.map((tool) => (
                <Button
                  key={tool.label}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-1 text-center"
                  asChild
                >
                  <Link href={tool.href}>
                    <tool.icon className="h-6 w-6 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      {tool.label}
                    </span>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
          <Card className="animate-fade-in-delay-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium font-headline">
                My Plan
              </CardTitle>
              <BarChartBig className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isProfileLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{plan} Plan</div>
                  <p className="text-xs text-muted-foreground">
                    You've used {usage} of your 20 document analyses this
                    month.
                  </p>
                  <Progress value={usagePercentage} className="mt-2" />
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button size="sm" className="w-full">
                Upgrade Plan
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-4 lg:mt-8 animate-fade-in-delay-2">
          <AiUsage />
        </div>
      </div>

      <Card className="animate-fade-in-delay-3 xl:col-span-1">
        <CardHeader>
          <CardTitle className="font-headline">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          {recentActivity.map((activity, i) => (
            <div
              key={activity.id}
              className="flex items-center gap-3"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                {activity.fileName ? (
                  <FileUp className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>
              <div className="text-sm">
                <p>
                  <span className="font-medium">
                    {activity.fileName || activity.userName}
                  </span>{' '}
                  {activity.action}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
