'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const signUp = useCallback(async (email: string, password: string, fullName: string, phoneNumber: string) => {
    setLoading(true); setError(null); setSuccess(null);
    try {
      const supabase = getSupabaseClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone_number: phoneNumber.trim(),
          },
        },
      });
      if (authError) { setError(authError.message); return; }
      if (data.session && data.user) {
        setUser(data.user as unknown as User);
        router.replace('/dashboard');
        router.refresh();
      } else if (data.user) {
        setSuccess('Account created! Check your email for the verification link before signing in.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account.');
    } finally { setLoading(false); }
  }, [router]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true); setError(null); setSuccess(null);
    try {
      const supabase = getSupabaseClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) { setError(authError.message); return; }
      if (!data.session || !data.user) { setError('Sign-in did not create an active session. Check email verification.'); return; }
      setUser(data.user as unknown as User);
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally { setLoading(false); }
  }, [router]);

  const signOut = useCallback(async () => {
    try { await getSupabaseClient().auth.signOut(); } finally {
      setUser(null);
      router.replace('/auth/login');
      router.refresh();
    }
  }, [router]);

  return { user, loading, error, success, signUp, signIn, signOut };
}
