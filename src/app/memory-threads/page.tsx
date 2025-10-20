
'use client';

import { useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, MessageSquare, ChevronRight, Pin } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils';
import { useCollection } from '@/firebase/firestore/use-collection';

interface ThreadData {
  id: string;
  userId: string;
  documentId: string;
  documentFilename?: string;
  lastActivityTime?: any; // Firestore Timestamp
  isPinned?: boolean;
  badge?: string;
}

interface Message {
    id: string;
    sender: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

function ChatMessage({ sender, content }: { sender: 'user' | 'ai', content: string }) {
    const isUser = sender === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''} animate-fade-in`}>
            {!isUser && (
                <Avatar className="h-8 w-8 bg-primary/10 text-primary shrink-0">
                    <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
                </Avatar>
            )}
            <div className={`p-3 rounded-lg text-sm max-w-xs md:max-w-md ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p>{content}</p>
            </div>
        </div>
    );
}

function ThreadItem({ thread, onTogglePin, onUpdateBadge }: { thread: ThreadData, onTogglePin: () => void, onUpdateBadge: (badge: string) => void }) {
    const { firestore } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

    const handleAccordionToggle = async (isOpen: boolean) => {
        setIsAccordionOpen(isOpen);
        if (isOpen && messages.length === 0 && firestore) {
            setIsLoadingMessages(true);
            const messagesQuery = query(collection(firestore, `users/${thread.userId}/aiMemoryThreads/${thread.id}/aiMessages`), orderBy('timestamp', 'asc'));
            const messagesSnapshot = await getDocs(messagesQuery);
            const fetchedMessages: Message[] = messagesSnapshot.docs.map(msgDoc => {
                const msgData = msgDoc.data();
                return {
                    id: msgDoc.id,
                    sender: msgData.sender,
                    content: msgData.content,
                    timestamp: msgData.timestamp?.toDate() || new Date(),
                }
            });
            setMessages(fetchedMessages);
            setIsLoadingMessages(false);
        }
    }

    return (
        <AccordionItem value={thread.id} className="border rounded-lg bg-card transition-all hover:shadow-md">
             <AccordionTrigger 
                className="p-4 hover:no-underline w-full [&[data-state=open]>div>svg.chevron]:rotate-180" 
                onValueChange={handleAccordionToggle}
                asChild
            >
                 <div className="flex items-center gap-4 cursor-pointer">
                    <Avatar className="h-10 w-10 bg-primary/10 text-primary hidden sm:flex">
                        <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                        <Link href={`/documents/${thread.documentId}`} className="font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>{thread.documentFilename || 'Untitled Document'}</Link>
                        <p className="text-sm text-muted-foreground">Last activity {thread.lastActivityTime ? formatDistanceToNow(thread.lastActivityTime.toDate(), { addSuffix: true }) : 'recently'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {thread.badge && <Badge variant="secondary">{thread.badge}</Badge>}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onTogglePin(); }}>
                                    <Pin className={cn("h-4 w-4 transition-colors", thread.isPinned ? 'text-primary fill-primary' : 'text-muted-foreground hover:text-primary')} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{thread.isPinned ? 'Unpin' : 'Pin'} conversation</p></TooltipContent>
                        </Tooltip>
                         <div className="p-2 hover:bg-muted rounded-md">
                            <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 chevron" />
                        </div>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
                <div className="border-t pt-4 space-y-4 max-h-96 overflow-y-auto">
                    {isLoadingMessages && <Skeleton className="h-10 w-full" />}
                    {messages.map(msg => <ChatMessage key={msg.id} sender={msg.sender} content={msg.content} />)}
                </div>
                <div className="border-t pt-4 mt-4 flex items-center gap-2">
                    <Input 
                        placeholder="Add a badge..." 
                        defaultValue={thread.badge}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onUpdateBadge((e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).blur();
                            }
                        }}
                        className="h-9"
                    />
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/documents/${thread.documentId}`}>Resume <ChevronRight className="h-4 w-4 ml-2" /></Link>
                    </Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

export default function MemoryThreadsPage() {
  const { firestore, user } = useUser();

  const threadsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, `users/${user.uid}/aiMemoryThreads`)
    );
  }, [firestore, user]);

  const { data: threadsData, isLoading } = useCollection<ThreadData>(threadsQuery);

  const togglePin = async (thread: ThreadData) => {
    if (!firestore || !user) return;
    const threadRef = doc(firestore, `users/${user.uid}/aiMemoryThreads`, thread.id);
    const newPinnedState = !thread.isPinned;
    await updateDoc(threadRef, { isPinned: newPinnedState });
  };
  
  const updateBadge = async (thread: ThreadData, newBadge: string) => {
    if (!firestore || !user) return;
    const threadRef = doc(firestore, `users/${user.uid}/aiMemoryThreads`, thread.id);
    await updateDoc(threadRef, { badge: newBadge });
  };

  const sortedThreads = useMemo(() => {
      if (!threadsData) return [];
      return [...threadsData].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const timeA = a.lastActivityTime?.toDate()?.getTime() || 0;
        const timeB = b.lastActivityTime?.toDate()?.getTime() || 0;
        return timeB - timeA;
    });
  }, [threadsData]);

  return (
    <TooltipProvider>
      <div className="grid gap-8 animate-fade-in">
        <div className="mb-2">
          <h1 className="text-3xl font-bold font-headline">AI Memory Threads</h1>
          <p className="text-muted-foreground">
            Review, manage, and continue your AI conversations across all documents.
          </p>
        </div>

        <div className="grid gap-6">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                    <CardContent><Skeleton className="h-4 w-1/2" /></CardContent>
                </Card>
            ))}

          {!isLoading && sortedThreads.length === 0 && (
            <div className="text-center py-16 text-muted-foreground flex flex-col items-center rounded-lg border-2 border-dashed animate-fade-in">
              <MessageSquare className="mx-auto h-16 w-16" />
              <h3 className="mt-4 text-xl font-semibold text-foreground">No Conversations Found</h3>
              <p className="mt-1 max-w-sm">
                Start a chat with the AI assistant in any document to see your conversation history appear here.
              </p>
               <Button asChild className="mt-6">
                <Link href="/documents">
                  Go to Documents
                </Link>
              </Button>
            </div>
          )}

          {!isLoading && sortedThreads.length > 0 && (
             <Accordion type="single" collapsible className="w-full space-y-4">
                 {sortedThreads.map((thread, i) => (
                    <div key={thread.id} className="animate-fade-slide-up" style={{ animationDelay: `${i * 75}ms`}}>
                        <ThreadItem 
                            thread={thread} 
                            onTogglePin={() => togglePin(thread)}
                            onUpdateBadge={(badge) => updateBadge(thread, badge)}
                        />
                    </div>
                ))}
            </Accordion>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
