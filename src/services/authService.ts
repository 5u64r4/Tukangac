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

export const SUPERADMIN_EMAIL = 'sugara.ardi@gmail.com';
export const ADMIN_EMAIL = 'ardi5u64r4@gmail.com';

/**
 * Check if given email is the designated superadmin email
 */
export function isSuperadminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized === 'sugara.ardi@gmail.com' || normalized === 'sugara.ardi19@gmail.com';
}

/**
 * Check if given email is the designated admin email
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized === 'ardi5u64r4@gmail.com';
}

/**
 * Register a new user with Supabase Auth and save profile record.
 * Admin/Superadmin role cannot be registered publicly; only superadmin emails get superadmin role.
 * Regular registrants always receive 'customer' role. If they choose technician, an application is submitted for verification.
 */
export async function signUpUser(params: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'customer' | 'technician';
}): Promise<{ user: any; profile: UserProfile | null }> {
  const isSuperadmin = isSuperadminEmail(params.email);
  // Enforce: regular sign-up is always initially customer; superadmin emails get superadmin
  const assignedRole: UserRole = isSuperadmin ? 'superadmin' : 'customer';

  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: params.fullName,
        phone: params.phone || '',
        role: assignedRole
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
      role: assignedRole,
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
        role: assignedRole,
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
  const normalizedEmail = (email || '').trim().toLowerCase();

  // 1. Attempt standard Supabase authentication
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  });

  if (!error && data?.user) {
    return await getUserProfile(data.user.id);
  }

  // 2. Handle Supabase "Email not confirmed" or tester account login
  if (error) {
    const isEmailNotConfirmed = 
      error.message?.toLowerCase().includes('email not confirmed') || 
      (error as any)?.code === 'email_not_confirmed';

    // If password was verified by Supabase (yielding email_not_confirmed)
    if (isEmailNotConfirmed) {
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      if (profileRow) {
        try {
          localStorage.setItem('sb_current_user', JSON.stringify({
            id: profileRow.id,
            email: profileRow.email,
            user_metadata: {
              full_name: profileRow.full_name,
              role: profileRow.role
            }
          }));
        } catch (_) {}
        return await getUserProfile(profileRow.id);
      }
    }



    console.error('Error in signInUser:', error);
    throw error;
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
      // Fallback 1: check by session user email if id didn't match
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;
      if (sessionUser?.email) {
        const { data: byEmail } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', sessionUser.email)
          .maybeSingle();

        if (byEmail) {
          const isSuper = isSuperadminEmail(byEmail.email) || byEmail.role === 'superadmin';
          const isAdm = isAdminEmail(byEmail.email) || byEmail.role === 'admin';
          const isTech = (byEmail.email && byEmail.email.toLowerCase() === 'andipratama@gmail.com') || byEmail.role === 'technician';
          const isCust = (byEmail.email && byEmail.email.toLowerCase() === 'budisantoso@gmail.com');

          let resolvedRole: UserRole = byEmail.role as UserRole;
          if (isSuper) resolvedRole = 'superadmin';
          else if (isAdm) resolvedRole = 'admin';
          else if (isTech) resolvedRole = 'technician';
          else if (isCust) resolvedRole = 'customer';

          return {
            id: byEmail.id || userId,
            fullName: byEmail.full_name || 'Pengguna',
            phone: byEmail.phone || '',
            email: byEmail.email,
            role: resolvedRole,
            avatarUrl: byEmail.avatar_url,
            isActive: byEmail.is_active ?? true,
            createdAt: byEmail.created_at,
            updatedAt: byEmail.updated_at
          };
        }
      }

      // Fallback 2: check auth session metadata
      const meta = sessionUser?.user_metadata;
      if (meta && sessionUser.id === userId) {
        let metaRole: UserRole = (meta.role as UserRole) || 'customer';
        if (isSuperadminEmail(sessionUser.email)) metaRole = 'superadmin';
        else if (isAdminEmail(sessionUser.email)) metaRole = 'admin';
        else if (sessionUser.email?.toLowerCase() === 'andipratama@gmail.com') metaRole = 'technician';
        else if (sessionUser.email?.toLowerCase() === 'budisantoso@gmail.com') metaRole = 'customer';

        return {
          id: userId,
          fullName: meta.full_name || 'Pengguna',
          phone: meta.phone || '',
          email: sessionUser.email || '',
          role: metaRole,
          isActive: true
        };
      }
      return null;
    }

    const isSuperadmin = isSuperadminEmail(data.email) || data.role === 'superadmin';
    const isAdmin = isAdminEmail(data.email) || data.role === 'admin';
    const isTech = (data.email && data.email.toLowerCase() === 'andipratama@gmail.com') || data.role === 'technician';
    const isCust = (data.email && data.email.toLowerCase() === 'budisantoso@gmail.com');

    let resolvedRole: UserRole = data.role as UserRole;
    if (isSuperadmin) {
      resolvedRole = 'superadmin';
    } else if (isAdmin) {
      resolvedRole = 'admin';
    } else if (isTech) {
      resolvedRole = 'technician';
    } else if (isCust) {
      resolvedRole = 'customer';
    }

    return {
      id: data.id,
      fullName: data.full_name,
      phone: data.phone,
      email: data.email,
      role: resolvedRole,
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
 * Update user role in database and return updated profile.
 * Sensitive roles can only be updated by authorized administrators / database triggers.
 * Customers cannot elevate their own role to technician, admin, or superadmin.
 * Technicians cannot elevate their own role to admin or superadmin.
 * Admins cannot elevate their own role to superadmin.
 */
export async function updateUserProfileRole(userId: string, newRole: UserRole): Promise<UserProfile | null> {
  try {
    const current = await getUserProfile(userId);
    if (!current) return null;

    // Customer cannot change themselves directly to technician, admin, or superadmin
    if (current.role === 'customer' && newRole !== 'customer') {
      console.warn('Unauthorized: Customer cannot self-escalate role');
      return current;
    }

    // Technician cannot change themselves to admin or superadmin
    if (current.role === 'technician' && (newRole === 'admin' || newRole === 'superadmin')) {
      console.warn('Unauthorized: Technician cannot self-escalate role');
      return current;
    }

    // Admin cannot change themselves to superadmin
    if (current.role === 'admin' && newRole === 'superadmin') {
      console.warn('Unauthorized: Admin cannot self-escalate to superadmin');
      return current;
    }

    // Only designated superadmin email can hold superadmin role
    if (newRole === 'superadmin' && !isSuperadminEmail(current.email)) {
      console.warn('Unauthorized role change attempt to superadmin');
      return current;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.warn('Could not update profile role in profiles table:', error);
    }

    return await getUserProfile(userId);
  } catch (err) {
    console.error('Error updating user profile role:', err);
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

