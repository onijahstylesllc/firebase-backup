import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { chatRateLimiter } from '@/lib/security/rate-limit';
import { ai } from '@/ai/genkit';
import { createRouteHandlerClient } from '@/lib/supabaseServer';

// Import the schema from the chat flow
const ChatWithDocumentInputSchema = z.object({
  documentImage: z.string().optional().describe("A data URI of the document page image. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  message: z.string().describe("The user's message."),
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

const ChatWithDocumentOutputSchema = z.object({
  response: z
    .string()
    .describe("The AI's response to the user's message."),
});

// Define the prompt (same as in the flow)
const prompt = ai.definePrompt({
  name: 'chatWithDocumentPrompt',
  input: { schema: ChatWithDocumentInputSchema },
  output: { schema: ChatWithDocumentOutputSchema },
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

// Define the flow
const chatWithDocumentFlow = ai.defineFlow(
  {
    name: 'chatWithDocumentFlow',
    inputSchema: ChatWithDocumentInputSchema,
    outputSchema: ChatWithDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return {
      response: output!.response,
    };
  }
);

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client for server-side auth
    const supabase = createRouteHandlerClient();

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to use AI chat.' },
        { status: 401 }
      );
    }

    // Get user identifier for rate limiting (prefer user ID, fallback to IP)
    const userId = session.user.id;
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const identifier = userId || ip;

    // Apply rate limiting
    const rateLimitResult = chatRateLimiter.check(identifier);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'You have exceeded the rate limit. Please try again later.',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = ChatWithDocumentInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid request payload.',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Call the Genkit flow
    const result = await chatWithDocumentFlow(validationResult.data);

    // Return successful response with rate limit headers
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
      },
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      },
      { status: 500 }
    );
  }
}
