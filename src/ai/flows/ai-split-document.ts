
'use server';

/**
 * @fileOverview An AI flow for splitting a document into multiple parts.
 *
 * - splitDocument - A function that splits a document based on a page range.
 * - SplitDocumentInput - The input type for the function.
 * - SplitDocumentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SplitDocumentInputSchema = z.object({
  fileDataUri: z.string().describe("The document file to be split, as a data URI."),
  pageRange: z.string().describe("The range of pages to extract (e.g., '1-3, 5, 8-10')."),
});
export type SplitDocumentInput = z.infer<typeof SplitDocumentInputSchema>;

const SplitDocumentOutputSchema = z.object({
  splitFileDataUri: z.string().describe('The new document file containing the extracted pages, as a data URI.'),
});
export type SplitDocumentOutput = z.infer<typeof SplitDocumentOutputSchema>;

export async function splitDocument(input: SplitDocumentInput): Promise<SplitDocumentOutput> {
  return splitDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'splitDocumentPrompt',
  input: {schema: SplitDocumentInputSchema},
  output: {schema: SplitDocumentOutputSchema},
  system: `You are an expert document manipulation AI. Your task is to extract the specified page range from the provided document and create a new document from it.`,
  prompt: `Please extract pages "{{pageRange}}" from the following document.

  {{media url=fileDataUri}}

  Return the new file data URI.`,
});

const splitDocumentFlow = ai.defineFlow(
  {
    name: 'splitDocumentFlow',
    inputSchema: SplitDocumentInputSchema,
    outputSchema: SplitDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
