
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
import { Calculator, Loader2, Sparkles, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { solveMathProblem } from '@/ai/flows/ai-math-solver';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function MathSolverPage() {
  const [problemText, setProblemText] = useState('');
  const [solution, setSolution] = useState('');
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
      setProblemText(''); // Clear text input when a file is uploaded
    }
  };

  const isSolveButtonDisabled = () => {
    if (isLoading) return true;
    if (activeTab === 'text') return !problemText.trim();
    if (activeTab === 'image') return !file;
    return true;
  };

  const handleSolve = async () => {
    if (isSolveButtonDisabled()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please provide a problem to solve.',
      });
      return;
    }
    setIsLoading(true);
    setSolution('');

    try {
      const input = {
        problemText: activeTab === 'text' ? problemText : undefined,
        problemImage: activeTab === 'image' ? imageDataUri || undefined : undefined,
      };
      const result = await solveMathProblem(input);
      setSolution(result.solution);
    } catch (e: any) {
      console.error('Math Solver Error:', e);
      toast({
        variant: 'destructive',
        title: 'Solving Failed',
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
          <Calculator className="h-8 w-8" />
          AI Math & Science Solver
        </h1>
        <p className="text-muted-foreground">
          Tackle complex problems in math, physics, and more.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle>Problem Input</CardTitle>
            <CardDescription>
                Type your question or upload an image of the problem.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Type Problem</TabsTrigger>
                    <TabsTrigger value="image">Upload Image</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-4">
                     <div className="space-y-2">
                        <Label htmlFor="problem-text">Your Problem</Label>
                        <Textarea
                            id="problem-text"
                            placeholder="e.g., 'Find the integral of x^2 * sin(x) dx' or 'Explain the basics of quantum entanglement.'"
                            className="min-h-[200px]"
                            value={problemText}
                            onChange={(e) => {
                                setProblemText(e.target.value)
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
                            <Image src={imageDataUri} alt="Uploaded problem" width={400} height={400} className="rounded-md border w-full h-auto max-h-64 object-contain" />
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

            <Button onClick={handleSolve} disabled={isSolveButtonDisabled()} className="mt-4">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Solving...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Solve
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solution</CardTitle>
            <CardDescription>
              The AI's step-by-step solution will appear here.
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
            {!isLoading && !solution && (
              <div className="text-center text-muted-foreground p-8">
                <Calculator className="h-12 w-12 mx-auto text-muted-foreground/50"/>
                <p className="mt-4">Your solution will be displayed here.</p>
              </div>
            )}
            {solution && (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {solution}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
