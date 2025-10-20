
'use client';

import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  PanelLeft,
  Share2,
  ZoomIn,
  ZoomOut,
  Type,
  ImageIcon,
  MousePointer,
  PencilRuler,
  Signature,
  Send,
  Loader2,
  Bot,
  PanelRight,
} from 'lucide-react';
import Image from 'next/image';
import { notFound, usePathname } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import placeholderImages from '@/lib/placeholder-images.json';
import { useUser, useMemoFirebase, useProfile } from '@/firebase';
import { doc, collection, orderBy, query, serverTimestamp, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useState, useRef, useEffect, useCallback } from 'react';
import { chatWithDocument } from '@/ai/flows/ai-chat-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader, type ImageUploadStatus } from '@/components/documents/image-uploader';
import { v4 as uuidv4 } from 'uuid';


const editorTools = [
  { id: 'select', icon: MousePointer, label: 'Select' },
  { id: 'text', icon: Type, label: 'Edit Text' },
  { id: 'image', icon: ImageIcon, label: 'Add Image' },
  { id: 'shapes', icon: PencilRuler, label: 'Shapes' },
  { id: 'sign', icon: Signature, label: 'Sign' },
];

function ChatMessage({ sender, content }: { sender: 'user' | 'ai', content: string }) {
    const isUser = sender === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                    <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
                </Avatar>
            )}
            <div className={`p-3 rounded-lg text-sm max-w-xs md:max-w-md ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p>{content}</p>
            </div>
        </div>
    );
}

const chatSuggestions = [
    'Summarize this document',
    'What are the key takeaways?',
    'What is the tone of this document?',
    'Who are the main parties mentioned?',
]

function AiChatAssistant({ documentId, documentData }: { documentId: string, documentData: any }) {
  const { firestore, user } = useUser();
  const { profile } = useProfile();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const threadRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // We use a consistent thread ID for the main chat per document.
    return doc(firestore, `users/${user.uid}/aiMemoryThreads`, `${documentId}-main`);
  }, [firestore, user, documentId]);

  const messagesQuery = useMemoFirebase(() => {
    if (!threadRef) return null;
    return query(collection(threadRef, 'aiMessages'), orderBy('timestamp', 'asc'));
  }, [threadRef]);

  const { data: messages, isLoading } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);


  const handleSend = async (messageText?: string) => {
    const messageToSend = messageText || input;
    if (!messageToSend.trim() || !user || !firestore || isSending || !threadRef) return;

    setInput('');
    setIsSending(true);

    const messagesCollection = collection(threadRef, 'aiMessages');

    // Optimistically add user message
     await addDocumentNonBlocking(messagesCollection, {
      sender: 'user',
      content: messageToSend,
      timestamp: serverTimestamp(),
    });


    // Ensure thread document exists
    const threadSnap = await getDoc(threadRef);
    if (!threadSnap.exists()) {
        await setDoc(threadRef, {
            documentId: documentId,
            userId: user.uid,
            startTime: serverTimestamp(),
            lastActivityTime: serverTimestamp(),
            documentFilename: documentData.filename,
        });
    } else {
         await updateDoc(threadRef, { lastActivityTime: serverTimestamp() });
    }

    try {
        const visualModeEnabled = profile?.aiPreferences?.visualMode;
        const editorImage = placeholderImages.placeholderImages.find(p => p.id === "editor-page");

        const chatHistory = (messages || []).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            content: [{ text: msg.content }],
        }));

        const aiResponse = await chatWithDocument({
            documentImage: visualModeEnabled && editorImage ? editorImage.imageUrl : undefined,
            message: messageToSend,
            history: chatHistory,
            personalization: profile?.aiPreferences,
        });

        // Add AI response to Firestore
        await addDocumentNonBlocking(messagesCollection, {
            sender: 'ai',
            content: aiResponse.response,
            timestamp: serverTimestamp(),
        });

    } catch (error) {
        console.error("AI chat error:", error);
         await addDocumentNonBlocking(messagesCollection, {
            sender: 'ai',
            content: "Sorry, I ran into an error. This could be due to a missing API key for the AI service. Please check your environment variables.",
            timestamp: serverTimestamp(),
        });
    } finally {
        setIsSending(false);
         // Update last activity time after conversation turn
        await updateDoc(threadRef, { lastActivityTime: serverTimestamp() });
    }
  };
  
  return (
    <div className="h-full flex flex-col">
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
                 {isLoading && (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-12 w-3/4 ml-auto" />
                    </div>
                )}
                {messages && messages.length === 0 && !isLoading && (
                     <div className="p-3 rounded-lg bg-muted text-sm text-center">
                        <p className='font-semibold mb-2'>Hi! I'm DocuMind AI. </p>
                        <p className='text-muted-foreground mb-4'>Here are some things you can ask me to get started:</p>
                        <div className='grid grid-cols-2 gap-2 text-left'>
                            {chatSuggestions.map(suggestion => (
                                <Button 
                                    key={suggestion}
                                    variant="outline" 
                                    size="sm" 
                                    className="h-auto whitespace-normal"
                                    onClick={() => handleSend(suggestion)}
                                    disabled={isSending}
                                >
                                    {suggestion}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
                {messages?.map((msg) => (
                    <ChatMessage key={msg.id} sender={msg.sender} content={msg.content} />
                ))}
                 {isSending && (
                    <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                            <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
                        </Avatar>
                        <div className="p-3 rounded-lg bg-muted text-sm flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Thinking...</span>
                        </div>
                    </div>
                 )}
            </div>
        </ScrollArea>
        <div className="p-2 border-t flex items-center gap-2">
            <Input 
                placeholder="Ask AI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isSending}
            />
            <Button size="icon" onClick={() => handleSend()} disabled={isSending || !input.trim()}>
                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5"/>}
            </Button>
        </div>
    </div>
  );
}

function Comments() {
    return (
        <div className="p-4 h-full flex flex-col items-center justify-center text-center">
             <MessageSquare className="h-12 w-12 text-muted-foreground/50"/>
             <p className="mt-4 text-sm text-muted-foreground">Select text to add a comment.</p>
        </div>
    )
}

const PDF_PAGE_WIDTH = 800;
const PDF_PAGE_HEIGHT = 1131;

// This component represents a single page of the document
function Page({ pageNumber, isVisible, imageUrl, imageHint, children }: { pageNumber: number, isVisible: boolean, imageUrl: string, imageHint: string, children?: React.ReactNode }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (isVisible && canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
                // Example annotation: draw a semi-transparent rectangle
                // This demonstrates the canvas is working and positioned correctly.
                context.fillStyle = 'rgba(255, 200, 0, 0.3)'; // Semi-transparent yellow
                context.strokeStyle = 'rgba(255, 200, 0, 0.8)';
                context.lineWidth = 2;
                context.fillRect(100, 150, 250, 80);
                context.strokeRect(100, 150, 250, 80);
            }
        }
    }, [isVisible]);

    return (
        <div className="relative w-full mx-auto" style={{ maxWidth: `${PDF_PAGE_WIDTH}px`, minHeight: `${PDF_PAGE_HEIGHT}px` }}>
            {isVisible ? (
                <>
                    <Image
                        src={imageUrl}
                        alt={`Page ${pageNumber}`}
                        data-ai-hint={imageHint}
                        width={PDF_PAGE_WIDTH}
                        height={PDF_PAGE_HEIGHT}
                        className="w-full h-auto rounded-lg bg-background shadow-lg"
                        priority={pageNumber <= 2} // Prioritize loading the first couple of pages
                    />
                    <canvas 
                        ref={canvasRef}
                        width={PDF_PAGE_WIDTH}
                        height={PDF_PAGE_HEIGHT}
                        className="absolute inset-0"
                    />
                    <div className="absolute inset-0">
                        {children}
                    </div>
                </>
            ) : (
                // Render a skeleton placeholder for pages that are not visible
                <Skeleton className="w-full h-full rounded-lg" style={{minHeight: `${PDF_PAGE_HEIGHT}px`}} />
            )}
        </div>
    );
}

function TemplateContentViewer({ content }: { content: string }) {
  return (
    <Card className="w-full mx-auto max-w-4xl my-8">
      <CardHeader>
        <CardTitle>Template Content</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}


export default function DocumentEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const { user, firestore } = useUser();
  const docThumbnails = placeholderImages.placeholderImages.filter(p => p.id.startsWith('doc-thumb-'));
  
  // For this demo, we'll assume a fixed number of pages for uploaded docs.
  const TOTAL_PAGES = docThumbnails.length;

  const [visiblePages, setVisiblePages] = useState(new Set([1]));
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [uploads, setUploads] = useState<ImageUploadStatus[]>([]);

  const handleNewUploads = (newUploads: ImageUploadStatus[]) => {
    setUploads(prev => [...prev, ...newUploads]);
  };

  const updateUploadProgress = (id: string, progress: number) => {
    setUploads(prev => prev.map(u => (u.id === id ? { ...u, progress } : u)));
  };

  const handleUploadCompleted = (id: string, url: string) => {
    if (docRef) {
        updateDocumentNonBlocking(docRef, { imageUrls: arrayUnion(url) });
    }
    setUploads(prev => prev.filter(u => u.id !== id));
  };


  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              const pageNumber = parseInt(entry.target.getAttribute('data-page-number') || '0', 10);
              if (pageNumber) {
                  setVisiblePages(prev => {
                      const newVisible = new Set(prev);
                      // Add current, previous, and next pages for prefetching effect
                      newVisible.add(pageNumber);
                      if (pageNumber > 1) newVisible.add(pageNumber - 1);
                      if (pageNumber < TOTAL_PAGES) newVisible.add(pageNumber + 1);
                      return newVisible;
                  });
              }
          }
      });
  }, [TOTAL_PAGES]);
  
  useEffect(() => {
      const observer = new IntersectionObserver(handleIntersection, {
          root: null, // observes intersections relative to the viewport
          rootMargin: '100px', // pre-load pages that are 100px away from the viewport
          threshold: 0.1 // trigger when 10% of the page is visible
      });
  
      pageRefs.current.forEach(ref => {
          if (ref) observer.observe(ref);
      });
  
      return () => {
          pageRefs.current.forEach(ref => {
              if (ref) observer.unobserve(ref);
          });
      };
  }, [handleIntersection]);

  const docRef = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return doc(firestore, 'users', user.uid, 'documents', params.id);
  }, [user, firestore, params.id]);

  const { data: docData, isLoading: isDocLoading } = useDoc(docRef);
  
  const pathname = usePathname();
  if (isDocLoading && pathname !== '/documents') {
      return (
         <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading Document...</p>
            </div>
        </div>
      )
  }

  if (!docData) {
    notFound();
  }
  
  const isFromTemplate = !!docData.content;

  return (
    <div className="fixed inset-0 top-14 flex flex-col bg-muted/30">
      {/* Top Bar */}
      <header className="flex h-14 items-center gap-2 border-b bg-background px-4">
        <h1 className="flex-1 truncate font-semibold">{docData.filename}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button size="sm">Download</Button>
           {/* Mobile Sidebar Trigger for Comments/AI */}
          <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden"><PanelRight className="h-5 w-5"/></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm p-0">
                <Tabs defaultValue="ai" className="flex-1 flex flex-col h-full">
                    <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                        <TabsTrigger value="comments"><MessageSquare className="h-4 w-4 mr-2"/>Comments</TabsTrigger>
                        <TabsTrigger value="ai"><Bot className="h-4 w-4 mr-2"/>AI Assistant</TabsTrigger>
                    </TabsList>
                    <TabsContent value="comments" className="flex-1 m-0">
                        <Comments />
                    </TabsContent>
                    <TabsContent value="ai" className="flex-1 m-0 h-full">
                        <AiChatAssistant documentId={params.id} documentData={docData} />
                    </TabsContent>
                </Tabs>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <div className="hidden sm:flex flex-col items-center gap-2 border-r bg-background p-2">
          {editorTools.map((tool) => (
            tool.id === 'image' ? (
                 <ImageUploader 
                    key={tool.id} 
                    documentId={params.id}
                    onNewUploads={handleNewUploads}
                    onUploadProgress={updateUploadProgress}
                    onUploadCompleted={handleUploadCompleted}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        aria-label={tool.label}
                    >
                        <tool.icon className="h-5 w-5" />
                    </Button>
                </ImageUploader>
            ) : (
                <Button
                key={tool.label}
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                aria-label={tool.label}
                >
                <tool.icon className="h-5 w-5" />
                </Button>
            )
          ))}
        </div>

        {/* Left Sidebar (Page Thumbnails) */}
        {!isFromTemplate && (
          <Sheet>
            <SheetTrigger asChild>
              <div className="absolute left-12 sm:left-16 top-1/2 -translate-y-1/2 z-10">
                <Button size="icon" variant="secondary" className="rounded-r-full rounded-l-none h-16 w-8 border-l-0">
                  <PanelLeft className="h-5 w-5" />
                </Button>
              </div>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Pages</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="grid grid-cols-2 gap-4 p-4">
                  {docThumbnails.map((thumb, index) => (
                    <div key={thumb.id} className="relative group cursor-pointer">
                      <Image
                        src={thumb.imageUrl}
                        alt={`Page ${index + 1}`}
                        data-ai-hint={thumb.imageHint}
                        width={100}
                        height={141}
                        className="rounded-md border-2 border-transparent group-hover:border-primary"
                      />
                      <div className="absolute bottom-1 right-1 bg-background/80 text-xs rounded-sm px-1.5 py-0.5">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}

        {/* Main Canvas */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
            {isFromTemplate ? (
                <TemplateContentViewer content={docData.content} />
            ) : (
                <div className="space-y-4">
                    {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map(pageNumber => {
                        const pageImage = docThumbnails[pageNumber - 1] || placeholderImages.placeholderImages.find(p => p.id === 'editor-page');
                        return (
                            <div
                                key={pageNumber}
                                ref={el => (pageRefs.current[pageNumber - 1] = el)}
                                data-page-number={pageNumber}
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    isVisible={visiblePages.has(pageNumber)}
                                    imageUrl={pageImage!.imageUrl}
                                    imageHint={pageImage!.imageHint}
                                >
                                    {pageNumber === 1 && (
                                        <div className="p-4 space-y-2">
                                        {uploads.map(upload => (
                                             <div key={upload.id} className="w-40 h-40 relative">
                                                <Skeleton className="w-full h-full" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                                </div>
                                             </div>
                                        ))}
                                        {docData?.imageUrls?.map((url: string, i: number) => (
                                            <div key={i} className="w-40 h-auto relative">
                                                <Image src={url} alt={`uploaded image ${i+1}`} width={160} height={160} className="object-contain" />
                                            </div>
                                        ))}
                                        </div>
                                    )}
                                </Page>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
        
        {/* Right Sidebar (Comments & AI) */}
        <aside className="w-80 border-l bg-background hidden lg:flex flex-col">
            <Tabs defaultValue="ai" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                    <TabsTrigger value="comments"><MessageSquare className="h-4 w-4 mr-2"/>Comments</TabsTrigger>
                    <TabsTrigger value="ai"><Bot className="h-4 w-4 mr-2"/>AI Assistant</TabsTrigger>
                </TabsList>
                <TabsContent value="comments" className="flex-1 overflow-auto p-4 m-0">
                    <Comments />
                </TabsContent>
                <TabsContent value="ai" className="flex-1 m-0 h-full">
                    <AiChatAssistant documentId={params.id} documentData={docData} />
                </TabsContent>
            </Tabs>
        </aside>

      </div>

      {/* Bottom Bar */}
      <footer className="flex h-12 items-center justify-center gap-2 border-t bg-background">
        <div className="sm:hidden flex flex-wrap items-center justify-center gap-1">
             {editorTools.map((tool) => (
                <Button
                    key={tool.label}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    aria-label={tool.label}
                >
                    <tool.icon className="h-5 w-5" />
                </Button>
            ))}
        </div>
        <div className="hidden sm:flex items-center">
            <Button variant="ghost" size="icon">
            <ZoomOut className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold">100%</span>
            <Button variant="ghost" size="icon">
            <ZoomIn className="h-5 w-5" />
            </Button>
        </div>
      </footer>
    </div>
  );
}
