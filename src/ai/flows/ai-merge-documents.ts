
'use server';

/**
 * @fileOverview An AI flow for merging multiple documents into a single file.
 *
 * - mergeDocuments - A function that merges multiple documents.
 * - MergeDocumentsInput - The input type for the function.
 * - MergeDocumentsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MergeDocumentsInputSchema = z.object({
  fileDataUris: z.array(z.string()).describe("An array of document files to be merged, as data URIs."),
});
export type MergeDocumentsInput = z.infer<typeof MergeDocumentsInputSchema>;

const MergeDocumentsOutputSchema = z.object({
  mergedFileDataUri: z.string().describe('The merged document file, as a data URI.'),
});
export type MergeDocumentsOutput = z.infer<typeof MergeDocumentsOutputSchema>;

export async function mergeDocuments(input: MergeDocumentsInput): Promise<MergeDocumentsOutput> {
  return mergeDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mergeDocumentsPrompt',
  input: {schema: MergeDocumentsInputSchema},
  output: {schema: MergeDocumentsOutputSchema},
  system: `You are an expert file merging AI. Your task is to combine the provided documents into a single, cohesive file.`,
  prompt: `Please merge the following documents.

  {{#each fileDataUris}}
  {{media url=this}}
  {{/each}}

  Return the merged file data URI.`,
});

const mergeDocumentsFlow = ai.defineFlow(
  {
    name: 'mergeDocumentsFlow',
    inputSchema: MergeDocumentsInputSchema,
    outputSchema: MergeDocumentsOutputSchema,
  },
  async input => {
    if(input.fileDataUris.length === 0) {
        throw new Error("No files provided to merge.");
    }
    const {output} = await prompt(input);
    return output!;
  }
);
