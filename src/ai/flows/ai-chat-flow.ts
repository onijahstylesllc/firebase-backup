
'use server';
/**
 * @fileOverview A conversational AI agent for interacting with documents.
 *
 * - chatWithDocument - A function that handles the conversational chat about a document.
 * - ChatWithDocumentInput - The input type for the chatWithDocument function.
 * - ChatWithDocumentOutput - The return type for the chatWithDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const ChatWithDocumentInputSchema = z.object({
  documentImage: z.string().optional().describe("A data URI of the document page image. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  message: z.string().describe('The user’s message.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({ text: z.string() })),
  })).optional().describe('The chat history.'),
  personalization: z.object({
      role: z.string().optional(),
      tone: z.string().optional(),
      outputFormat: z.string().optional(),
  }).optional().describe('User personalization settings.')
});
export type ChatWithDocumentInput = z.infer<typeof ChatWithDocumentInputSchema>;

const ChatWithDocumentOutputSchema = z.object({
  response: z
    .string()
    .describe('The AI’s response to the user’s message.'),
});
export type ChatWithDocumentOutput = z.infer<
  typeof ChatWithDocumentOutputSchema
>;

export async function chatWithDocument(
  input: ChatWithDocumentInput
): Promise<ChatWithDocumentOutput> {
  return chatWithDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithDocumentPrompt',
  input: {schema: ChatWithDocumentInputSchema},
  output: {schema: ChatWithDocumentOutputSchema},
  system: `You are DocuMind AI, an expert assistant that helps users understand and work with their documents.
- You are helpful, knowledgeable, and friendly.
- The user has provided a message and potentially an image of a document page.
- Your answer MUST be based on the provided context (text and/or image).
- If the user asks about something in the image, analyze the visual information to answer.
- Keep your answers concise and directly related to the document.
- If the answer is not in the provided context, say so. Do not make up information.
{{#if personalization}}
- You MUST tailor your response based on the user's preferences:
{{#if personalization.role}}
- The user's role is: {{{personalization.role}}}. Adapt your expertise and examples accordingly.
{{/if}}
{{#if personalization.tone}}
- Your tone of voice should be: {{{personalization.tone}}}.
{{/if}}
{{#if personalization.outputFormat}}
- Your output format should be in: {{{personalization.outputFormat}}}.
{{/if}}
{{/if}}
`,
  prompt: `{{#if documentImage}}DOCUMENT IMAGE:
---
{{media url=documentImage}}
---
{{/if}}

USER MESSAGE:
{{{message}}}`,
});

const chatWithDocumentFlow = ai.defineFlow(
  {
    name: 'chatWithDocumentFlow',
    inputSchema: ChatWithDocumentInputSchema,
    outputSchema: ChatWithDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      response: output!.response,
    };
  }
);

    