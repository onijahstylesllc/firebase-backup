'use server';
/**
 * @fileOverview A meeting summarization AI agent.
 *
 * - summarizeMeetingContext - A function that handles the summarization of meeting context.
 * - SummarizeMeetingContextInput - The input type for the summarizeMeetingContext function.
 * - SummarizeMeetingContextOutput - The return type for the summarizeMeetingContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMeetingContextInputSchema = z.object({
  meetingTranscript: z
    .string()
    .describe('The transcript of the meeting where the document was discussed.'),
  documentContent: z.string().describe('The content of the document being discussed.'),
});
export type SummarizeMeetingContextInput = z.infer<
  typeof SummarizeMeetingContextInputSchema
>;

const SummarizeMeetingContextOutputSchema = z.object({
  summary: z.string().describe('A summary of the meeting context.'),
});
export type SummarizeMeetingContextOutput = z.infer<
  typeof SummarizeMeetingContextOutputSchema
>;

export async function summarizeMeetingContext(
  input: SummarizeMeetingContextInput
): Promise<SummarizeMeetingContextOutput> {
  return summarizeMeetingContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMeetingContextPrompt',
  input: {schema: SummarizeMeetingContextInputSchema},
  output: {schema: SummarizeMeetingContextOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing the context of a meeting where a document was discussed.\n\nGiven the meeting transcript and the document content, provide a concise summary of the key discussion points, decisions made, and action items related to the document.\n\nMeeting Transcript: {{{meetingTranscript}}}\n\nDocument Content: {{{documentContent}}}\n\nSummary: `,
});

const summarizeMeetingContextFlow = ai.defineFlow(
  {
    name: 'summarizeMeetingContextFlow',
    inputSchema: SummarizeMeetingContextInputSchema,
    outputSchema: SummarizeMeetingContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    