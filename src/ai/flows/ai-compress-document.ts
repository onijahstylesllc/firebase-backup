
'use server';

/**
 * @fileOverview An AI flow for compressing documents to reduce their file size.
 *
 * - compressDocument - A function that compresses a document.
 * - CompressDocumentInput - The input type for the function.
 * - CompressDocumentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CompressDocumentInputSchema = z.object({
  fileDataUri: z.string().describe("The document file to be compressed, as a data URI."),
});
export type CompressDocumentInput = z.infer<typeof CompressDocumentInputSchema>;

const CompressDocumentOutputSchema = z.object({
  compressedFileDataUri: z.string().describe('The compressed document file, as a data URI.'),
});
export type CompressDocumentOutput = z.infer<typeof CompressDocumentOutputSchema>;

export async function compressDocument(input: CompressDocumentInput): Promise<CompressDocumentOutput> {
  return compressDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'compressDocumentPrompt',
  input: {schema: CompressDocumentInputSchema},
  output: {schema: CompressDocumentOutputSchema},
  system: `You are an expert file compression AI. Your task is to take the provided document and reduce its file size as much as possible without a significant loss in quality. Analyze the content and apply the best compression strategy.`,
  prompt: `Please compress the following document.

  {{media url=fileDataUri}}

  Return the compressed file data URI.`,
});

const compressDocumentFlow = ai.defineFlow(
  {
    name: 'compressDocumentFlow',
    inputSchema: CompressDocumentInputSchema,
    outputSchema: CompressDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
