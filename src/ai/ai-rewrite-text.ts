'use server';

/**
 * @fileOverview This file contains the Genkit flow for rewriting text with AI to improve tone, grammar, or format.
 *
 * - rewriteTextWithAI - A function that rewrites the given text using AI.
 * - RewriteTextWithAIInput - The input type for the rewriteTextWithAI function.
 * - RewriteTextWithAIOutput - The return type for the rewriteTextWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RewriteTextWithAIInputSchema = z.object({
  text: z.string().describe('The text to be rewritten.'),
  style: z
    .string()
    .optional()
    .describe('The desired style or tone for the rewritten text.'),
});
export type RewriteTextWithAIInput = z.infer<typeof RewriteTextWithAIInputSchema>;

const RewriteTextWithAIOutputSchema = z.object({
  rewrittenText: z.string().describe('The text rewritten by the AI.'),
});
export type RewriteTextWithAIOutput = z.infer<typeof RewriteTextWithAIOutputSchema>;

export async function rewriteTextWithAI(input: RewriteTextWithAIInput): Promise<RewriteTextWithAIOutput> {
  return rewriteTextWithAIFlow(input);
}

const rewriteTextWithAIPrompt = ai.definePrompt({
  name: 'rewriteTextWithAIPrompt',
  input: {schema: RewriteTextWithAIInputSchema},
  output: {schema: RewriteTextWithAIOutputSchema},
  prompt: `Rewrite the following text to improve its tone, grammar, or format.  Consider the requested style if provided.

Text: {{{text}}}
{{~#if style}}
Desired Style: {{{style}}}
{{~/if}}`,
});

const rewriteTextWithAIFlow = ai.defineFlow(
  {
    name: 'rewriteTextWithAIFlow',
    inputSchema: RewriteTextWithAIInputSchema,
    outputSchema: RewriteTextWithAIOutputSchema,
  },
  async input => {
    const {output} = await rewriteTextWithAIPrompt(input);
    return output!;
  }
);

    