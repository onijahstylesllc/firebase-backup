
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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Gavel, Loader2, Sparkles, Terminal, UploadCloud, Image as ImageIcon, Info } from 'lucide-react';
import { checkForLegalIssues } from '@/ai/flows/ai-legal-checker';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function LegalCheckerPage() {
  const [documentText, setDocumentText] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [file, setFile] = useState<File | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setImageDataUri(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setDocumentText(''); // Clear text input when a file is uploaded
    }
  };

  const isAnalyzeButtonDisabled = () => {
    if (isLoading || !userQuery.trim()) return true;
    if (activeTab === 'text') return !documentText.trim();
    if (activeTab === 'image') return !file;
    return true;
  };

  const handleAnalyze = async () => {
    if (isAnalyzeButtonDisabled()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please provide the document content and your question.',
      });
      return;
    }
    setIsLoading(true);
    setAnalysis('');

    try {
      const input = {
        userQuery,
        documentText: activeTab === 'text' ? documentText : undefined,
        documentImage: activeTab === 'image' ? imageDataUri || undefined : undefined,
      };
      const result = await checkForLegalIssues(input);
      setAnalysis(result.analysis);
    } catch (e: any) {
      console.error('Legal Check Error:', e);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: e.message || 'An unexpected error occurred. Please check the server logs.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Gavel className="h-8 w-8" />
          AI Legal Checker
        </h1>
        <p className="text-muted-foreground">
          Analyze legal text for potential issues, risks, and clarity.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle className="font-bold">
          For Informational Purposes Only
        </AlertTitle>
        <AlertDescription>
          This AI tool is not a substitute for a licensed attorney. Its analysis does not constitute legal advice. Always consult with a qualified legal professional for your specific situation.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle>Input</CardTitle>
            <CardDescription>
                Paste text or upload an image of your document.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Paste Text</TabsTrigger>
                    <TabsTrigger value="image">Upload Image</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-4">
                     <div className="space-y-2">
                        <Label htmlFor="document-text">Document Text</Label>
                        <Textarea
                            id="document-text"
                            placeholder="Paste a clause or section from your legal document here..."
                            className="min-h-[200px]"
                            value={documentText}
                            onChange={(e) => {
                                setDocumentText(e.target.value)
                                setFile(null);
                                setImageDataUri(null);
                            }}
                            disabled={isLoading}
                        />
                    </div>
                </TabsContent>
                 <TabsContent value="image" className="mt-4">
                    <Input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/jpg"
                    />
                    {imageDataUri ? (
                        <div className="space-y-2 relative group">
                            <Image src={imageDataUri} alt="Uploaded document" width={400} height={400} className="rounded-md border w-full h-auto max-h-64 object-contain" />
                             <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => { setFile(null); setImageDataUri(null); }}>Change Image</Button>
                        </div>

                    ): (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <UploadCloud className="h-10 w-10 text-muted-foreground" />
                            <span className="mt-2 font-semibold">Click to upload an image</span>
                            <span className="text-sm text-muted-foreground">PNG, JPG, or JPEG</span>
                        </button>
                    )}
                </TabsContent>
             </Tabs>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="user-query">Your Question</Label>
              <Textarea
                id="user-query"
                placeholder="e.g., 'Are there any risks for me in this indemnity clause?' or 'Explain this section in simple terms.'"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleAnalyze} disabled={isAnalyzeButtonDisabled()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
            <CardDescription>
              The AI's analysis of your text will appear below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <br />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            )}
            {!isLoading && !analysis && (
              <div className="text-center text-muted-foreground p-8">
                <Gavel className="h-12 w-12 mx-auto text-muted-foreground/50"/>
                <p className="mt-4">Your analysis will be displayed here.</p>
              </div>
            )}
            {analysis && (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {analysis.split('---').map((part, index) => {
                        if (part.includes('Disclaimer:')) {
                            return (
                                <div key={index} className="mt-6 border-t pt-4">
                                    <p className="text-xs text-muted-foreground italic">
                                        {part.replace('Disclaimer:', '').trim()}
                                    </p>
                                </div>
                            );
                        }
                        return <p key={index}>{part.trim()}</p>;
                    })}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
