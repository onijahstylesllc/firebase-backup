import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSupabaseCollection } from '@/lib/use-supabase-collection';
import { useSupabase } from '@/lib/supabase-provider';
import { PostgrestError } from '@supabase/supabase-js';

// Mock the SupabaseProvider
vi.mock('@/lib/supabase-provider', () => ({
  useSupabase: vi.fn(),
}));

describe('useSupabaseCollection', () => {
  let mockSupabase: any;
  let mockChannel: any;
  let mockSubscription: any;
  let channelCallbacks: Map<string, Function>;

  beforeEach(() => {
    channelCallbacks = new Map();

    mockSubscription = {
      unsubscribe: vi.fn(),
    };

    mockChannel = {
      on: vi.fn((event: string, config: any, callback: Function) => {
        channelCallbacks.set('postgres_changes', callback);
        return mockChannel;
      }),
      subscribe: vi.fn((callback?: Function) => {
        if (callback) {
          callback('SUBSCRIBED', null);
        }
        return mockSubscription;
      }),
    };

    mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              then: vi.fn(),
            })),
          })),
        })),
      })),
      channel: vi.fn(() => mockChannel),
      removeChannel: vi.fn(),
    };

    (useSupabase as any).mockReturnValue({ supabase: mockSupabase });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial fetch', () => {
    it('should fetch initial data successfully', async () => {
      const mockData = [
        { id: 1, name: 'Document 1' },
        { id: 2, name: 'Document 2' },
      ];

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
      }));

      const { result } = renderHook(() => useSupabaseCollection('documents'));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      const mockError: PostgrestError = {
        message: 'Database error',
        details: 'Table not found',
        hint: 'Check table name',
        code: 'PGRST116',
      };

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: null, error: mockError })),
      }));

      const { result } = renderHook(() => useSupabaseCollection('documents'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });

    it('should handle null tableName', () => {
      const { result } = renderHook(() => useSupabaseCollection(null));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should handle undefined tableName', () => {
      const { result } = renderHook(() => useSupabaseCollection(undefined));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe('query options', () => {
    it('should apply orderBy option', async () => {
      const mockData = [{ id: 1, name: 'Doc 1' }];
      const mockOrder = vi.fn(() => Promise.resolve({ data: mockData, error: null }));
      const mockSelect = vi.fn(() => ({ order: mockOrder }));

      mockSupabase.from = vi.fn(() => ({ select: mockSelect }));

      renderHook(() =>
        useSupabaseCollection('documents', { orderBy: 'created_at', ascending: false })
      );

      await waitFor(() => {
        expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      });
    });

    it('should apply limit option', async () => {
      const mockData = [{ id: 1, name: 'Doc 1' }];
      const mockLimit = vi.fn(() => Promise.resolve({ data: mockData, error: null }));
      const mockOrder = vi.fn(() => ({ limit: mockLimit }));
      const mockSelect = vi.fn(() => ({ order: mockOrder }));

      mockSupabase.from = vi.fn(() => ({ select: mockSelect }));

      renderHook(() =>
        useSupabaseCollection('documents', { orderBy: 'created_at', limit: 10 })
      );

      await waitFor(() => {
        expect(mockLimit).toHaveBeenCalledWith(10);
      });
    });

    it('should default ascending to true', async () => {
      const mockData = [{ id: 1, name: 'Doc 1' }];
      const mockOrder = vi.fn(() => Promise.resolve({ data: mockData, error: null }));
      const mockSelect = vi.fn(() => ({ order: mockOrder }));

      mockSupabase.from = vi.fn(() => ({ select: mockSelect }));

      renderHook(() => useSupabaseCollection('documents', { orderBy: 'name' }));

      await waitFor(() => {
        expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true });
      });
    });
  });

  describe('realtime updates', () => {
    it('should subscribe to realtime channel', async () => {
      const mockData = [{ id: 1, name: 'Doc 1' }];
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
      }));

      renderHook(() => useSupabaseCollection('documents'));

      await waitFor(() => {
        expect(mockSupabase.channel).toHaveBeenCalledWith('public:documents');
        expect(mockChannel.on).toHaveBeenCalledWith(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'documents' },
          expect.any(Function)
        );
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });
    });

    it('should handle INSERT event', async () => {
      const initialData = [{ id: 1, name: 'Doc 1' }];
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: initialData, error: null })),
      }));

      const { result } = renderHook(() => useSupabaseCollection('documents'));

      await waitFor(() => {
        expect(result.current.data).toEqual(initialData);
      });

      // Simulate INSERT event
      const callback = channelCallbacks.get('postgres_changes');
      const newDoc = { id: 2, name: 'Doc 2' };
      callback?.({
        eventType: 'INSERT',
        new: newDoc,
        old: {},
      });

      await waitFor(() => {
        expect(result.current.data).toHaveLength(2);
        expect(result.current.data).toContainEqual(newDoc);
      });
    });

    it('should handle UPDATE event', async () => {
      const initialData = [
        { id: 1, name: 'Doc 1' },
        { id: 2, name: 'Doc 2' },
      ];
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: initialData, error: null })),
      }));

      const { result } = renderHook(() => useSupabaseCollection('documents'));

      await waitFor(() => {
        expect(result.current.data).toEqual(initialData);
      });

      // Simulate UPDATE event
      const callback = channelCallbacks.get('postgres_changes');
      const updatedDoc = { id: 1, name: 'Doc 1 Updated' };
      callback?.({
        eventType: 'UPDATE',
        new: updatedDoc,
        old: { id: 1 },
      });

      await waitFor(() => {
        expect(result.current.data?.[0]).toEqual(updatedDoc);
      });
    });

    it('should handle DELETE event', async () => {
      const initialData = [
        { id: 1, name: 'Doc 1' },
        { id: 2, name: 'Doc 2' },
      ];
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: initialData, error: null })),
      }));

      const { result } = renderHook(() => useSupabaseCollection('documents'));

      await waitFor(() => {
        expect(result.current.data).toEqual(initialData);
      });

      // Simulate DELETE event
      const callback = channelCallbacks.get('postgres_changes');
      callback?.({
        eventType: 'DELETE',
        new: {},
        old: { id: 1 },
      });

      await waitFor(() => {
        expect(result.current.data).toHaveLength(1);
        expect(result.current.data?.[0].id).toBe(2);
      });
    });

    it('should handle UPDATE event without valid id', async () => {
      const initialData = [{ id: 1, name: 'Doc 1' }];
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: initialData, error: null })),
      }));

      const { result } = renderHook(() => useSupabaseCollection('documents'));

      await waitFor(() => {
        expect(result.current.data).toEqual(initialData);
      });

      // Simulate UPDATE event without id
      const callback = channelCallbacks.get('postgres_changes');
      callback?.({
        eventType: 'UPDATE',
        new: { id: 1, name: 'Updated' },
        old: {},
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(initialData);
      });
    });

    it('should handle subscription error', async () => {
      const initialData = [{ id: 1, name: 'Doc 1' }];
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: initialData, error: null })),
      }));

      mockChannel.subscribe = vi.fn((callback?: Function) => {
        if (callback) {
          callback('ERROR', new Error('Subscription failed'));
        }
        return mockSubscription;
      });

      const { result } = renderHook(() => useSupabaseCollection('documents'));

      await waitFor(() => {
        expect(result.current.error).toEqual({
          message: 'Subscription failed',
          details: 'Subscription failed',
          hint: '',
          code: 'SUB_ERROR',
        });
      });
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe on unmount', async () => {
      const mockData = [{ id: 1, name: 'Doc 1' }];
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
      }));

      const { unmount } = renderHook(() => useSupabaseCollection('documents'));

      await waitFor(() => {
        expect(mockSupabase.channel).toHaveBeenCalled();
      });

      unmount();

      // removeChannel is called with the subscription object, not the channel
      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockSubscription);
    });

    it('should prevent updates after unmount', async () => {
      const initialData = [{ id: 1, name: 'Doc 1' }];
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: initialData, error: null })),
      }));

      const { result, unmount } = renderHook(() => useSupabaseCollection('documents'));

      await waitFor(() => {
        expect(result.current.data).toEqual(initialData);
      });

      const callback = channelCallbacks.get('postgres_changes');
      unmount();

      // Simulate event after unmount
      callback?.({
        eventType: 'INSERT',
        new: { id: 2, name: 'Doc 2' },
        old: {},
      });

      // Should not update after unmount
      expect(result.current.data).toEqual(initialData);
    });
  });

  describe('dependency changes', () => {
    it('should refetch when tableName changes', async () => {
      const mockData1 = [{ id: 1, name: 'Doc 1' }];
      const mockData2 = [{ id: 2, name: 'Team 1' }];

      mockSupabase.from = vi.fn((table: string) => ({
        select: vi.fn(() => {
          if (table === 'documents') {
            return Promise.resolve({ data: mockData1, error: null });
          }
          return Promise.resolve({ data: mockData2, error: null });
        }),
      }));

      const { result, rerender } = renderHook(
        ({ tableName }) => useSupabaseCollection(tableName),
        { initialProps: { tableName: 'documents' } }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData1);
      });

      rerender({ tableName: 'teams' });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData2);
      });
    });
  });
});
