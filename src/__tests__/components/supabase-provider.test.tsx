import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import SupabaseProvider, { useSupabase } from '@/lib/supabase-provider';

// Mock Supabase client - must be defined before vi.mock
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

describe('SupabaseProvider', () => {
  let mockRouter: any;
  let mockAuthSubscription: any;
  let mockSupabaseClient: any;

  beforeEach(async () => {
    // Get the mocked supabase client
    const supabaseModule = await import('@/lib/supabaseClient');
    mockSupabaseClient = supabaseModule.supabase;

    mockRouter = {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    };

    mockAuthSubscription = {
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    };

    (useRouter as any).mockReturnValue(mockRouter);
    (usePathname as any).mockReturnValue('/');

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    mockSupabaseClient.auth.onAuthStateChange.mockReturnValue(mockAuthSubscription);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('session management', () => {
    it('should initialize with no session', async () => {
      const TestComponent = () => {
        const { session } = useSupabase();
        return <div>{session ? 'Logged in' : 'Logged out'}</div>;
      };

      render(
        <SupabaseProvider>
          <TestComponent />
        </SupabaseProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Logged out')).toBeInTheDocument();
      });
    });

    it('should initialize with existing session', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const TestComponent = () => {
        const { session } = useSupabase();
        return <div>{session ? 'Logged in' : 'Logged out'}</div>;
      };

      render(
        <SupabaseProvider>
          <TestComponent />
        </SupabaseProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Logged in')).toBeInTheDocument();
      });
    });

    it('should provide supabase client through context', () => {
      const TestComponent = () => {
        const { supabase } = useSupabase();
        return <div>{supabase ? 'Client available' : 'No client'}</div>;
      };

      render(
        <SupabaseProvider>
          <TestComponent />
        </SupabaseProvider>
      );

      expect(screen.getByText('Client available')).toBeInTheDocument();
    });

    it('should throw error when useSupabase used outside provider', () => {
      const TestComponent = () => {
        useSupabase();
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useSupabase must be used within a SupabaseProvider'
      );

      consoleError.mockRestore();
    });
  });

  describe('auth state changes', () => {
    it('should redirect to login on SIGNED_OUT event', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      let authCallback: Function | undefined;
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback: Function) => {
        authCallback = callback;
        return mockAuthSubscription;
      });

      const TestComponent = () => {
        const { session } = useSupabase();
        return <div>{session ? 'Logged in' : 'Logged out'}</div>;
      };

      render(
        <SupabaseProvider>
          <TestComponent />
        </SupabaseProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Logged in')).toBeInTheDocument();
      });

      // Simulate sign out
      authCallback?.('SIGNED_OUT', null);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login');
        expect(screen.getByText('Logged out')).toBeInTheDocument();
      });
    });

    it('should update session on auth state change', async () => {
      let authCallback: Function | undefined;
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback: Function) => {
        authCallback = callback;
        return mockAuthSubscription;
      });

      const TestComponent = () => {
        const { session } = useSupabase();
        return <div>{session ? `User: ${session.user.id}` : 'No session'}</div>;
      };

      render(
        <SupabaseProvider>
          <TestComponent />
        </SupabaseProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('No session')).toBeInTheDocument();
      });

      const newSession = {
        user: { id: 'user-456', email: 'new@example.com' },
        access_token: 'token-456',
      };

      // Simulate sign in
      authCallback?.('SIGNED_IN', newSession);

      await waitFor(() => {
        expect(screen.getByText('User: user-456')).toBeInTheDocument();
      });
    });
  });

  describe('route-based redirects', () => {
    it('should redirect to login when accessing dashboard without session', async () => {
      (usePathname as any).mockReturnValue('/dashboard');

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(
        <SupabaseProvider>
          <div>Dashboard</div>
        </SupabaseProvider>
      );

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login');
      });
    });

    it('should redirect to dashboard when logged in on non-app route', async () => {
      (usePathname as any).mockReturnValue('/login');

      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <SupabaseProvider>
          <div>Login Page</div>
        </SupabaseProvider>
      );

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should not redirect after session loads when on dashboard with valid session', async () => {
      (usePathname as any).mockReturnValue('/dashboard');

      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const TestComponent = () => {
        const { session } = useSupabase();
        return <div>{session ? 'Has Session' : 'No Session'}</div>;
      };

      render(
        <SupabaseProvider>
          <TestComponent />
        </SupabaseProvider>
      );

      // Initially, it will redirect to login because session is null
      expect(mockRouter.push).toHaveBeenCalledWith('/login');

      // Wait for session to load
      await waitFor(() => {
        expect(screen.getByText('Has Session')).toBeInTheDocument();
      });

      // After session loads, no additional redirect should occur to dashboard
      // because we're already on a dashboard route with a valid session
      expect(mockRouter.push).toHaveBeenCalledTimes(1); // Only the initial call
    });

    it('should not redirect when on public route without session', async () => {
      (usePathname as any).mockReturnValue('/');

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(
        <SupabaseProvider>
          <div>Home Page</div>
        </SupabaseProvider>
      );

      await waitFor(() => {
        expect(mockRouter.push).not.toHaveBeenCalled();
      });
    });

    it('should detect dashboard subroutes as app routes', async () => {
      (usePathname as any).mockReturnValue('/dashboard/documents');

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(
        <SupabaseProvider>
          <div>Documents</div>
        </SupabaseProvider>
      );

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe from auth listener on unmount', async () => {
      const { unmount } = render(
        <SupabaseProvider>
          <div>Test</div>
        </SupabaseProvider>
      );

      await waitFor(() => {
        expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
      });

      unmount();

      expect(mockAuthSubscription.data.subscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle getSession error gracefully', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Network error'),
      });

      const TestComponent = () => {
        const { session } = useSupabase();
        return <div>{session ? 'Logged in' : 'Logged out'}</div>;
      };

      render(
        <SupabaseProvider>
          <TestComponent />
        </SupabaseProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Logged out')).toBeInTheDocument();
      });
    });

    it('should handle rapid pathname changes', async () => {
      const { rerender } = render(
        <SupabaseProvider>
          <div>Test</div>
        </SupabaseProvider>
      );

      (usePathname as any).mockReturnValue('/dashboard');
      rerender(
        <SupabaseProvider>
          <div>Test</div>
        </SupabaseProvider>
      );

      (usePathname as any).mockReturnValue('/');
      rerender(
        <SupabaseProvider>
          <div>Test</div>
        </SupabaseProvider>
      );

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalled();
      });
    });
  });
});
