
'use client';

import { useState } from 'react';
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
import { FileEdit, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { rewriteTextWithAI } from '@/ai/ai-rewrite-text';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function RewritePage() {
  const [originalText, setOriginalText] = useState('');
  const [style, setStyle] = useState('');
  const [rewrittenText, setRewrittenText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isRewriteButtonDisabled = () => {
    return isLoading || !originalText.trim();
  };

  const handleRewrite = async () => {
    if (isRewriteButtonDisabled()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please provide some text to rewrite.',
      });
      return;
    }
    setIsLoading(true);
    setRewrittenText('');

    try {
      const result = await rewriteTextWithAI({
        text: originalText,
        style: style.trim() || undefined,
      });
      setRewrittenText(result.rewrittenText);
    } catch (e: any) {
      console.error('Rewrite Text Error:', e);
      toast({
        variant: 'destructive',
        title: 'Rewrite Failed',
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
          <FileEdit className="h-8 w-8" />
          AI Text Rewriter
        </h1>
        <p className="text-muted-foreground">
          Improve tone, clarity, and style with the power of AI.
        </p>
      </div>

       <Alert variant="default">
        <Wand2 className="h-4 w-4" />
        <AlertTitle className="font-bold">
          Style Suggestions
        </AlertTitle>
        <AlertDescription>
            You can give the AI any instruction for the rewrite. Try things like: "Make this more professional," "Shorten this into three bullet points," "Change the tone to be more friendly," or "Expand on this idea."
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle>Your Text</CardTitle>
            <CardDescription>
                Paste your original text and specify the desired style.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="original-text">Original Text</Label>
                <Textarea
                    id="original-text"
                    placeholder="Paste the text you want to improve here..."
                    className="min-h-[200px]"
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="style">Desired Style (Optional)</Label>
                <Textarea
                    id="style"
                    placeholder="e.g., 'Make this more formal' or 'Turn this into a persuasive paragraph'"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    disabled={isLoading}
                    rows={2}
                />
            </div>
            <Button onClick={handleRewrite} disabled={isRewriteButtonDisabled()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rewriting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Rewrite with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Version</CardTitle>
            <CardDescription>
              The improved text will appear below.
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
            {!isLoading && !rewrittenText && (
              <div className="text-center text-muted-foreground p-8">
                <FileEdit className="h-12 w-12 mx-auto text-muted-foreground/50"/>
                <p className="mt-4">Your rewritten text will be displayed here.</p>
              </div>
            )}
            {rewrittenText && (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    <p>{rewrittenText}</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
