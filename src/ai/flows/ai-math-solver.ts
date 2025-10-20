
'use server';

/**
 * @fileOverview An AI-powered flow for solving complex math and science problems.
 *
 * - solveMathProblem - A function that analyzes a problem (text or image) and provides a step-by-step solution.
 * - SolveMathProblemInput - The input type for the function.
 * - SolveMathProblemOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveMathProblemInputSchema = z.object({
  problemText: z.string().optional().describe('The text of the math or science problem.'),
  problemImage: z.string().optional().describe("A photo of the problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type SolveMathProblemInput = z.infer<typeof SolveMathProblemInputSchema>;

const SolveMathProblemOutputSchema = z.object({
  solution: z.string().describe('The detailed, step-by-step solution to the problem.'),
});
export type SolveMathProblemOutput = z.infer<typeof SolveMathProblemOutputSchema>;

export async function solveMathProblem(input: SolveMathProblemInput): Promise<SolveMathProblemOutput> {
  return solveMathProblemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveMathProblemPrompt',
  input: {schema: SolveMathProblemInputSchema},
  output: {schema: SolveMathProblemOutputSchema},
  system: `You are a world-class AI assistant, specializing in mathematics, physics, and other sciences. Your task is to solve the provided problem and provide a clear, comprehensive, step-by-step explanation of the solution.

- If an image is provided, analyze it to understand the problem.
- If text is provided, use it as the primary source.
- Break down the solution into logical steps.
- Explain the reasoning and any formulas used.
- For the final answer, make it clear and easy to find.
- Format your response using Markdown, including code blocks for formulas or calculations where appropriate.`,
  prompt: `Please solve the following problem.

  {{#if problemText}}
  **PROBLEM:**
  ---
  {{{problemText}}}
  ---
  {{/if}}

  {{#if problemImage}}
  **PROBLEM IMAGE:**
  ---
  {{media url=problemImage}}
  ---
  {{/if}}

  Provide your detailed, step-by-step solution.`,
});

const solveMathProblemFlow = ai.defineFlow(
  {
    name: 'solveMathProblemFlow',
    inputSchema: SolveMathProblemInputSchema,
    outputSchema: SolveMathProblemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    