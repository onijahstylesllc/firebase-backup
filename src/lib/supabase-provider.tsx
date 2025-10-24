
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { usePathname, useRouter } from 'next/navigation';


type SupabaseContext = {
    supabase: SupabaseClient;
    session: any;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();
    const isAppRoute = pathname.startsWith('/dashboard');

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            if (event === 'SIGNED_OUT') {
                router.push('/login');
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [router]);

    useEffect(() => {
        if (!session && isAppRoute) {
            router.push('/login');
        }
        if (session && !isAppRoute) {
            router.push('/dashboard');
        }
    }, [session, isAppRoute, pathname, router]);
    
    return (
        <Context.Provider value={{ supabase, session }}>
            {children}
        </Context.Provider>
    )
}

export const useSupabase = () => {
    const context = useContext(Context);
    if (context === undefined) {
        throw new Error('useSupabase must be used within a SupabaseProvider');
    }
    return context;
}
