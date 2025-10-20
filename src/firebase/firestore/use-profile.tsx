
'use client';
    
import { useCallback } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc, type UseDocResult } from './use-doc';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Define the shape of the user profile data.
export interface UserProfile {
  email: string;
  name?: string;
  profilePictureUrl?: string;
  aiPreferences?: {
    [key: string]: any;
    visualMode?: boolean;
    role?: string;
    tone?: string;
    outputFormat?: string;
  };
}

// Define the return type for the useProfile hook.
export interface UseProfileResult extends UseDocResult<UserProfile> {
  profile: UserProfile | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

/**
 * A hook for accessing and updating the current user's profile document.
 * 
 * It combines `useUser` to get the current user's ID and `useDoc` to subscribe
 * to their profile data in real-time. It also provides a convenient `updateProfile`
 * function to merge new data into the profile.
 * 
 * @returns {UseProfileResult} An object containing the profile data, loading state,
 * error state, and an `updateProfile` function.
 */
export function useProfile(): UseProfileResult {
  const { user } = useUser();
  const firestore = useFirestore();

  // Create a memoized reference to the user's profile document.
  const profileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  
  // Use the useDoc hook to get real-time data for the profile.
  const { data: profile, isLoading, error } = useDoc<UserProfile>(profileRef);

  /**
   * A memoized callback to update the user's profile.
   * It performs a non-blocking merge update on the user's document.
   */
  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (profileRef) {
      setDoc(profileRef, data, { merge: true })
        .catch(error => {
            errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                    path: profileRef.path,
                    operation: 'update',
                    requestResourceData: data,
                })
            );
        });
    }
  }, [profileRef]);

  return {
    profile: profile || null,
    data: profile || null,
    isLoading,
    error,
    updateProfile,
  };
}
      

    