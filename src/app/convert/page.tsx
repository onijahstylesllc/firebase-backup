
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
import { FileCog, Loader2, Sparkles, UploadCloud, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { convertDocument } from '@/ai/flows/ai-convert-document';


const outputFormats = [
    { value: 'docx', label: 'Word (.docx)' },
    { value: 'jpg', label: 'Image (.jpg)' },
    { value: 'png', label: 'Image (.png)' },
    { value: 'txt', label: 'Text (.txt)' },
];


export default function ConvertDocumentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('docx');
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setConvertedFile(null);
    }
  };

  const isConvertButtonDisabled = () => {
    return isLoading || !file || !targetFormat;
  };

  const handleConvert = async () => {
    if (isConvertButtonDisabled()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please upload a file and select a target format.',
      });
      return;
    }
    setIsLoading(true);
    setConvertedFile(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file as Blob);
      reader.onload = async (loadEvent) => {
        const fileDataUri = loadEvent.target?.result as string;
        const result = await convertDocument({ fileDataUri, targetFormat });
        setConvertedFile(result.convertedFileDataUri);
        toast({
            title: 'Conversion Complete',
            description: `Your file has been converted to ${targetFormat.toUpperCase()}.`,
        });
      };
    } catch (e: any) {
      console.error('Convert Document Error:', e);
      toast({
        variant: 'destructive',
        title: 'Conversion Failed',
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
          <FileCog className="h-8 w-8" />
          Convert PDF
        </h1>
        <p className="text-muted-foreground">
          Convert your PDFs to and from other popular file formats.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle>Input & Settings</CardTitle>
            <CardDescription>
                Upload a file and choose the format to convert it to.
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
                         <Button variant="outline" size="sm" onClick={() => { setFile(null); setConvertedFile(null); }}>Change File</Button>
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
                <Label>2. Select Output Format</Label>
                 <Select value={targetFormat} onValueChange={setTargetFormat}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a format..." />
                    </SelectTrigger>
                    <SelectContent>
                        {outputFormats.map(format => (
                            <SelectItem key={format.value} value={format.value}>{format.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <Button onClick={handleConvert} disabled={isConvertButtonDisabled()} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Convert File
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Converted File</CardTitle>
            <CardDescription>
              Your converted file will be ready to download below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            {!isLoading && !convertedFile && (
              <div className="text-center text-muted-foreground p-8">
                <FileCog className="h-12 w-12 mx-auto text-muted-foreground/50"/>
                <p className="mt-4">Your converted file will appear here.</p>
              </div>
            )}
            {convertedFile && file && (
                <div className="p-4 border rounded-md flex items-center justify-between animate-fade-in">
                    <p className="font-semibold">Ready to download!</p>
                    <Button asChild>
                        <a href={convertedFile} download={`${file.name.replace('.pdf', '')}.${targetFormat}`}>
                            <Download className="mr-2 h-4 w-4"/>
                            Download .{targetFormat}
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
