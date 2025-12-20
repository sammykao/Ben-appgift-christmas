/**
 * API for workout_types table.
 * 
 * Architecture Notes:
 * - Domain: Configuration data (workout type definitions)
 * - RLS: Users can read system defaults + their own custom types
 * - Operations: Read-heavy (system defaults rarely change)
 * - Optimization: Indexed by owner_id and name for fast lookups
 */

import { getSupabaseClient } from "../services/supabaseClient";
import type {
  WorkoutType,
  WorkoutTypeInsert,
  WorkoutTypeUpdate,
} from "./types";
import { handleSupabaseError, NotFoundError } from "./errors";

/**
 * Get all workout types available to the current user.
 * Returns system defaults (owner_id = null) + user's custom types.
 * 
 * Architecture Note: Single query leverages RLS to filter automatically.
 */
export async function getWorkoutTypes(): Promise<WorkoutType[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("workout_types")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw handleSupabaseError(error);
  }

  return data || [];
}

/**
 * Get system default workout types only.
 * 
 * Architecture Note: Filtered query for system defaults (used in settings).
 */
export async function getSystemWorkoutTypes(): Promise<WorkoutType[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("workout_types")
    .select("*")
    .is("owner_id", null)
    .eq("is_system_default", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw handleSupabaseError(error);
  }

  return data || [];
}

/**
 * Get user's custom workout types only.
 * 
 * Architecture Note: Separate query for user customization UI.
 */
export async function getUserWorkoutTypes(): Promise<WorkoutType[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("workout_types")
    .select("*")
    .not("owner_id", "is", null)
    .eq("is_system_default", false)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw handleSupabaseError(error);
  }

  return data || [];
}

/**
 * Get a single workout type by ID.
 * 
 * Architecture Note: RLS ensures user can only access their own or system defaults.
 */
export async function getWorkoutTypeById(
  id: string
): Promise<WorkoutType> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("workout_types")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw handleSupabaseError(error);
  }

  if (!data) {
    throw new NotFoundError("WorkoutType", id);
  }

  return data;
}

/**
 * Find workout type by name (case-insensitive).
 * 
 * Architecture Note: Useful for finding system defaults by name (e.g., "Training", "Game").
 */
export async function getWorkoutTypeByName(
  name: string
): Promise<WorkoutType | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("workout_types")
    .select("*")
    .ilike("name", name)
    .maybeSingle();

  if (error) {
    throw handleSupabaseError(error);
  }

  return data;
}

/**
 * Create a custom workout type for the current user.
 * 
 * Architecture Note:
 * - RLS policy ensures owner_id = auth.uid() and is_system_default = false
 * - Unique constraint on (owner_id, lower(name)) prevents duplicates
 */
export async function createWorkoutType(
  input: WorkoutTypeInsert
): Promise<WorkoutType> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("workout_types")
    .insert({
      ...input,
      is_system_default: false, // Enforce non-system for user-created
    })
    .select()
    .single();

  if (error) {
    throw handleSupabaseError(error);
  }

  if (!data) {
    throw new Error("Failed to create workout type");
  }

  return data;
}

/**
 * Update a user's custom workout type.
 * 
 * Architecture Note: RLS ensures only non-system, user-owned types can be updated.
 */
export async function updateWorkoutType(
  id: string,
  input: WorkoutTypeUpdate
): Promise<WorkoutType> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("workout_types")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw handleSupabaseError(error);
  }

  if (!data) {
    throw new NotFoundError("WorkoutType", id);
  }

  return data;
}

/**
 * Delete a user's custom workout type.
 * 
 * Architecture Note:
 * - RLS ensures only user-owned, non-system types can be deleted
 * - Cascade delete will remove associated journal_questions (if any)
 */
export async function deleteWorkoutType(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("workout_types")
    .delete()
    .eq("id", id);

  if (error) {
    throw handleSupabaseError(error);
  }
}
