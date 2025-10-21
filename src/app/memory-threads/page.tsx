
'use client';

import { supabase } from '@/lib/supabaseClient';
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
import { User } from '@supabase/supabase-js';

interface ThreadData {
  id: string;
  user_id: string;
  document_id: string;
  document_filename?: string;
  last_activity_time?: string;
  is_pinned?: boolean;
  badge?: string;
}

interface Message {
    id: string;
    sender: 'user' | 'ai';
    content: string;
    created_at: string;
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
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

    const handleAccordionToggle = async (isOpen: boolean) => {
        setIsAccordionOpen(isOpen);
        if (isOpen && messages.length === 0) {
            setIsLoadingMessages(true);
            const { data, error } = await supabase
                .from('ai_messages')
                .select('*')
                .eq('thread_id', thread.id)
                .order('created_at', { ascending: true });

            if (data) {
                setMessages(data);
            }
            if (error) {
                console.error('Error fetching messages:', error);
            }
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
                        <Link href={`/documents/${thread.document_id}`} className="font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>{thread.document_filename || 'Untitled Document'}</Link>
                        <p className="text-sm text-muted-foreground">Last activity {thread.last_activity_time ? formatDistanceToNow(new Date(thread.last_activity_time), { addSuffix: true }) : 'recently'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {thread.badge && <Badge variant="secondary">{thread.badge}</Badge>}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onTogglePin(); }}>
                                    <Pin className={cn("h-4 w-4 transition-colors", thread.is_pinned ? 'text-primary fill-primary' : 'text-muted-foreground hover:text-primary')} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{thread.is_pinned ? 'Unpin' : 'Pin'} conversation</p></TooltipContent>
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
                        <Link href={`/documents/${thread.document_id}`}>Resume <ChevronRight className="h-4 w-4 ml-2" /></Link>
                    </Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

export default function MemoryThreadsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [threadsData, setThreadsData] = useState<ThreadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndThreads = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
            const { data, error } = await supabase
                .from('ai_memory_threads')
                .select('*')
                .eq('user_id', user.id);
            
            if (data) {
                setThreadsData(data);
            }
            if (error) {
                console.error("Error fetching threads:", error);
            }
        }
        setIsLoading(false);
    };
    fetchUserAndThreads();
  }, []);

  const togglePin = async (thread: ThreadData) => {
    if (!user) return;
    const newPinnedState = !thread.is_pinned;
    await supabase
        .from('ai_memory_threads')
        .update({ is_pinned: newPinnedState })
        .eq('id', thread.id);
    // Refresh data
    setThreadsData(threadsData.map(t => t.id === thread.id ? { ...t, is_pinned: newPinnedState } : t));
  };
  
  const updateBadge = async (thread: ThreadData, newBadge: string) => {
    if (!user) return;
    await supabase
        .from('ai_memory_threads')
        .update({ badge: newBadge })
        .eq('id', thread.id);
    // Refresh data
    setThreadsData(threadsData.map(t => t.id === thread.id ? { ...t, badge: newBadge } : t));
  };

  const sortedThreads = useMemo(() => {
      return [...threadsData].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        const timeA = a.last_activity_time ? new Date(a.last_activity_time).getTime() : 0;
        const timeB = b.last_activity_time ? new Date(b.last_activity_time).getTime() : 0;
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
