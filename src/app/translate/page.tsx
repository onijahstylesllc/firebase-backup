
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
import { Languages, Loader2, Sparkles } from 'lucide-react';
import { translateTextWithAI } from '@/ai/ai-translate-text';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
];

export default function TranslatePage() {
    const [originalText, setOriginalText] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('es');
    const [translatedText, setTranslatedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const isTranslateButtonDisabled = () => {
        return isLoading || !originalText.trim() || !targetLanguage;
    };

    const handleTranslate = async () => {
        if (isTranslateButtonDisabled()) {
            toast({
                variant: 'destructive',
                title: 'Input Required',
                description: 'Please provide text and a target language.',
            });
            return;
        }
        setIsLoading(true);
        setTranslatedText('');

        try {
            const result = await translateTextWithAI({
                text: originalText,
                targetLanguage: languages.find(l => l.code === targetLanguage)?.name || 'Spanish',
            });
            setTranslatedText(result.translatedText);
        } catch (e: any) {
            console.error('Translate Text Error:', e);
            toast({
                variant: 'destructive',
                title: 'Translation Failed',
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
          <Languages className="h-8 w-8" />
          AI Text Translator
        </h1>
        <p className="text-muted-foreground">
          Translate document text into different languages instantly.
        </p>
      </div>

       <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle>Translate Text</CardTitle>
            <CardDescription>
                Enter the text to translate and select the target language.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="original-text">Original Text</Label>
                <Textarea
                    id="original-text"
                    placeholder="Enter the text you want to translate..."
                    className="min-h-[200px]"
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    disabled={isLoading}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="target-language">Target Language</Label>
                 <Select value={targetLanguage} onValueChange={setTargetLanguage} disabled={isLoading}>
                    <SelectTrigger id="target-language" className="w-full">
                        <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                        {languages.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleTranslate} disabled={isTranslateButtonDisabled()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Translate
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Translated Text</CardTitle>
            <CardDescription>
              The translated version will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}
            {!isLoading && !translatedText && (
              <div className="text-center text-muted-foreground p-8">
                <Languages className="h-12 w-12 mx-auto text-muted-foreground/50"/>
                <p className="mt-4">Your translation will appear here.</p>
              </div>
            )}
            {translatedText && (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    <p>{translatedText}</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
