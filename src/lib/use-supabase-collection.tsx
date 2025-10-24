
'use client';

import { useState, useEffect } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { useSupabase } from '@/lib/supabase-provider';

/**
 * Interface for the return value of the useSupabaseCollection hook.
 * @template T Type of the document data.
 */
export interface UseSupabaseCollectionResult<T> {
  data: T[] | null;
  isLoading: boolean;
  error: PostgrestError | null;
}

/**
 * React hook to subscribe to a Supabase table in real-time.
 * Fetches initial data and then listens for INSERT, UPDATE, and DELETE events.
 *
 * @template T Optional type for table row data.
 * @param {string | null | undefined} tableName - The name of the Supabase table to subscribe to.
 * @returns {UseSupabaseCollectionResult<T>} Object with data, isLoading, and error.
 */
export function useSupabaseCollection<T extends { id: any }> (
    tableName: string | null | undefined,
): UseSupabaseCollectionResult<T> {
  const { supabase } = useSupabase();
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    if (!tableName) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);

      const { data: initialData, error: initialError } = await supabase
        .from(tableName)
        .select('*');

      if (!isMounted) return;

      if (initialError) {
        console.error(`[Supabase] Error fetching initial data from ${tableName}:`, initialError);
        setError(initialError);
        setData(null);
      } else {
        setData(initialData as T[]);
      }
      setIsLoading(false);
    };

    fetchData();

    const subscription = supabase
      .channel(`public:${tableName}`)
      .on<T>(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload) => {
          if (!isMounted) return;

          setData(currentData => {
            const current = currentData ? [...currentData] : [];
            
            if (payload.eventType === 'INSERT') {
              return [...current, payload.new];
            }

            if (payload.eventType === 'UPDATE') {
              const idToUpdate = (payload.old as any)?.id;
              if (!idToUpdate) return current;
              const index = current.findIndex(item => item.id === idToUpdate);
              if (index !== -1) {
                current[index] = payload.new;
                return current;
              }
            }

            if (payload.eventType === 'DELETE') {
              // Supabase sends back the old record on delete, which includes the id.
              const idToDelete = (payload.old as any).id;
              if (idToDelete) {
                  return current.filter(item => item.id !== idToDelete);
              }
            }
            return current;
          });
        }
      )
      .subscribe((status, err) => {
        if (err) {
            console.error(`[Supabase] Subscription error on ${tableName}:`, err);
            setError({ message: err.message, details: 'Subscription failed', hint: '', code: 'SUB_ERROR' });
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, [tableName, supabase]);

  return { data, isLoading, error };
}
