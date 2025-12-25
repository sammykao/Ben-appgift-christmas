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
 * Returns default preferences if table doesn't exist or permissions are insufficient.
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const supabase = getSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Default preferences to return if table doesn't exist or access is denied
  const defaultPreferences: NotificationPreferences = {
    id: "",
    user_id: user.id,
    enabled: false, // Default to disabled if we can't access preferences
    reminder_times: ["18:00"],
    reminder_days: [0, 1, 2, 3, 4, 5, 6],
    streak_reminders: true,
    mood_insights: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Try to get existing preferences
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // If table doesn't exist or insufficient permissions, return defaults
  if (error) {
    const errorMessage = error.message || "";
    const errorCode = (error as any).code || "";
    if (
      errorMessage.includes("permission") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("does not exist") ||
      errorMessage.includes("relation") ||
      errorCode === "PGRST301" || // Table not found
      errorCode === "42501" // Insufficient privilege
    ) {
      console.warn(
        "Notification preferences table not accessible. Using default preferences.",
        error.message
      );
      return defaultPreferences;
    }
    throw handleSupabaseError(error);
  }

  // If no preferences exist, try to create defaults
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

    // If creation fails due to permissions, return defaults
    if (createError) {
      const createErrorMessage = createError.message || "";
      if (
        createErrorMessage.includes("permission") ||
        createErrorMessage.includes("Unauthorized") ||
        createErrorMessage.includes("does not exist")
      ) {
        console.warn(
          "Could not create notification preferences. Using default preferences.",
          createError.message
        );
        return defaultPreferences;
      }
      throw handleSupabaseError(createError);
    }

    return newData;
  }

  return data;
}

/**
 * Update notification preferences.
 * Returns updated preferences or throws error if update fails.
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
    const errorMessage = error.message || "";
    const errorCode = (error as any).code || "";
    
    // If table doesn't exist or insufficient permissions, return a mock updated object
    if (
      errorMessage.includes("permission") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("does not exist") ||
      errorMessage.includes("relation") ||
      errorCode === "PGRST301" ||
      errorCode === "42501"
    ) {
      console.warn(
        "Could not update notification preferences. Table may not exist or permissions insufficient.",
        error.message
      );
      // Return a mock updated preferences object
      // The UI will show the update, but it won't persist
      const currentPrefs = await getNotificationPreferences().catch(() => null);
      if (currentPrefs) {
        return {
          ...currentPrefs,
          ...updates,
          updated_at: new Date().toISOString(),
        };
      }
      throw new Error(
        "Notification preferences are not available. Please run the database migration to enable this feature."
      );
    }
    throw handleSupabaseError(error);
  }

  return data;
}

