import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rewriteRateLimiter } from '@/lib/security/rate-limit';
import { ai } from '@/ai/genkit';
import { createRouteHandlerClient } from '@/lib/supabaseServer';

// Import the schema from the rewrite flow
const RewriteTextWithAIInputSchema = z.object({
  text: z.string().describe('The text to be rewritten.'),
  style: z
    .string()
    .optional()
    .describe('The desired style or tone for the rewritten text.'),
});

const RewriteTextWithAIOutputSchema = z.object({
  rewrittenText: z.string().describe('The text rewritten by the AI.'),
});

// Define the prompt (same as in the flow)
const rewriteTextWithAIPrompt = ai.definePrompt({
  name: 'rewriteTextWithAIPrompt',
  input: { schema: RewriteTextWithAIInputSchema },
  output: { schema: RewriteTextWithAIOutputSchema },
  prompt: `Rewrite the following text to improve its tone, grammar, or format.  Consider the requested style if provided.

Text: {{{text}}}
{{~#if style}}
Desired Style: {{{style}}}
{{~/if}}`,
});

// Define the flow
const rewriteTextWithAIFlow = ai.defineFlow(
  {
    name: 'rewriteTextWithAIFlow',
    inputSchema: RewriteTextWithAIInputSchema,
    outputSchema: RewriteTextWithAIOutputSchema,
  },
  async (input) => {
    const { output } = await rewriteTextWithAIPrompt(input);
    return output!;
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
        { error: 'Unauthorized', message: 'You must be logged in to use AI rewrite.' },
        { status: 401 }
      );
    }

    // Get user identifier for rate limiting
    const userId = session.user.id;
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const identifier = userId || ip;

    // Apply rate limiting
    const rateLimitResult = rewriteRateLimiter.check(identifier);

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
    const validationResult = RewriteTextWithAIInputSchema.safeParse(body);

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
    const result = await rewriteTextWithAIFlow(validationResult.data);

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
    console.error('AI rewrite error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      },
      { status: 500 }
    );
  }
}
