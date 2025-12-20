/**
 * API for profiles table.
 * 
 * Architecture Notes:
 * - Domain: User data (extended profile beyond auth.users)
 * - RLS: Users can only access their own profile (1:1 with auth.users)
 * - Relationships: One-to-one with auth.users (id = auth.users.id)
 * - Operations: Read/update own profile, create on first signup
 */

import { getSupabaseClient } from "../services/supabaseClient";
import type { Profile, ProfileInsert, ProfileUpdate } from "./types";
import { handleSupabaseError, NotFoundError } from "./errors";

/**
 * Get the current user's profile.
 * 
 * Architecture Note: RLS ensures user can only read their own profile.
 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = getSupabaseClient();

  // Get current user ID
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw handleSupabaseError(error);
  }

  return data;
}

/**
 * Get a profile by user ID (if needed for admin/future features).
 * 
 * Architecture Note: Currently RLS restricts to own profile, but structure
 * allows extension for coach/admin views in the future.
 */
export async function getProfileById(userId: string): Promise<Profile> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw handleSupabaseError(error);
  }

  if (!data) {
    throw new NotFoundError("Profile", userId);
  }

  return data;
}

/**
 * Create a profile for the current user.
 * 
 * Architecture Note:
 * - Typically called during onboarding/first signup
 * - RLS ensures id = auth.uid()
 * - Should be idempotent (handle case where profile already exists)
 */
export async function createProfile(
  input: ProfileInsert
): Promise<Profile> {
  const supabase = getSupabaseClient();

  // Get current user ID
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to create profile");
  }

  // Ensure id matches current user
  const profileData: ProfileInsert = {
    ...input,
    id: user.id,
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(profileData)
    .select()
    .single();

  if (error) {
    throw handleSupabaseError(error);
  }

  if (!data) {
    throw new Error("Failed to create profile");
  }

  return data;
}

/**
 * Update the current user's profile.
 * 
 * Architecture Note: RLS ensures user can only update their own profile.
 */
export async function updateProfile(
  input: ProfileUpdate
): Promise<Profile> {
  const supabase = getSupabaseClient();

  // Get current user ID
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to update profile");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    throw handleSupabaseError(error);
  }

  if (!data) {
    throw new NotFoundError("Profile", user.id);
  }

  return data;
}

/**
 * Upsert profile (create if doesn't exist, update if exists).
 * 
 * Architecture Note: Useful for "save profile" flows that should work
 * whether profile exists or not.
 */
export async function upsertProfile(
  input: ProfileInsert
): Promise<Profile> {
  const supabase = getSupabaseClient();

  // Get current user ID
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to upsert profile");
  }

  // Ensure id matches current user
  const profileData: ProfileInsert = {
    ...input,
    id: user.id,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(profileData, {
      onConflict: "id",
    })
    .select()
    .single();

  if (error) {
    throw handleSupabaseError(error);
  }

  if (!data) {
    throw new Error("Failed to upsert profile");
  }

  return data;
}

/**
 * Check if current user has a profile.
 * 
 * Architecture Note: Useful for onboarding flows.
 */
export async function hasProfile(): Promise<boolean> {
  const profile = await getProfile();
  return profile !== null;
}
