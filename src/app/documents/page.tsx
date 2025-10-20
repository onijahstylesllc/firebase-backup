
'use client';

import Link from 'next/link';
import {
  File,
  MoreHorizontal,
  PlusCircle,
  UploadCloud,
  Archive,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import placeholderImages from '@/lib/placeholder-images.json';
import { FileUpload, type FileUploadStatus } from '@/components/documents/file-upload';
import { useState } from 'react';
import { useUser, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { NewDocumentDialog } from '@/components/documents/new-document-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { summarizeDocument } from '@/ai/flows/ai-archive-old-docs';
import { SummaryDialog } from '@/components/documents/summary-dialog';

const getAvatarImage = (owner?: string) => {
    if (!owner) return null;
    if (owner === "Alice Johnson") return placeholderImages.placeholderImages.find(p => p.id === "user-avatar-1");
    if (owner === "Bob Williams") return placeholderImages.placeholderImages.find(p => p.id === "user-avatar-2");
    if (owner === "Charlie Brown") return placeholderImages.placeholderImages.find(p => p.id === "user-avatar-3");
    return null;
}

const getStatusBadge = (status?: string) => {
    switch (status) {
        case 'in-progress':
            return <Badge variant="secondary" className="gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> In Progress</Badge>;
        case 'queued':
            return <Badge variant="secondary" className="gap-1.5"><Clock className="h-3.5 w-3.5" /> Queued</Badge>;
        case 'completed':
            return <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30 gap-1.5"><CheckCircle className="h-3.5 w-3.5" /> Completed</Badge>;
        case 'failed':
            return <Badge variant="destructive" className="gap-1.5"><XCircle className="h-3.5 w-3.5" /> Failed</Badge>;
        default:
            return null;
    }
}

export default function DocumentsPage() {
  const [uploads, setUploads] = useState<FileUploadStatus[]>([]);
  const { firestore, user } = useUser();
  const [isNewDocDialogOpen, setIsNewDocDialogOpen] = useState(false);
  const [summaryDoc, setSummaryDoc] = useState<any | null>(null);
  const { toast } = useToast();

  const documentsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'users', user.uid, 'documents'),
        orderBy('uploadDate', 'desc')
    );
  }, [firestore, user]);

  const { data: documents, isLoading } = useCollection(documentsQuery);
  
  const handleNewUploads = (newUploads: FileUploadStatus[]) => {
    setUploads(prev => [...newUploads, ...prev]);
  };
  
  const updateUploadProgress = (id: string, progress: number) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, progress } : u));
  };

  const setUploadStatus = (id: string, status: 'completed' | 'failed', error?: string) => {
    setUploads(prev => {
        const upload = prev.find(u => u.id === id);
        if (!upload) return prev;

        if (status === 'completed') {
            return prev.filter(u => u.id !== id);
        } else {
            return prev.map(u => u.id === id ? { ...u, status, error } : u);
        }
    });
  };

  const handleSummarizeAndArchive = async (docData: any) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, `users/${user.uid}/documents`, docData.id);

    await updateDoc(docRef, { processingStatus: 'queued' });

    toast({
        title: "Summarization Queued",
        description: `Request to summarize "${docData.filename}" has been added to the queue.`
    });

    try {
        await updateDoc(docRef, { processingStatus: 'in-progress' });
        
        const result = await summarizeDocument({
            documentContent: docData.content || `This is the content of the document named ${docData.filename}. In a real application, the full text would be extracted and passed here.`,
        });

        await updateDoc(docRef, {
            processingStatus: 'completed',
            isArchived: true,
            archivedAt: serverTimestamp(),
            archiveSummary: result.summary,
        });

        toast({
            title: "Summarization Complete",
            description: `"${docData.filename}" has been successfully summarized and archived.`
        });

    } catch (e: any) {
        console.error("Summarization error:", e);
        await updateDoc(docRef, { processingStatus: 'failed' });
        toast({
            variant: "destructive",
            title: "Summarization Failed",
            description: e.message || "Could not process the document."
        });
    }
  }

  const allDocs = (documents?.map(d => {
      const uploadDate = d.uploadDate?.toDate ? d.uploadDate.toDate() : new Date();
      return {...d, uploadDate };
  }) || []);
  
  const currentUploads = uploads.filter(u => u.status !== 'completed').sort((a, b) => a.file.lastModified - b.file.lastModified);


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }


  return (
    <>
    <NewDocumentDialog open={isNewDocDialogOpen} onOpenChange={setIsNewDocDialogOpen} />
    <SummaryDialog doc={summaryDoc} onOpenChange={() => setSummaryDoc(null)} />
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-headline">Documents</CardTitle>
            <CardDescription>
              Manage, edit, and share all your documents from one place.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <FileUpload 
              onNewUploads={handleNewUploads}
              onUploadProgress={updateUploadProgress}
              onUploadStatusChange={setUploadStatus}
            >
              <Button size="sm" variant="outline">
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </FileUpload>
            <Button size="sm" onClick={() => setIsNewDocDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Owner</TableHead>
              <TableHead className="hidden lg:table-cell">
                Date Added
              </TableHead>
              <TableHead className="hidden sm:table-cell">Size</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {currentUploads.map((doc) => (
                <TableRow key={doc.id} className="opacity-70 animate-fade-in">
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">{doc.file.name}</span>
                       <div className="flex items-center gap-2">
                           <Progress value={doc.progress || 0} className="h-1 w-24" />
                           <span className="text-xs text-muted-foreground">{Math.round(doc.progress || 0)}%</span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                             <AvatarFallback>Y</AvatarFallback>
                        </Avatar>
                        <span>You</span>
                      </div>
                  </TableCell>
                   <TableCell className="hidden lg:table-cell">
                    {format(new Date(doc.file.lastModified), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                     {formatFileSize(doc.file.size)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                     {getStatusBadge(doc.status)}
                  </TableCell>
                  <TableCell>
                  </TableCell>
                </TableRow>
             ))}
            {isLoading && currentUploads.length === 0 && (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
            )}
            {!isLoading && allDocs.length === 0 && currentUploads.length === 0 &&(
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                        <div className="animate-fade-in">
                            <File className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
                            <p className="text-muted-foreground mt-1">Upload your first document to get started.</p>
                        </div>
                    </TableCell>
                </TableRow>
            )}
            {allDocs.map((doc, i) => {
              const ownerAvatar = getAvatarImage(doc.owner);
              const isDisabled = doc.processingStatus === 'queued' || doc.processingStatus === 'in-progress';
              const isComplete = doc.processingStatus === 'completed';
              return (
                <TableRow key={doc.id} className="animate-fade-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <TableCell className="font-medium">
                     <Link
                        href={`/documents/${doc.id}`}
                        className="hover:underline"
                      >
                        {doc.filename}
                      </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            {ownerAvatar && <AvatarImage src={ownerAvatar.imageUrl} alt={doc.owner} />}
                             <AvatarFallback>{doc.owner?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <span>{doc.owner}</span>
                      </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {format(doc.uploadDate, 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatFileSize(doc.fileSize)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {getStatusBadge(doc.processingStatus)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                          disabled={isDisabled}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {isComplete && doc.archiveSummary ? (
                          <DropdownMenuItem onClick={() => setSummaryDoc(doc)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Summary
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSummarizeAndArchive(doc)}>
                            <Archive className="mr-2 h-4 w-4" />
                            Summarize & Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild><Link href={`/documents/${doc.id}`}>Edit</Link></DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </>
  );
}
