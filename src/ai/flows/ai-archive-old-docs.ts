
'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing documents.
 *
 * It includes:
 * - summarizeDocument: A function to summarize document content.
 * - SummarizeDocumentInput: The input type for the summarizeDocument function.
 * - SummarizeDocumentOutput: The output type for the summarizeDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDocumentInputSchema = z.object({
  documentContent: z
    .string()
    .describe(
      'The text content of the document to be summarized.'
    ),
  userInstructions: z
    .string()
    .optional()
    .describe('Optional instructions from the user regarding the summarization process.'),
});
export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;

const SummarizeDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the document.'),
});
export type SummarizeDocumentOutput = z.infer<typeof SummarizeDocumentOutputSchema>;

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> {
  return summarizeDocumentFlow(input);
}

const summarizeDocumentPrompt = ai.definePrompt({
  name: 'summarizeDocumentPrompt',
  input: {schema: SummarizeDocumentInputSchema},
  output: {schema: z.object({ summary: z.string() })},
  prompt: `You are an AI assistant specializing in creating concise and accurate summaries of documents.

  Summarize the following document content.
  {{#if userInstructions}}
  Consider the following user instructions: {{{userInstructions}}}
  {{/if}}

  Document Content:
  ---
  {{{documentContent}}}
  ---
  
  Provide a concise summary of the document.`,
});

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async (input) => {
    // Step 1: Generate the summary using the AI prompt.
    const {output} = await summarizeDocumentPrompt(input);
    const summary = output!.summary;

    return {
        summary: summary,
    };
  }
);
