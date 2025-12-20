/**
 * Notification service for scheduling and managing local notifications.
 * 
 * Architecture Notes:
 * - Uses Expo Notifications for local notifications
 * - Schedules notifications based on user preferences
 * - Handles permissions and notification interactions
 * - Cancels notifications when user logs entries
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import type { NotificationPreferences } from "../api/types";
import { getEntriesByDate } from "../api/journalEntries";

// Check if running in Expo Go (notifications have limited support)
const isExpoGo = Constants.executionEnvironment === "storeClient";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions from the user.
 * Returns true if granted, false otherwise.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  // Check if running in Expo Go
  if (isExpoGo) {
    console.warn(
      "Notifications have limited support in Expo Go. Please use a development build for full functionality."
    );
    return false;
  }

  if (!Device.isDevice) {
    console.warn("Notifications only work on physical devices");
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

/**
 * Check if notification permissions are granted.
 */
export async function hasNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Cancel today's reminder notifications.
 * Useful when user logs an entry.
 */
export async function cancelTodaysReminders(): Promise<void> {
  const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

  for (const notification of allNotifications) {
    const trigger = notification.trigger as Notifications.DailyTriggerInput;
    if (trigger && trigger.type === "daily") {
      // Cancel notifications scheduled for today
      // Note: This is a simplified approach - in production, you might want
      // to tag notifications with identifiers to cancel specific ones
      const notificationDate = new Date(notification.trigger as any);
      if (notificationDate.toISOString().slice(0, 10) === todayStr) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }
}

/**
 * Schedule notifications based on user preferences.
 */
export async function scheduleNotifications(
  preferences: NotificationPreferences
): Promise<void> {
  // Check if running in Expo Go
  if (isExpoGo) {
    console.warn(
      "Notifications cannot be scheduled in Expo Go. Please use a development build."
    );
    return;
  }

  // Cancel existing notifications first
  try {
    await cancelAllNotifications();
  } catch (error) {
    console.error("Error cancelling notifications:", error);
  }

  if (!preferences.enabled) {
    return;
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.warn("Notification permissions not granted");
    return;
  }

  try {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday

    // Schedule notifications for each reminder time and day
    for (const timeStr of preferences.reminder_times) {
      const [hours, minutes] = timeStr.split(":").map(Number);

      for (const day of preferences.reminder_days) {
        // Calculate next occurrence of this day/time
        const daysUntilNext = (day - currentDay + 7) % 7;
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntilNext);
        nextDate.setHours(hours, minutes, 0, 0);

        // If the time has passed today and it's the same day, schedule for next week
        if (daysUntilNext === 0 && nextDate < today) {
          nextDate.setDate(nextDate.getDate() + 7);
        }

        // Schedule the notification
        // Note: Expo uses 1-7 for weekdays (1=Sunday, 7=Saturday)
        // We use 0-6 (0=Sunday, 6=Saturday), so we need to convert
        const expoWeekday = day === 0 ? 1 : day + 1; // Sunday is 1 in Expo, 0 in our system

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Time to Journal! 📔",
            body: "Don't forget to log your activities and mood today.",
            sound: true,
            data: { type: "journal_reminder" },
          },
          trigger: {
            weekday: expoWeekday,
            hour: hours,
            minute: minutes,
            repeats: true,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error scheduling notifications:", error);
    throw error;
  }
}

/**
 * Check if user has logged an entry today.
 * Used to avoid sending reminders if they've already logged.
 */
export async function hasLoggedToday(): Promise<boolean> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const entries = await getEntriesByDate(today);
    return entries.length > 0;
  } catch (error) {
    console.error("Error checking if user logged today:", error);
    return false;
  }
}

/**
 * Setup notification listeners for handling taps.
 * Returns cleanup function.
 */
export function setupNotificationListeners(
  onNotificationTap: () => void
): () => void {
  // Check if running in Expo Go
  if (isExpoGo) {
    console.warn(
      "Notification listeners have limited support in Expo Go. Please use a development build."
    );
    // Return no-op cleanup function
    return () => {};
  }

  try {
    // Handle notification received while app is in foreground
    const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });

    // Handle notification tap
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification tapped:", response);
      onNotificationTap();
    });

    // Return cleanup function using .remove() method (new API)
    return () => {
      try {
        receivedListener.remove();
        responseListener.remove();
      } catch (error) {
        console.error("Error removing notification listeners:", error);
      }
    };
  } catch (error) {
    console.error("Error setting up notification listeners:", error);
    // Return no-op cleanup function
    return () => {};
  }
}
