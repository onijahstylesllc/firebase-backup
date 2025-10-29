import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { chatWithDocument, ChatWithDocumentInput } from '@/ai/flows/ai-chat-flow';
import * as genkitModule from '@/ai/genkit';

// Mock the genkit AI module
vi.mock('@/ai/genkit', () => {
  const mockDefinePrompt = vi.fn();
  const mockDefineFlow = vi.fn();

  return {
    ai: {
      definePrompt: mockDefinePrompt,
      defineFlow: mockDefineFlow,
    },
  };
});

describe('AI Chat Flow', () => {
  let mockPromptFunction: any;
  let mockFlowFunction: any;

  beforeEach(() => {
    // Setup mock prompt function
    mockPromptFunction = vi.fn();
    
    // Setup mock flow function
    mockFlowFunction = vi.fn();

    // Mock definePrompt to return our mock function
    (genkitModule.ai.definePrompt as any).mockReturnValue(mockPromptFunction);

    // Mock defineFlow to return our mock function
    (genkitModule.ai.defineFlow as any).mockImplementation((config: any, handler: any) => {
      mockFlowFunction = handler;
      return mockFlowFunction;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('schema validation', () => {
    it('should define prompt with correct input schema', async () => {
      // Re-import to trigger the module initialization
      vi.resetModules();
      await import('@/ai/flows/ai-chat-flow');

      expect(genkitModule.ai.definePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'chatWithDocumentPrompt',
          input: expect.objectContaining({
            schema: expect.any(Object),
          }),
          output: expect.objectContaining({
            schema: expect.any(Object),
          }),
        })
      );
    });

    it('should define flow with correct schemas', async () => {
      vi.resetModules();
      await import('@/ai/flows/ai-chat-flow');

      expect(genkitModule.ai.defineFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'chatWithDocumentFlow',
          inputSchema: expect.any(Object),
          outputSchema: expect.any(Object),
        }),
        expect.any(Function)
      );
    });
  });

  describe('chatWithDocument function', () => {
    it('should process basic message without image', async () => {
      const input: ChatWithDocumentInput = {
        message: 'What is this document about?',
      };

      const expectedOutput = {
        response: 'This document appears to be about testing AI flows.',
      };

      mockPromptFunction.mockResolvedValue({
        output: expectedOutput,
      });

      // Need to re-setup the flow since we're testing the actual function
      (genkitModule.ai.defineFlow as any).mockImplementation((config: any, handler: any) => {
        return async (input: any) => handler(input);
      });

      vi.resetModules();
      const { chatWithDocument: testFunction } = await import('@/ai/flows/ai-chat-flow');

      const result = await testFunction(input);

      expect(result).toHaveProperty('response');
      expect(typeof result.response).toBe('string');
    });

    it('should process message with document image', async () => {
      const input: ChatWithDocumentInput = {
        message: 'What does this page contain?',
        documentImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      };

      const expectedOutput = {
        response: 'The page contains a summary of financial data.',
      };

      mockPromptFunction.mockResolvedValue({
        output: expectedOutput,
      });

      (genkitModule.ai.defineFlow as any).mockImplementation((config: any, handler: any) => {
        return async (input: any) => handler(input);
      });

      vi.resetModules();
      const { chatWithDocument: testFunction } = await import('@/ai/flows/ai-chat-flow');

      const result = await testFunction(input);

      expect(result).toHaveProperty('response');
    });

    it('should handle chat history', async () => {
      const input: ChatWithDocumentInput = {
        message: 'Can you elaborate?',
        history: [
          {
            role: 'user',
            content: [{ text: 'What is this document?' }],
          },
          {
            role: 'model',
            content: [{ text: 'This is a technical specification.' }],
          },
        ],
      };

      const expectedOutput = {
        response: 'Sure, the document outlines API specifications for version 2.0.',
      };

      mockPromptFunction.mockResolvedValue({
        output: expectedOutput,
      });

      (genkitModule.ai.defineFlow as any).mockImplementation((config: any, handler: any) => {
        return async (input: any) => handler(input);
      });

      vi.resetModules();
      const { chatWithDocument: testFunction } = await import('@/ai/flows/ai-chat-flow');

      const result = await testFunction(input);

      expect(result).toHaveProperty('response');
    });

    it('should apply personalization settings', async () => {
      const input: ChatWithDocumentInput = {
        message: 'Explain this concept',
        personalization: {
          role: 'Software Engineer',
          tone: 'professional',
          outputFormat: 'bullet points',
        },
      };

      const expectedOutput = {
        response: '• Key concept: Microservices\n• Benefits: Scalability, maintainability',
      };

      mockPromptFunction.mockResolvedValue({
        output: expectedOutput,
      });

      (genkitModule.ai.defineFlow as any).mockImplementation((config: any, handler: any) => {
        return async (input: any) => handler(input);
      });

      vi.resetModules();
      const { chatWithDocument: testFunction } = await import('@/ai/flows/ai-chat-flow');

      const result = await testFunction(input);

      expect(result).toHaveProperty('response');
    });
  });

  describe('error handling', () => {
    it('should handle prompt execution errors', async () => {
      const input: ChatWithDocumentInput = {
        message: 'Test message',
      };

      mockPromptFunction.mockRejectedValue(new Error('AI service unavailable'));

      (genkitModule.ai.defineFlow as any).mockImplementation((config: any, handler: any) => {
        return async (input: any) => handler(input);
      });

      vi.resetModules();
      const { chatWithDocument: testFunction } = await import('@/ai/flows/ai-chat-flow');

      await expect(testFunction(input)).rejects.toThrow('AI service unavailable');
    });

    it('should handle missing output', async () => {
      const input: ChatWithDocumentInput = {
        message: 'Test message',
      };

      mockPromptFunction.mockResolvedValue({
        output: null,
      });

      (genkitModule.ai.defineFlow as any).mockImplementation((config: any, handler: any) => {
        return async (input: any) => handler(input);
      });

      vi.resetModules();
      const { chatWithDocument: testFunction } = await import('@/ai/flows/ai-chat-flow');

      // The function uses optional chaining, so it should handle null
      await expect(testFunction(input)).rejects.toThrow();
    });
  });

  describe('input validation', () => {
    it('should handle optional fields correctly', async () => {
      const minimalInput: ChatWithDocumentInput = {
        message: 'Hello',
      };

      const expectedOutput = {
        response: 'Hi! How can I help you with this document?',
      };

      mockPromptFunction.mockResolvedValue({
        output: expectedOutput,
      });

      (genkitModule.ai.defineFlow as any).mockImplementation((config: any, handler: any) => {
        return async (input: any) => handler(input);
      });

      vi.resetModules();
      const { chatWithDocument: testFunction } = await import('@/ai/flows/ai-chat-flow');

      const result = await testFunction(minimalInput);

      expect(result).toHaveProperty('response');
    });

    it('should handle partial personalization', async () => {
      const input: ChatWithDocumentInput = {
        message: 'Summarize this',
        personalization: {
          tone: 'casual',
        },
      };

      const expectedOutput = {
        response: 'Sure thing! Here\'s a quick summary...',
      };

      mockPromptFunction.mockResolvedValue({
        output: expectedOutput,
      });

      (genkitModule.ai.defineFlow as any).mockImplementation((config: any, handler: any) => {
        return async (input: any) => handler(input);
      });

      vi.resetModules();
      const { chatWithDocument: testFunction } = await import('@/ai/flows/ai-chat-flow');

      const result = await testFunction(input);

      expect(result).toHaveProperty('response');
    });
  });

  describe('output structure', () => {
    it('should return response with correct structure', async () => {
      const input: ChatWithDocumentInput = {
        message: 'Test',
      };

      const expectedOutput = {
        response: 'Test response',
      };

      mockPromptFunction.mockResolvedValue({
        output: expectedOutput,
      });

      (genkitModule.ai.defineFlow as any).mockImplementation((config: any, handler: any) => {
        return async (input: any) => handler(input);
      });

      vi.resetModules();
      const { chatWithDocument: testFunction } = await import('@/ai/flows/ai-chat-flow');

      const result = await testFunction(input);

      expect(result).toEqual({
        response: 'Test response',
      });
    });

    it('should ensure response is a string', async () => {
      const input: ChatWithDocumentInput = {
        message: 'Test',
      };

      const expectedOutput = {
        response: 'String response',
      };

      mockPromptFunction.mockResolvedValue({
        output: expectedOutput,
      });

      (genkitModule.ai.defineFlow as any).mockImplementation((config: any, handler: any) => {
        return async (input: any) => handler(input);
      });

      vi.resetModules();
      const { chatWithDocument: testFunction } = await import('@/ai/flows/ai-chat-flow');

      const result = await testFunction(input);

      expect(typeof result.response).toBe('string');
    });
  });
});
