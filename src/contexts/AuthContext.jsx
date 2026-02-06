import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Detect if we're returning from an OAuth callback
    // Supabase uses hash fragments (#access_token=...) or query params (?code=...)
    const hash = window.location.hash;
    const search = window.location.search;
    const isOAuthCallback = hash.includes('access_token') || 
                            hash.includes('refresh_token') ||
                            search.includes('code=');

    // Timeout to prevent infinite loading if Supabase fails
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - proceeding without session');
        setLoading(false);
      }
    }, 5000);

    // Listen for auth changes FIRST - this will catch the OAuth callback session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session);
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          // Only set loading false if NOT an OAuth callback
          // (OAuth callback will fire SIGNED_IN event with session)
          if (!isOAuthCallback) {
            setLoading(false);
          }
        }

        // Handle sign-in event - create profile if needed
        if (event === 'SIGNED_IN' && session?.user) {
          await ensureProfile(session.user);
          // Clear the URL hash after successful OAuth to clean up the URL
          if (isOAuthCallback && window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
        
        // If we got INITIAL_SESSION event with no session and it's an OAuth callback,
        // don't set loading false yet - wait for SIGNED_IN
        if (event === 'INITIAL_SESSION' && !session && isOAuthCallback) {
          console.log('OAuth callback detected, waiting for session...');
          // Don't set loading to false - wait for SIGNED_IN event
          return;
        }
      }
    );

    // Get initial session - but for OAuth callbacks, let onAuthStateChange handle it
    const initSession = async () => {
      try {
        // This triggers Supabase to parse the URL and fire onAuthStateChange
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          // Try refreshing the session in case it's stale (Safari idle issue)
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (refreshData?.session) {
            setUser(refreshData.session.user);
            await fetchProfile(refreshData.session.user.id);
            return;
          }
          setLoading(false);
          return;
        }
        
        // For OAuth callbacks, onAuthStateChange will handle the session
        // Only set state here for non-OAuth flows
        if (!isOAuthCallback) {
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        // Ignore AbortError - happens during auth transitions
        if (!isAbortError(error)) {
          console.error('Auth session error:', error);
        }
        setLoading(false);
      }
    };

    initSession();

    // Cleanup both timeout and subscription
    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to check if error is an abort (should be ignored)
  const isAbortError = (err) => {
    return err?.name === 'AbortError' || 
           err?.message?.includes('AbortError') ||
           err?.message?.includes('signal is aborted');
  };

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Ignore AbortError - happens during auth transitions
        if (!isAbortError(error)) {
          console.error('Error fetching profile:', error);
        }
      }
      
      setProfile(data);
    } catch (error) {
      // Ignore AbortError
      if (!isAbortError(error)) {
        console.error('Error fetching profile:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const ensureProfile = async (user) => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create profile
        const { error } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        });

        if (error) {
          // Ignore AbortError
          if (!isAbortError(error)) {
            console.error('Error creating profile:', error);
          }
        }
      }

      await fetchProfile(user.id);
    } catch (error) {
      // Ignore AbortError
      if (!isAbortError(error)) {
        console.error('Error ensuring profile:', error);
      }
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error) {
      setProfile(data);
    }

    return { data, error };
  };

  const value = {
    user,
    profile,
    loading,
    updateProfile,
    isAuthenticated: !!user,
    isPremium: profile?.is_premium || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
