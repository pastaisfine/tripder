import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./auth-state";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Auth getSession notice:", error.message);
        }
        if (mounted) {
          setSession(data?.session ?? null);
          setUser(data?.session?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Error initializing auth session:", err);
        if (mounted) setLoading(false);
      }
    }

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const signUp = useCallback(async ({ email, password, username, avatarUrl }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username?.trim() || email.split("@")[0],
          avatar_url: avatarUrl || "",
        },
      },
    });
    if (error) throw error;
    return data;
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async ({ username, avatarUrl }) => {
    const updates = {};
    if (username !== undefined) updates.username = username.trim();
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl.trim();

    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });
    if (error) throw error;
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  }, []);

  const sendPasswordReset = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  }, []);

  const profile = useMemo(() => {
    if (!user) return null;
    const meta = user.user_metadata || {};
    const username = meta.username || meta.full_name || (user.email ? user.email.split("@")[0] : "Traveler");
    return {
      id: user.id,
      email: user.email,
      username,
      avatarUrl: meta.avatar_url || "",
      isEmailVerified: !!user.email_confirmed_at,
    };
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      updatePassword,
      sendPasswordReset,
    }),
    [user, session, profile, loading, signUp, signIn, signOut, updateProfile, updatePassword, sendPasswordReset]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
