/**
 * API for food_meals table.
 * 
 * Architecture Notes:
 * - Domain: Specialized data (meal logging for Food workout type)
 * - RLS: Users can only access meals for their own entries
 * - Relationships: Many-to-one with journal_entries (Food type)
 * - Operations: CRUD for meal tracking, often grouped by entry
 */

import { getSupabaseClient } from "../services/supabaseClient";
import type {
  FoodMeal,
  FoodMealInsert,
  FoodMealUpdate,
  MealType,
} from "./types";
import { handleSupabaseError, NotFoundError } from "./errors";

/**
 * Get all meals for a specific journal entry.
 * 
 * Architecture Note: RLS ensures entry belongs to current user.
 */
export async function getMealsByEntryId(
  entryId: string
): Promise<FoodMeal[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("food_meals")
    .select("*")
    .eq("entry_id", entryId)
    .order("time_of_day", { ascending: true });

  if (error) {
    throw handleSupabaseError(error);
  }

  return data || [];
}

/**
 * Get meals grouped by meal type for an entry.
 * 
 * Architecture Note: Useful for displaying meals by type (Breakfast, Lunch, etc.).
 */
export async function getMealsByEntryGroupedByType(
  entryId: string
): Promise<Record<MealType, FoodMeal[]>> {
  const meals = await getMealsByEntryId(entryId);

  const grouped: Record<MealType, FoodMeal[]> = {
    Breakfast: [],
    Lunch: [],
    Snack: [],
    Dinner: [],
  };

  for (const meal of meals) {
    grouped[meal.meal_type].push(meal);
  }

  return grouped;
}

/**
 * Get meals for a specific meal type within an entry.
 */
export async function getMealsByType(
  entryId: string,
  mealType: MealType
): Promise<FoodMeal[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("food_meals")
    .select("*")
    .eq("entry_id", entryId)
    .eq("meal_type", mealType)
    .order("time_of_day", { ascending: true });

  if (error) {
    throw handleSupabaseError(error);
  }

  return data || [];
}

/**
 * Get a single meal by ID.
 */
export async function getMealById(id: string): Promise<FoodMeal> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("food_meals")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw handleSupabaseError(error);
  }

  if (!data) {
    throw new NotFoundError("FoodMeal", id);
  }

  return data;
}

/**
 * Create a meal.
 * 
 * Architecture Note: RLS ensures entry belongs to current user.
 */
export async function createMeal(input: FoodMealInsert): Promise<FoodMeal> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("food_meals")
    .insert(input)
    .select()
    .single();

  if (error) {
    throw handleSupabaseError(error);
  }

  if (!data) {
    throw new Error("Failed to create meal");
  }

  return data;
}

/**
 * Bulk create meals (common pattern: save all meals for a day at once).
 * 
 * Architecture Note: Single insert array for transaction-like behavior.
 */
export async function createMeals(
  inputs: FoodMealInsert[]
): Promise<FoodMeal[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("food_meals")
    .insert(inputs)
    .select();

  if (error) {
    throw handleSupabaseError(error);
  }

  return data || [];
}

/**
 * Update an existing meal.
 */
export async function updateMeal(
  id: string,
  input: FoodMealUpdate
): Promise<FoodMeal> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("food_meals")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw handleSupabaseError(error);
  }

  if (!data) {
    throw new NotFoundError("FoodMeal", id);
  }

  return data;
}

/**
 * Delete a meal.
 */
export async function deleteMeal(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("food_meals")
    .delete()
    .eq("id", id);

  if (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Delete all meals for an entry (useful when resetting Food entry).
 * 
 * Architecture Note: RLS ensures user can only delete meals for their own entries.
 */
export async function deleteMealsByEntryId(entryId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("food_meals")
    .delete()
    .eq("entry_id", entryId);

  if (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Get meals across multiple entries (for weekly/monthly views).
 * 
 * Architecture Note: Useful for nutrition tracking across time periods.
 */
export async function getMealsByEntryIds(
  entryIds: string[]
): Promise<FoodMeal[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("food_meals")
    .select("*")
    .in("entry_id", entryIds)
    .order("entry_id", { ascending: true })
    .order("time_of_day", { ascending: true });

  if (error) {
    throw handleSupabaseError(error);
  }

  return data || [];
}
