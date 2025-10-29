
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
import { FileUp, Loader2, Sparkles, UploadCloud, BrainCircuit, Activity, CheckCircle, ListTree, Smile, Frown, Meh } from 'lucide-react';
import { analyzeDocument, AnalyzeDocumentOutput } from '@/ai/flows/ai-analyze-document';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

function AnalysisResult({ analysis }: { analysis: AnalyzeDocumentOutput }) {
    
    const sentimentIcon = () => {
        switch(analysis.sentiment) {
            case 'Positive': return <Smile className="h-4 w-4 text-green-500" />;
            case 'Negative': return <Frown className="h-4 w-4 text-red-500" />;
            default: return <Meh className="h-4 w-4 text-yellow-500" />;
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><BrainCircuit className="h-5 w-5"/> Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><ListTree className="h-5 w-5"/> Key Points</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 list-disc pl-5 text-sm text-muted-foreground">
                        {analysis.keyPoints.map((point, index) => <li key={index}>{point}</li>)}
                    </ul>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5"/> Actionable Insights</CardTitle>
                </CardHeader>
                <CardContent>
                     <ul className="space-y-2 list-disc pl-5 text-sm text-muted-foreground">
                        {analysis.actionableInsights.map((insight, index) => <li key={index}>{insight}</li>)}
                    </ul>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><CheckCircle className="h-5 w-5"/> Sentiment</CardTitle>
                </CardHeader>
                <CardContent>
                    <Badge variant="outline" className="flex items-center gap-2 text-base">
                        {sentimentIcon()}
                        <span>{analysis.sentiment}</span>
                    </Badge>
                </CardContent>
            </Card>
        </div>
    )
}

export default function AnalyzeDocumentPage() {
  const [documentText, setDocumentText] = useState('');
  const [analysis, setAnalysis] = useState<AnalyzeDocumentOutput | null>(null);
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
    if (isLoading) return true;
    if (activeTab === 'text') return !documentText.trim();
    if (activeTab === 'image') return !file;
    return true;
  };

  const handleAnalyze = async () => {
    if (isAnalyzeButtonDisabled()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please provide the document content to analyze.',
      });
      return;
    }
    setIsLoading(true);
    setAnalysis(null);

    try {
      const input = {
        documentText: activeTab === 'text' ? documentText : undefined,
        documentImage: activeTab === 'image' ? imageDataUri || undefined : undefined,
      };
      const result = await analyzeDocument(input);
      setAnalysis(result);
    } catch (e: any) {
      console.error('Analyze Document Error:', e);
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
          <FileUp className="h-8 w-8" />
          Analyze Document
        </h1>
        <p className="text-muted-foreground">
          Upload or paste document content to extract a summary, key points, and actionable insights.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle>Input Document</CardTitle>
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
                        <Label htmlFor="document-text">Document Content</Label>
                        <Textarea
                            id="document-text"
                            placeholder="Paste the content of your document here..."
                            className="min-h-[250px]"
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
                            <Image src={imageDataUri} alt="Uploaded document" width={400} height={400} className="rounded-md border w-full h-auto max-h-[300px] object-contain" />
                             <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => { setFile(null); setImageDataUri(null); }}>Change Image</Button>
                        </div>

                    ): (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg hover:bg-muted transition-colors disabled:opacity-50 min-h-[250px]"
                            disabled={isLoading}
                        >
                            <UploadCloud className="h-10 w-10 text-muted-foreground" />
                            <span className="mt-2 font-semibold">Click to upload an image</span>
                            <span className="text-sm text-muted-foreground">PNG, JPG, or JPEG</span>
                        </button>
                    )}
                </TabsContent>
             </Tabs>

            <Button onClick={handleAnalyze} disabled={isAnalyzeButtonDisabled()} className="mt-4 w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Document
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
            <CardDescription>
              The AI&apos;s structured analysis will appear below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                 <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            )}
            {!isLoading && !analysis && (
              <div className="text-center text-muted-foreground p-8">
                <BrainCircuit className="h-12 w-12 mx-auto text-muted-foreground/50"/>
                <p className="mt-4">Your analysis will be displayed here.</p>
              </div>
            )}
            {analysis && (
                <AnalysisResult analysis={analysis} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
