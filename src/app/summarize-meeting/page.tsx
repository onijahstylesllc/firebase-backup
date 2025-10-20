
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, Loader2, Sparkles, Info } from 'lucide-react';
import { summarizeMeetingContext } from '@/ai/flows/ai-summarize-meeting-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function SummarizeMeetingPage() {
  const [meetingTranscript, setMeetingTranscript] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isSummarizeButtonDisabled = () => {
    return isLoading || !meetingTranscript.trim();
  };

  const handleSummarize = async () => {
    if (isSummarizeButtonDisabled()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please provide the meeting transcript to generate a summary.',
      });
      return;
    }
    setIsLoading(true);
    setSummary('');

    try {
      const result = await summarizeMeetingContext({
        meetingTranscript,
        documentContent: documentContent.trim() || 'No document context was provided.',
      });
      setSummary(result.summary);
    } catch (e: any) {
      console.error('Summarize Meeting Error:', e);
      toast({
        variant: 'destructive',
        title: 'Summarization Failed',
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
          <Users className="h-8 w-8" />
          AI Meeting Summarizer
        </h1>
        <p className="text-muted-foreground">
          Turn long transcripts into concise summaries with key points and action items.
        </p>
      </div>

       <Alert variant="default">
        <Info className="h-4 w-4" />
        <AlertTitle className="font-bold">
          How to Get the Best Results
        </AlertTitle>
        <AlertDescription>
            Paste the full meeting transcript below. For even better summaries, also provide the text of any document that was discussed during the meeting. The AI will use it for context.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle>Meeting Details</CardTitle>
            <CardDescription>
                Provide the transcript and any relevant document text.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="meeting-transcript">Meeting Transcript</Label>
                    <Textarea
                        id="meeting-transcript"
                        placeholder="Paste the entire meeting transcript here..."
                        className="min-h-[200px]"
                        value={meetingTranscript}
                        onChange={(e) => setMeetingTranscript(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="document-content">Document Content (Optional)</Label>
                    <Textarea
                        id="document-content"
                        placeholder="Paste the content of the document discussed in the meeting..."
                        className="min-h-[150px]"
                        value={documentContent}
                        onChange={(e) => setDocumentContent(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <Button onClick={handleSummarize} disabled={isSummarizeButtonDisabled()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Summary
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Summary</CardTitle>
            <CardDescription>
              Key points, decisions, and action items will appear here.
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
            {!isLoading && !summary && (
              <div className="text-center text-muted-foreground p-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50"/>
                <p className="mt-4">Your meeting summary will be displayed here.</p>
              </div>
            )}
            {summary && (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {summary}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
