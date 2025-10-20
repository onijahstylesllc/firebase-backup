
'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  FilePlus2,
  FileUp,
  Globe,
  MoreVertical,
  Loader2,
  Bot,
  MessageSquare,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import placeholderImages from '@/lib/placeholder-images.json';
import { AiUsageChart } from '@/components/dashboard/ai-usage-chart';
import { useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { NewDocumentDialog } from '@/components/documents/new-document-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


const quickActions = [
  {
    id: 'upload',
    label: 'Upload & Analyze',
    description: 'Let AI extract key insights and data points from your existing documents.',
    icon: FileUp,
    href: '/analyze',
  },
  {
    id: 'create',
    label: 'Create with AI',
    description: 'Start from a blank page with an AI partner to help you draft and create.',
    icon: FilePlus2,
    href: '#',
  },
  {
    id: 'summarize',
    label: 'Summarize a Meeting',
    description: 'Turn lengthy transcripts into concise summaries and actionable insights.',
    icon: Users,
    href: '/summarize-meeting',
  },
];

export default function DashboardPage() {
  const { firestore, user } = useUser();
  const [isNewDocDialogOpen, setIsNewDocDialogOpen] = useState(false);

  const documentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, `users/${user.uid}/documents`), 
        orderBy('uploadDate', 'desc'), 
        limit(3)
    );
  }, [firestore, user]);

  const { data: recentDocuments, isLoading: isLoadingDocs } = useCollection(documentsQuery);
  
  const threadsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, `users/${user.uid}/aiMemoryThreads`),
      orderBy('lastActivityTime', 'desc'),
      limit(4)
    );
  }, [firestore, user]);

  const { data: recentThreads, isLoading: isLoadingThreads } = useCollection(threadsQuery);


  const handleQuickAction = (id: string) => {
    if (id === 'create') {
      setIsNewDocDialogOpen(true);
    }
    // Add handlers for other actions later
  }

  return (
    <>
    <NewDocumentDialog open={isNewDocDialogOpen} onOpenChange={setIsNewDocDialogOpen} />
    <div className="grid gap-8 animate-fade-in">
      
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 animate-fade-slide-up" style={{ animationDelay: '100ms'}}>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>
              Quickly jump back into your work.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {isLoadingDocs && Array.from({length: 3}).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-[75px] w-[53px] rounded-md shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
            {!isLoadingDocs && recentDocuments?.length === 0 && (
                <p className='text-sm text-muted-foreground text-center py-8'>No documents found. Upload one to get started!</p>
            )}
            {recentDocuments?.map((doc) => {
              const docImage = placeholderImages.placeholderImages.find(p => p.id === 'doc-thumb-1');
              return (
                <div key={doc.id} className="flex items-center gap-4">
                  {docImage && (
                    <Image
                      src={docImage.imageUrl}
                      alt={doc.filename}
                      data-ai-hint={docImage.imageHint}
                      width={53}
                      height={75}
                      className="rounded-md object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <Link href={`/documents/${doc.id}`} className="font-semibold hover:underline">
                      {doc.filename}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {doc.uploadDate ? `Modified ${formatDistanceToNow(doc.uploadDate.toDate(), { addSuffix: true })}` : 'Modified recently'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/documents/${doc.id}`}>Open</Link>
                  </Button>
                </div>
              );
            })}
          </CardContent>
           <CardFooter>
             <Button variant="outline" className="w-full" asChild>
                <Link href="/documents">View all documents</Link>
             </Button>
           </CardFooter>
        </Card>
        
        <Card className="animate-fade-slide-up" style={{ animationDelay: '200ms'}}>
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
            <CardDescription>
                Pick up where your AI assistant left off.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
             {isLoadingThreads && Array.from({length: 4}).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
             ))}
             {!isLoadingThreads && recentThreads?.length === 0 && (
                <div className='text-sm text-muted-foreground text-center py-8 flex flex-col items-center'>
                    <MessageSquare className="h-8 w-8 mb-2"/>
                    <p>No AI chats yet.</p>
                </div>
             )}
             {recentThreads?.map((thread) => (
                <div key={thread.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                        <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <Link href={`/documents/${thread.documentId}`} className="font-semibold hover:underline text-sm leading-tight">
                            {thread.documentFilename || 'Untitled Document'}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">
                            {thread.lastActivityTime ? `${formatDistanceToNow(thread.lastActivityTime.toDate(), { addSuffix: true })}` : 'Recently'}
                        </p>
                    </div>
                </div>
             ))}
          </CardContent>
           <CardFooter>
             <Button variant="outline" className="w-full" asChild>
                <Link href="/memory-threads">View all conversations</Link>
             </Button>
           </CardFooter>
        </Card>

      </div>


      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 animate-fade-slide-up" style={{ animationDelay: '300ms'}}>
           <CardHeader>
            <CardTitle>AI-Powered Actions</CardTitle>
            <CardDescription>
              Supercharge your workflow with a single click.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, i) => (
              <Card key={action.label} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col">
                <CardHeader className="pb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
                        <action.icon className="h-5 w-5 text-primary" />
                    </div>
                  <h3 className="font-semibold">
                    {action.label}
                  </h3>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild={action.id !== 'create'} size="sm" variant="ghost" className="-ml-4" onClick={() => handleQuickAction(action.id)}>
                    <Link href={action.href}>
                      Start Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card className="animate-fade-slide-up" style={{ animationDelay: '400ms'}}>
          <CardHeader>
            <CardTitle>AI Usage</CardTitle>
            <CardDescription>
              Your AI credit usage over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AiUsageChart />
          </CardContent>
        </Card>
      </div>

    </div>
    </>
  );
}
