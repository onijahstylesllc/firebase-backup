'use server';
/**
 * @fileOverview A flow that automatically generates descriptive file names for documents.
 *
 * - autoGenerateFileName - A function that generates a descriptive file name for a document.
 * - AutoGenerateFileNameInput - The input type for the autoGenerateFileName function.
 * - AutoGenerateFileNameOutput - The return type for the autoGenerateFileName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoGenerateFileNameInputSchema = z.object({
  documentContent: z.string().describe('The content of the document.'),
});
export type AutoGenerateFileNameInput = z.infer<typeof AutoGenerateFileNameInputSchema>;

const AutoGenerateFileNameOutputSchema = z.object({
  fileName: z.string().describe('A descriptive file name for the document.'),
});
export type AutoGenerateFileNameOutput = z.infer<typeof AutoGenerateFileNameOutputSchema>;

export async function autoGenerateFileName(input: AutoGenerateFileNameInput): Promise<AutoGenerateFileNameOutput> {
  return autoGenerateFileNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoGenerateFileNamePrompt',
  input: {schema: AutoGenerateFileNameInputSchema},
  output: {schema: AutoGenerateFileNameOutputSchema},
  prompt: `You are an expert at generating descriptive file names for documents.

  Based on the content of the document, generate a file name that accurately reflects the document's content.

  Document content: {{{documentContent}}}`,
});

const autoGenerateFileNameFlow = ai.defineFlow(
  {
    name: 'autoGenerateFileNameFlow',
    inputSchema: AutoGenerateFileNameInputSchema,
    outputSchema: AutoGenerateFileNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
