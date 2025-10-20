
'use server';

/**
 * @fileOverview An AI-powered flow for analyzing a document and extracting key insights.
 *
 * - analyzeDocument - A function that analyzes document content and returns a structured summary.
 * - AnalyzeDocumentInput - The input type for the function.
 * - AnalyzeDocumentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDocumentInputSchema = z.object({
  documentText: z.string().optional().describe('The text from the document to be analyzed.'),
  documentImage: z.string().optional().describe("A photo of the document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeDocumentInput = z.infer<typeof AnalyzeDocumentInputSchema>;

const AnalyzeDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise, one-paragraph summary of the document.'),
  keyPoints: z.array(z.string()).describe('A list of the most important data points, entities, or findings in the document.'),
  actionableInsights: z.array(z.string()).describe('A list of suggested next steps or actions based on the document content.'),
  sentiment: z.enum(["Positive", "Neutral", "Negative"]).describe("The overall sentiment of the document.")
});
export type AnalyzeDocumentOutput = z.infer<typeof AnalyzeDocumentOutputSchema>;

export async function analyzeDocument(input: AnalyzeDocumentInput): Promise<AnalyzeDocumentOutput> {
  return analyzeDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDocumentPrompt',
  input: {schema: AnalyzeDocumentInputSchema},
  output: {schema: AnalyzeDocumentOutputSchema},
  system: `You are an expert analyst AI. Your task is to meticulously review the provided document content (either from text or an image) and extract structured, actionable information.

Your analysis MUST include:
1.  **Summary:** A brief, single-paragraph overview of the document's purpose and main content.
2.  **Key Points:** A bulleted list of the most critical data points, names, dates, amounts, or key entities mentioned.
3.  **Actionable Insights:** A bulleted list of concrete next steps, questions to ask, or decisions to be made based on the document's content.
4.  **Sentiment:** The overall tone of the document (Positive, Neutral, or Negative).`,
  prompt: `Please analyze the following document.

  {{#if documentText}}
  **DOCUMENT TEXT:**
  ---
  {{{documentText}}}
  ---
  {{/if}}

  {{#if documentImage}}
  **DOCUMENT IMAGE:**
  ---
  {{media url=documentImage}}
  ---
  {{/if}}

  Provide your structured analysis.`,
});

const analyzeDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentFlow',
    inputSchema: AnalyzeDocumentInputSchema,
    outputSchema: AnalyzeDocumentOutputSchema,
  },
  async input => {
    if (!input.documentText && !input.documentImage) {
        throw new Error("Either documentText or documentImage must be provided.");
    }
    const {output} = await prompt(input);
    return output!;
  }
);
