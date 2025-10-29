import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Supabase Mocking Example', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('demonstrates how to mock Supabase client', () => {
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: 'test-user-123', email: 'test@example.com' },
              access_token: 'mock-token',
            },
          },
          error: null,
        }),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 1, name: 'Test Document' },
          error: null,
        }),
      })),
    };

    expect(mockSupabase.auth.getSession).toBeDefined();
    expect(mockSupabase.from).toBeDefined();
  });

  it('demonstrates mocking database queries', async () => {
    const mockFrom = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          { id: 1, title: 'Document 1' },
          { id: 2, title: 'Document 2' },
        ],
        error: null,
      }),
    }));

    const result = await mockFrom('documents').select('*').eq('user_id', '123');
    expect(result.data).toHaveLength(2);
    expect(result.data?.[0].title).toBe('Document 1');
  });

  it('demonstrates mocking authentication methods', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: { access_token: 'token-123' },
      },
      error: null,
    });

    const result = await mockSignIn({ email: 'test@example.com', password: 'password' });
    expect(result.data.user.email).toBe('test@example.com');
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('demonstrates mocking error scenarios', async () => {
    const mockQueryWithError = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed', code: 'CONNECTION_ERROR' },
    });

    const result = await mockQueryWithError();
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error.message).toBe('Database connection failed');
  });
});
