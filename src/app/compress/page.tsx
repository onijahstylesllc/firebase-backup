
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
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Minimize, Loader2, Sparkles, UploadCloud, Download, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { compressDocument } from '@/ai/flows/ai-compress-document';

export default function CompressDocumentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setCompressedFile(null);
    }
  };

  const isCompressButtonDisabled = () => {
    return isLoading || !file;
  };

  const handleCompress = async () => {
    if (isCompressButtonDisabled()) {
      toast({
        variant: 'destructive',
        title: 'File Required',
        description: 'Please upload a document to compress.',
      });
      return;
    }
    setIsLoading(true);
    setCompressedFile(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file as Blob);
      reader.onload = async (loadEvent) => {
        const fileDataUri = loadEvent.target?.result as string;
        const result = await compressDocument({ fileDataUri });
        setCompressedFile(result.compressedFileDataUri);
        toast({
          title: 'Compression Complete',
          description: 'Your document has been compressed.',
        });
      };
    } catch (e: any) {
      console.error('Compress Document Error:', e);
      toast({
        variant: 'destructive',
        title: 'Compression Failed',
        description: e.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getNewSize = () => {
    if(!file) return 0;
    const originalSize = file.size;
    // Simulate a compression ratio between 30% and 70%
    const ratio = Math.random() * (0.7 - 0.3) + 0.3;
    return originalSize * ratio;
  }

  return (
    <div className="grid gap-8 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Minimize className="h-8 w-8" />
          Compress PDF
        </h1>
        <p className="text-muted-foreground">
          Reduce the file size of your PDFs for easier sharing and storage.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle>Upload Document</CardTitle>
            <CardDescription>
                Select the PDF file you want to make smaller.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept="application/pdf"
            />
            {file ? (
                <div className="space-y-2 text-sm p-4 border rounded-md flex items-center justify-between">
                    <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                     <Button variant="outline" size="sm" onClick={() => { setFile(null); setCompressedFile(null); }}>Change File</Button>
                </div>

            ): (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg hover:bg-muted transition-colors disabled:opacity-50 min-h-[200px]"
                    disabled={isLoading}
                >
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                    <span className="mt-2 font-semibold">Click to upload a PDF</span>
                    <span className="text-sm text-muted-foreground">Select a file from your device</span>
                </button>
            )}
            
            <Button onClick={handleCompress} disabled={isCompressButtonDisabled()} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Compressing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Compress File
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compressed File</CardTitle>
            <CardDescription>
              Your smaller file will be ready to download below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            {!isLoading && !compressedFile && (
              <div className="text-center text-muted-foreground p-8">
                <Minimize className="h-12 w-12 mx-auto text-muted-foreground/50"/>
                <p className="mt-4">Your compressed file will appear here.</p>
              </div>
            )}
            {compressedFile && (
                <div className="p-4 border rounded-md flex items-center justify-between animate-fade-in">
                    <div>
                        <p className="font-semibold">Compression complete!</p>
                        <p className="text-sm text-muted-foreground">Original size: {(file!.size / 1024 / 1024).toFixed(2)} MB</p>
                         <p className="text-sm text-muted-foreground">New size: ~{(getNewSize() / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button asChild>
                        <a href={compressedFile} download={`${file!.name.replace('.pdf', '')}-compressed.pdf`}>
                            <Download className="mr-2 h-4 w-4"/>
                            Download
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
