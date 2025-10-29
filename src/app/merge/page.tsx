
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Combine, Loader2, Sparkles, UploadCloud, Download, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { mergeDocuments } from '@/ai/flows/ai-merge-documents';

export default function MergeDocumentsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedFile, setMergedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles(prev => [...prev, ...Array.from(selectedFiles)]);
      setMergedFile(null);
    }
     if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  const isMergeButtonDisabled = () => {
    return isLoading || files.length < 2;
  };

  const handleMerge = async () => {
    if (isMergeButtonDisabled()) {
      toast({
        variant: 'destructive',
        title: 'Files Required',
        description: 'Please upload at least two documents to merge.',
      });
      return;
    }
    setIsLoading(true);
    setMergedFile(null);

    try {
        const fileDataUris = await Promise.all(
            files.map(file => new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            }))
        );

        const result = await mergeDocuments({ fileDataUris });
        setMergedFile(result.mergedFileDataUri);
        toast({
          title: 'Merge Complete',
          description: 'Your documents have been successfully merged.',
        });
    } catch (e: any) {
      console.error('Merge Documents Error:', e);
      toast({
        variant: 'destructive',
        title: 'Merge Failed',
        description: e.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Combine className="h-8 w-8" />
          Merge PDFs
        </h1>
        <p className="text-muted-foreground">
          Combine multiple PDF files into a single, organized document.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
                Select the PDF files you want to combine.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept="application/pdf"
                multiple
            />
            
            <div className="space-y-2">
                {files.map((file, index) => (
                     <div key={index} className="text-sm p-3 border rounded-md flex items-center justify-between">
                        <span className='truncate pr-2'>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <Button variant="ghost" size="icon" className='h-6 w-6' onClick={() => removeFile(index)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                disabled={isLoading}
            >
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <span className="mt-2 font-semibold">Click to upload PDFs</span>
                <span className="text-sm text-muted-foreground">Add files to the merge queue</span>
            </button>
            
            <Button onClick={handleMerge} disabled={isMergeButtonDisabled()} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Merge Files
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Merged File</CardTitle>
            <CardDescription>
              Your combined file will be ready to download below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            {!isLoading && !mergedFile && (
              <div className="text-center text-muted-foreground p-8">
                <Combine className="h-12 w-12 mx-auto text-muted-foreground/50"/>
                <p className="mt-4">Your merged file will appear here.</p>
              </div>
            )}
            {mergedFile && (
                <div className="p-4 border rounded-md flex items-center justify-between animate-fade-in">
                    <p className="font-semibold">Ready to download!</p>
                    <Button asChild>
                        <a href={mergedFile} download={`merged-document.pdf`}>
                            <Download className="mr-2 h-4 w-4"/>
                            Download Merged PDF
                        </a>
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
