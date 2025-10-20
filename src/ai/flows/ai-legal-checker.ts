
'use server';

/**
 * @fileOverview An AI-powered legal analysis flow.
 *
 * - checkForLegalIssues - A function that analyzes document text for potential legal issues.
 * - CheckForLegalIssuesInput - The input type for the checkForLegalIssues function.
 * - CheckForLegalIssuesOutput - The return type for the checkForLegalIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckForLegalIssuesInputSchema = z.object({
  documentText: z.string().optional().describe('The text from the document to be analyzed.'),
  documentImage: z.string().optional().describe("A photo of the document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  userQuery: z.string().describe('The specific legal question the user has about the text.'),
});
export type CheckForLegalIssuesInput = z.infer<typeof CheckForLegalIssuesInputSchema>;

const CheckForLegalIssuesOutputSchema = z.object({
  analysis: z.string().describe('The AI-generated legal analysis of the text.'),
});
export type CheckForLegalIssuesOutput = z.infer<typeof CheckForLegalIssuesOutputSchema>;

export async function checkForLegalIssues(input: CheckForLegalIssuesInput): Promise<CheckForLegalIssuesOutput> {
  return checkForLegalIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkForLegalIssuesPrompt',
  input: {schema: CheckForLegalIssuesInputSchema},
  output: {schema: CheckForLegalIssuesOutputSchema},
  system: `You are an expert AI Legal Assistant. Your role is to analyze provided legal text and answer user questions. You must identify potential risks, explain complex clauses in simple terms, and highlight areas that may require a lawyer's attention. If an image is provided, perform OCR to extract the text first.

  **CRITICAL INSTRUCTIONS:**
  1.  **DO NOT PROVIDE LEGAL ADVICE.** You are not a licensed attorney.
  2.  Your analysis is for informational and educational purposes ONLY.
  3.  **ALWAYS** conclude your response with the following disclaimer, formatted exactly as shown:

  ---
  ***Disclaimer:** I am an AI assistant and not a licensed attorney. This analysis is for informational purposes only and does not constitute legal advice. You should consult with a qualified legal professional for advice regarding your specific situation.*`,
  prompt: `Please analyze the following document based on my question.

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

  **MY QUESTION:**
  "{{{userQuery}}}"

  Provide your analysis.`,
});

const checkForLegalIssuesFlow = ai.defineFlow(
  {
    name: 'checkForLegalIssuesFlow',
    inputSchema: CheckForLegalIssuesInputSchema,
    outputSchema: CheckForLegalIssuesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    