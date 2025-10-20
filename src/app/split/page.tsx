
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
import { Split, Loader2, Sparkles, UploadCloud, Download, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { splitDocument } from '@/ai/flows/ai-split-document';

export default function SplitDocumentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [splitRange, setSplitRange] = useState('');
  const [splitFile, setSplitFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSplitFile(null);
    }
  };

  const isSplitButtonDisabled = () => {
    return isLoading || !file || !splitRange.trim();
  };

  const handleSplit = async () => {
    if (isSplitButtonDisabled()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please upload a file and specify the page range to extract.',
      });
      return;
    }
    setIsLoading(true);
    setSplitFile(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file as Blob);
      reader.onload = async (loadEvent) => {
        const fileDataUri = loadEvent.target?.result as string;
        const result = await splitDocument({ fileDataUri, pageRange: splitRange });
        setSplitFile(result.splitFileDataUri);
        toast({
          title: 'Split Complete',
          description: 'The selected pages have been extracted.',
        });
      };
    } catch (e: any) {
      console.error('Split Document Error:', e);
      toast({
        variant: 'destructive',
        title: 'Split Failed',
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
          <Split className="h-8 w-8" />
          Split PDF
        </h1>
        <p className="text-muted-foreground">
          Extract one or more pages from a PDF file.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle>Input & Settings</CardTitle>
            <CardDescription>
                Upload a file and choose the pages to extract. (e.g., "1-3, 5, 8-10")
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label>1. Upload File</Label>
                <Input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept="application/pdf"
                />
                {file ? (
                    <div className="text-sm p-4 border rounded-md flex items-center justify-between">
                        <span>{file.name}</span>
                         <Button variant="outline" size="sm" onClick={() => { setFile(null); setSplitFile(null); }}>Change File</Button>
                    </div>

                ): (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                        disabled={isLoading}
                    >
                        <UploadCloud className="h-10 w-10 text-muted-foreground" />
                        <span className="mt-2 font-semibold">Click to upload a PDF</span>
                        <span className="text-sm text-muted-foreground">Select a file from your device</span>
                    </button>
                )}
             </div>

            <div className="space-y-2">
                <Label htmlFor='page-range'>2. Select Pages to Extract</Label>
                <Input 
                    id="page-range"
                    placeholder='e.g., 1-3, 5, 8-10'
                    value={splitRange}
                    onChange={(e) => setSplitRange(e.target.value)}
                    disabled={isLoading || !file}
                />
            </div>
            
            <Button onClick={handleSplit} disabled={isSplitButtonDisabled()} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Splitting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Split File
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extracted File</CardTitle>
            <CardDescription>
              Your new file with the selected pages will be ready below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            {!isLoading && !splitFile && (
              <div className="text-center text-muted-foreground p-8">
                <Split className="h-12 w-12 mx-auto text-muted-foreground/50"/>
                <p className="mt-4">Your split file will appear here.</p>
              </div>
            )}
            {splitFile && file && (
                <div className="p-4 border rounded-md flex items-center justify-between animate-fade-in">
                    <p className="font-semibold">Ready to download!</p>
                    <Button asChild>
                        <a href={splitFile} download={`${file.name.replace('.pdf', '')}-split.pdf`}>
                            <Download className="mr-2 h-4 w-4"/>
                            Download Split PDF
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
