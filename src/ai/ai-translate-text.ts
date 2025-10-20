'use server';

/**
 * @fileOverview An AI-powered text translation flow for translating selected text or entire documents while preserving the layout.
 *
 * - translateTextWithAI - A function that handles the text translation process.
 * - TranslateTextWithAIInput - The input type for the translateTextWithAI function;
 * - TranslateTextWithAIOutput - The return type for the translateTextWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextWithAIInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language for the translation.'),
});
export type TranslateTextWithAIInput = z.infer<typeof TranslateTextWithAIInputSchema>;

const TranslateTextWithAIOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextWithAIOutput = z.infer<typeof TranslateTextWithAIOutputSchema>;

export async function translateTextWithAI(input: TranslateTextWithAIInput): Promise<TranslateTextWithAIOutput> {
  return translateTextWithAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextWithAIPrompt',
  input: {schema: TranslateTextWithAIInputSchema},
  output: {schema: TranslateTextWithAIOutputSchema},
  prompt: `You are a professional translator. Translate the given text into the target language while preserving the original layout and formatting.\n\nText to translate: {{{text}}}\n\nTarget language: {{{targetLanguage}}}\n\nTranslation: `,
});

const translateTextWithAIFlow = ai.defineFlow(
  {
    name: 'translateTextWithAIFlow',
    inputSchema: TranslateTextWithAIInputSchema,
    outputSchema: TranslateTextWithAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    