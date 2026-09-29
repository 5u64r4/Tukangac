import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserRole } from '../types';

export interface UserProfile {
  id: string;
  fullName: string;
  phone?: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Register a new user with Supabase Auth and save profile record
 */
export async function signUpUser(params: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
}): Promise<{ user: any; profile: UserProfile | null }> {
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: params.fullName,
        phone: params.phone || '',
        role: params.role
      }
    }
  });

  if (error) {
    console.error('Error in signUpUser:', error);
    throw error;
  }

  const user = data.user;
  let profile: UserProfile | null = null;

  if (user) {
    profile = {
      id: user.id,
      fullName: params.fullName,
      phone: params.phone,
      email: params.email,
      role: params.role,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Insert to profiles table
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: params.fullName,
        phone: params.phone || null,
        email: params.email,
        role: params.role,
        is_active: true
      });
    } catch (e) {
      console.warn('Could not insert profile into profiles table:', e);
    }
  }

  return { user, profile };
}

/**
 * Sign in existing user with email and password
 */
export async function signInUser(email: string, password: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Error in signInUser:', error);
    throw error;
  }

  if (data.user) {
    return await getUserProfile(data.user.id);
  }

  return null;
}

/**
 * Sign out current authenticated user
 */
export async function signOutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error in signOutUser:', error);
    throw error;
  }
}

/**
 * Fetch profile for a given user UUID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      // Fallback: check auth session metadata
      const { data: sessionData } = await supabase.auth.getSession();
      const meta = sessionData?.session?.user?.user_metadata;
      if (meta && sessionData.session.user.id === userId) {
        return {
          id: userId,
          fullName: meta.full_name || 'Pengguna',
          phone: meta.phone || '',
          email: sessionData.session.user.email || '',
          role: (meta.role as UserRole) || 'customer',
          isActive: true
        };
      }
      return null;
    }

    return {
      id: data.id,
      fullName: data.full_name,
      phone: data.phone,
      email: data.email,
      role: data.role as UserRole,
      avatarUrl: data.avatar_url,
      isActive: data.is_active ?? true,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

/**
 * Get current active session user and profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return null;
    return await getUserProfile(data.session.user.id);
  } catch (err) {
    console.error('Error getting current user profile:', err);
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (profile: UserProfile | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const profile = await getUserProfile(session.user.id);
      callback(profile);
    } else {
      callback(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}
