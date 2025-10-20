
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
import { ShieldCheck, Loader2, Sparkles, Info } from 'lucide-react';
import { checkPolicyCompliance } from '@/ai/flows/ai-policy-checker';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function PolicyCompliancePage() {
  const [documentContent, setDocumentContent] = useState('');
  const [policyContent, setPolicyContent] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isAnalyzeButtonDisabled = () => {
    return isLoading || !documentContent.trim() || !policyContent.trim();
  };

  const handleAnalyze = async () => {
    if (isAnalyzeButtonDisabled()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please provide both the document content and the policy text.',
      });
      return;
    }
    setIsLoading(true);
    setAnalysis('');

    try {
      const result = await checkPolicyCompliance({
        documentContent,
        policyContent,
        userQuery: userQuery.trim() || 'Please perform a general compliance check.',
      });
      setAnalysis(result.analysis);
    } catch (e: any) {
      console.error('Policy Check Error:', e);
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
          <ShieldCheck className="h-8 w-8" />
          AI Policy Compliance Checker
        </h1>
        <p className="text-muted-foreground">
          Analyze documents against your internal policies, guidelines, or regulations.
        </p>
      </div>

       <Alert variant="default">
        <Info className="h-4 w-4" />
        <AlertTitle className="font-bold">
          How to Use This Tool
        </AlertTitle>
        <AlertDescription>
          Paste your document's content in the first box and the full text of the policy or regulation in the second. The AI will then cross-reference them to find potential compliance issues.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle>Input Documents</CardTitle>
            <CardDescription>
                Provide the content to check and the policy to check it against.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="document-content">Document Content</Label>
                    <Textarea
                        id="document-content"
                        placeholder="Paste the content of your article, email, or report here..."
                        className="min-h-[250px]"
                        value={documentContent}
                        onChange={(e) => setDocumentContent(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="policy-content">Policy / Guidelines</Label>
                    <Textarea
                        id="policy-content"
                        placeholder="Paste the full text of your company policy, brand guidelines, or regulations here..."
                        className="min-h-[250px]"
                        value={policyContent}
                        onChange={(e) => setPolicyContent(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="user-query">Specific Question (Optional)</Label>
              <Textarea
                id="user-query"
                placeholder="e.g., 'Does this text violate our social media policy?' or 'Is the tone appropriate for external communication?'"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                disabled={isLoading}
                rows={2}
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
                  Analyze Compliance
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Analysis</CardTitle>
            <CardDescription>
              The AI's findings will appear below.
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
                <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground/50"/>
                <p className="mt-4">Your compliance analysis will be displayed here.</p>
              </div>
            )}
            {analysis && (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {analysis}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
