
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
  FileEdit,
  ScanText,
  Sparkles as SparklesIcon,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { AiUsage } from '@/components/dashboard/ai-usage';
import { type Profile, type Activity } from '@/lib/types';

const quickAccessTools = [
  { icon: FileEdit, label: 'Edit PDF', href: '/documents' },
  { icon: ScanText, label: 'Scan Docs', href: '/analyze' },
  { icon: SparklesIcon, label: 'Summarize', href: '/analyze' },
  { icon: MessageSquare, label: 'Ask-the-PDF', href: '/documents' },
  { icon: Repeat, label: 'Rewrite', href: '/rewrite' },
  { icon: Languages, label: 'Translate', href: '/translate' },
  { icon: Gavel, label: 'Legal Checker', href: '/legal' },
  { icon: ShieldCheck, label: 'Policy Check', href: '/policy' },
  { icon: Calculator, label: 'Math Solver', href: '/math-solver' },
];

const ActivityIcon = ({ type }: { type: Activity['type'] }) => {
  switch (type) {
    case 'EDIT':
      return <FileEdit className="h-5 w-5" />;
    case 'COMMENT':
      return <MessageSquare className="h-5 w-5" />;
    case 'SHARE':
      return <FileUp className="h-5 w-5" />;
    case 'JOIN':
      return <Users className="h-5 w-5" />;
    default:
      return <Clock className="h-5 w-5" />;
  }
};

const getActivityDescription = (activity: Activity) => {
  switch (activity.type) {
    case 'EDIT':
      return `edited ${activity.document_title}`;
    case 'COMMENT':
      return `commented on ${activity.document_title}`;
    case 'SHARE':
      return `shared ${activity.document_title}`;
    case 'JOIN':
      return `joined your team`;
    default:
      return '';
  }
};

export default function DashboardPage() {
  const { data: userProfile, isLoading: isProfileLoading } = useSupabaseCollection<Profile>('profiles');
  const { data: recentActivity, isLoading: isActivityLoading } = useSupabaseCollection<Activity>('activity', {
    orderBy: 'created_at',
    ascending: false,
    limit: 5,
  });

  const usage = userProfile?.[0]?.usage || 0;
  const plan = userProfile?.[0]?.plan || 'Free';
  const usagePercentage = (usage / (plan === 'Pro' ? 200 : 20)) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 p-4 md:p-6">
      
      {/* -- Quick Access -- */}
      <Card className="lg:col-span-2 animate-fade-in">
        <CardHeader>
          <CardTitle className="font-headline">Quick Access</CardTitle>
          <CardDescription>
            Your most-used AI tools, just a click away.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          {quickAccessTools.map((tool) => (
            <Button
              key={tool.label}
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2 text-center p-2"
              asChild
            >
              <Link href={tool.href}>
                <tool.icon className="h-7 w-7 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground">
                  {tool.label}
                </span>
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* -- Recent Activity -- */}
      <Card className="lg:col-span-1 lg:row-span-2 animate-fade-in-delay-1">
        <CardHeader>
          <CardTitle className="font-headline">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          {isActivityLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))
          ) : (
            recentActivity?.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <ActivityIcon type={activity.type} />
                </div>
                <div className="text-sm truncate">
                  <p className="truncate">
                    <span className="font-medium">
                      {activity.user_name || activity.document_title}
                    </span> {' '}
                    {getActivityDescription(activity)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* -- AI Usage -- */}
      <div className="lg:col-span-2 animate-fade-in-delay-2">
        <AiUsage />
      </div>

      {/* -- My Plan -- */}
      <div className="lg:col-span-3 animate-fade-in-delay-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-headline">
              My Plan
            </CardTitle>
            <BarChartBig className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isProfileLoading ? (
              <div className="space-y-2 py-2">
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{plan} Plan</div>
                <p className="text-xs text-muted-foreground">
                  You've used {usage} of your {plan === 'Pro' ? '200' : '20'} document analyses this
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

    </div>
  );
}
