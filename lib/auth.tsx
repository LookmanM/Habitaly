import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthCtx = { session: Session | null; loading: boolean };

const AuthContext = createContext<AuthCtx>({ session: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        // Create the users row on first sign-in.
        // The DB trigger handles this automatically; this is a safety-net upsert.
        if (event === 'SIGNED_IN' && session?.user) {
          await supabase.from('users').upsert(
            {
              id: session.user.id,
              email: session.user.email ?? null,
              phone: session.user.phone ?? null,
            },
            { onConflict: 'id' }
          );
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
