
'use server';

/**
 * @fileOverview An AI flow for converting documents from one format to another.
 *
 * - convertDocument - A function that converts a document.
 * - ConvertDocumentInput - The input type for the function.
 * - ConvertDocumentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertDocumentInputSchema = z.object({
  fileDataUri: z.string().describe("The document file to be converted, as a data URI."),
  targetFormat: z.string().describe("The desired output format (e.g., 'docx', 'jpg', 'txt')."),
});
export type ConvertDocumentInput = z.infer<typeof ConvertDocumentInputSchema>;

const ConvertDocumentOutputSchema = z.object({
  convertedFileDataUri: z.string().describe('The converted document file, as a data URI.'),
});
export type ConvertDocumentOutput = z.infer<typeof ConvertDocumentOutputSchema>;

export async function convertDocument(input: ConvertDocumentInput): Promise<ConvertDocumentOutput> {
  return convertDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'convertDocumentPrompt',
  input: {schema: ConvertDocumentInputSchema},
  output: {schema: ConvertDocumentOutputSchema},
  system: `You are an expert file conversion AI. Your task is to convert the provided document to the specified target format while preserving the layout and content as much as possible.`,
  prompt: `Please convert the following document to {{{targetFormat}}}.

  {{media url=fileDataUri}}

  Return the converted file data URI.`,
});

const convertDocumentFlow = ai.defineFlow(
  {
    name: 'convertDocumentFlow',
    inputSchema: ConvertDocumentInputSchema,
    outputSchema: ConvertDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
