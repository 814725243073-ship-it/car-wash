import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  checkAdminAccess: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Verifies user_id in admin_users table using maybeSingle()
  const checkAdminAccess = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin_users table:', error.message);
        // Do not automatically revoke admin on transient network error if already verified
        return false;
      }

      const verified = Boolean(data && data.user_id === userId);
      setIsAdmin(verified);
      return verified;
    } catch (err: any) {
      console.error('Exception during admin access check:', err);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      if (!isSupabaseConfigured()) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('Session error:', sessionError.message);
        }

        if (sessionData?.session) {
          const currentSession = sessionData.session;
          if (isMounted) {
            setSession(currentSession);
          }

          const { data: userData } = await supabase.auth.getUser();
          const currentUser = userData?.user ?? currentSession.user;

          if (isMounted && currentUser) {
            setUser(currentUser);
            const isAuthorized = await checkAdminAccess(currentUser.id);
            if (!isAuthorized) {
              setAuthError('You are signed in, but you are not authorized as an admin.');
            }
          }
        }
      } catch (err: any) {
        console.error('Session init error:', err);
      } finally {
        // ALWAYS finish loading state in finally block to ensure UI never freezes
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initSession();

    // Listen to Supabase auth state change
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        setSession(newSession);
        const currentUser = newSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          setLoading(true);
          try {
            const isAuthorized = await checkAdminAccess(currentUser.id);
            if (!isAuthorized) {
              setAuthError('You are signed in, but you are not authorized as an admin.');
            } else {
              setAuthError(null);
            }
          } catch (err) {
            console.error('Auth state check error:', err);
          } finally {
            setLoading(false);
          }
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        setAuthError(error.message);
        setLoading(false);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        const msg = 'User profile could not be retrieved.';
        setAuthError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }

      setUser(data.user);
      setSession(data.session);

      // Verify user_id in admin_users
      const isAuthorized = await checkAdminAccess(data.user.id);
      if (!isAuthorized) {
        const unauthorizedMsg = 'You are signed in, but you are not authorized as an admin.';
        setAuthError(unauthorizedMsg);
        setIsAdmin(false);
        setLoading(false);
        return { success: false, error: unauthorizedMsg };
      }

      setIsAdmin(true);
      setAuthError(null);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      const message = err?.message || 'An unexpected error occurred during login.';
      setAuthError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setAuthError(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        authError,
        signIn,
        signOut,
        checkAdminAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
