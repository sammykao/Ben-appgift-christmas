/**
 * API for notification_preferences table.
 * 
 * Architecture Notes:
 * - Domain: User notification settings
 * - RLS: Users can only access their own preferences
 * - Operations: Read/update preferences, create default on first access
 * - Defaults: Enabled, 6 PM daily, all days, streak reminders on
 */

import { getSupabaseClient } from "../services/supabaseClient";
import type {
  NotificationPreferences,
  NotificationPreferencesInsert,
  NotificationPreferencesUpdate,
} from "./types";
import { handleSupabaseError } from "./errors";

/**
 * Get the current user's notification preferences.
 * Creates default preferences if they don't exist.
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const supabase = getSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Try to get existing preferences
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw handleSupabaseError(error);
  }

  // If no preferences exist, create defaults
  if (!data) {
    const defaultPrefs: NotificationPreferencesInsert = {
      enabled: true,
      reminder_times: ["18:00"], // 6 PM default
      reminder_days: [0, 1, 2, 3, 4, 5, 6], // All days
      streak_reminders: true,
      mood_insights: true,
    };

    const { data: newData, error: createError } = await supabase
      .from("notification_preferences")
      .insert(defaultPrefs)
      .select()
      .single();

    if (createError) {
      throw handleSupabaseError(createError);
    }

    return newData;
  }

  return data;
}

/**
 * Update notification preferences.
 */
export async function updateNotificationPreferences(
  updates: NotificationPreferencesUpdate
): Promise<NotificationPreferences> {
  const supabase = getSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("notification_preferences")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw handleSupabaseError(error);
  }

  return data;
}
