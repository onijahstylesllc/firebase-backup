import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { translateRateLimiter } from '@/lib/security/rate-limit';
import { ai } from '@/ai/genkit';
import { createRouteHandlerClient } from '@/lib/supabaseServer';

// Import the schema from the translate flow
const TranslateTextWithAIInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language for the translation.'),
});

const TranslateTextWithAIOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});

// Define the prompt (same as in the flow)
const prompt = ai.definePrompt({
  name: 'translateTextWithAIPrompt',
  input: { schema: TranslateTextWithAIInputSchema },
  output: { schema: TranslateTextWithAIOutputSchema },
  prompt: `You are a professional translator. Translate the given text into the target language while preserving the original layout and formatting.\n\nText to translate: {{{text}}}\n\nTarget language: {{{targetLanguage}}}\n\nTranslation: `,
});

// Define the flow
const translateTextWithAIFlow = ai.defineFlow(
  {
    name: 'translateTextWithAIFlow',
    inputSchema: TranslateTextWithAIInputSchema,
    outputSchema: TranslateTextWithAIOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
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
        { error: 'Unauthorized', message: 'You must be logged in to use AI translation.' },
        { status: 401 }
      );
    }

    // Get user identifier for rate limiting
    const userId = session.user.id;
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const identifier = userId || ip;

    // Apply rate limiting
    const rateLimitResult = translateRateLimiter.check(identifier);

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
    const validationResult = TranslateTextWithAIInputSchema.safeParse(body);

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
    const result = await translateTextWithAIFlow(validationResult.data);

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
    console.error('AI translation error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      },
      { status: 500 }
    );
  }
}
