
'use server';

/**
 * @fileOverview An AI flow for checking document content against a given policy or set of guidelines.
 *
 * - checkPolicyCompliance - A function that analyzes document content for compliance with a policy.
 * - CheckPolicyComplianceInput - The input type for the function.
 * - CheckPolicyComplianceOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckPolicyComplianceInputSchema = z.object({
  documentContent: z.string().describe('The text from the document to be analyzed.'),
  policyContent: z.string().describe('The full text of the policy or guidelines to check against.'),
  userQuery: z.string().describe('A specific question or instruction for the compliance check.'),
});
export type CheckPolicyComplianceInput = z.infer<typeof CheckPolicyComplianceInputSchema>;

const CheckPolicyComplianceOutputSchema = z.object({
  analysis: z.string().describe('The AI-generated compliance analysis of the document.'),
});
export type CheckPolicyComplianceOutput = z.infer<typeof CheckPolicyComplianceOutputSchema>;

export async function checkPolicyCompliance(input: CheckPolicyComplianceInput): Promise<CheckPolicyComplianceOutput> {
  return checkPolicyComplianceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkPolicyCompliancePrompt',
  input: {schema: CheckPolicyComplianceInputSchema},
  output: {schema: CheckPolicyComplianceOutputSchema},
  system: `You are an expert AI Compliance Officer. Your role is to meticulously analyze a given document against a provided policy, set of guidelines, or regulations.

  Your task is to:
  1.  Carefully read the document content and the policy content.
  2.  Identify every instance where the document content deviates from, violates, or fails to meet the requirements of the policy.
  3.  For each issue found, clearly explain what the issue is and reference the specific part of the policy that is being violated.
  4.  Provide concrete suggestions on how to revise the document content to bring it into compliance.
  5.  If no issues are found, state that the document appears to be compliant with the provided policy.
  6.  Structure your response in a clear, easy-to-read format (e.g., using headings and bullet points).`,
  prompt: `Please analyze the following document for compliance with the provided policy, based on my specific query.

  **POLICY / GUIDELINES:**
  ---
  {{{policyContent}}}
  ---

  **DOCUMENT CONTENT:**
  ---
  {{{documentContent}}}
  ---
  
  **USER QUERY:**
  "{{{userQuery}}}"

  Provide your detailed compliance analysis.`,
});

const checkPolicyComplianceFlow = ai.defineFlow(
  {
    name: 'checkPolicyComplianceFlow',
    inputSchema: CheckPolicyComplianceInputSchema,
    outputSchema: CheckPolicyComplianceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    