import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  deleteAccount,
  type NotificationPreferences,
} from "../src/api";
import { scheduleNotifications, requestNotificationPermissions } from "../src/services/notifications";
import { TimePicker } from "../src/components/TimePicker";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export default function Settings() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch (error: any) {
      console.error("Error loading preferences:", error);
      // Use default preferences as fallback instead of showing error
      // This allows the app to continue functioning
      const defaultPrefs: NotificationPreferences = {
        id: "",
        user_id: user?.id || "",
        enabled: false,
        reminder_times: ["18:00"],
        reminder_days: [0, 1, 2, 3, 4, 5, 6],
        streak_reminders: true,
        mood_insights: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setPreferences(defaultPrefs);
      
      // Only show alert for unexpected errors, not permission/table errors
      if (!error?.message?.includes("permission") && !error?.message?.includes("Unauthorized")) {
        Alert.alert(
          "Notice",
          "Notification preferences are not available. Some features may be limited."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      const updated = await updateNotificationPreferences({
        enabled: preferences.enabled,
        reminder_times: preferences.reminder_times,
        reminder_days: preferences.reminder_days,
        streak_reminders: preferences.streak_reminders,
        mood_insights: preferences.mood_insights,
      });

      setPreferences(updated);

      // Reschedule notifications
      if (updated.enabled) {
        const hasPermission = await requestNotificationPermissions();
        if (hasPermission) {
          await scheduleNotifications(updated);
          Alert.alert("Success", "Notification preferences saved!");
        } else {
          Alert.alert(
            "Permissions Required",
            "Please enable notifications in your device settings to receive reminders."
          );
        }
      } else {
        // Cancel all notifications if disabled
        const { cancelAllNotifications } = await import("../src/services/notifications");
        await cancelAllNotifications();
        Alert.alert("Success", "Notifications disabled");
      }
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      
      // Handle permission/table errors gracefully
      if (
        error?.message?.includes("permission") ||
        error?.message?.includes("Unauthorized") ||
        error?.message?.includes("does not exist") ||
        error?.message?.includes("migration")
      ) {
        Alert.alert(
          "Feature Unavailable",
          "Notification preferences require database setup. Please run the database migration (db/account-deletion-function.sql) to enable this feature. Your preferences have been saved locally but won't persist until the migration is complete."
        );
        // Still update local state so UI reflects the change
        setPreferences({
          ...preferences,
          ...preferences,
        });
      } else {
        Alert.alert("Error", error.message || "Failed to save preferences");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = (value: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, enabled: value });
  };

  const handleToggleDay = (day: number) => {
    if (!preferences) return;
    const newDays = preferences.reminder_days.includes(day)
      ? preferences.reminder_days.filter((d) => d !== day)
      : [...preferences.reminder_days, day].sort();
    setPreferences({ ...preferences, reminder_days: newDays });
  };

  const handleAddTime = () => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      reminder_times: [...preferences.reminder_times, "18:00"],
    });
  };

  const handleRemoveTime = (index: number) => {
    if (!preferences || preferences.reminder_times.length <= 1) return;
    setPreferences({
      ...preferences,
      reminder_times: preferences.reminder_times.filter((_, i) => i !== index),
    });
  };

  const handleTimeChange = (index: number, newTime: string) => {
    if (!preferences) return;
    const newTimes = [...preferences.reminder_times];
    newTimes[index] = newTime;
    setPreferences({ ...preferences, reminder_times: newTimes });
  };

  const handleLogout = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to sign out");
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone. All your data, including journal entries, stats, and preferences, will be permanently deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Second confirmation
            Alert.alert(
              "Final Confirmation",
              "This is your last chance to cancel. Your account and all data will be permanently deleted. This cannot be undone.",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Yes, Delete My Account",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await deleteAccount();
                      // Sign out after deletion
                      await signOut();
                      router.replace("/");
                      Alert.alert(
                        "Account Deleted",
                        "Your account has been successfully deleted."
                      );
                    } catch (error: any) {
                      Alert.alert(
                        "Error",
                        error.message || "Failed to delete account. Please try again or contact support."
                      );
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (loading || !preferences) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || "Not available"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <Switch
              value={preferences.enabled}
              onValueChange={handleToggleEnabled}
              trackColor={{ false: "#1e293b", true: "#38bdf8" }}
              thumbColor="#ffffff"
            />
          </View>

          {preferences.enabled && (
            <>
              <View style={styles.settingCard}>
                <Text style={styles.settingLabel}>Reminder Times</Text>
                <Text style={styles.settingDescription}>
                  Get reminders at these times each day
                </Text>
                {preferences.reminder_times.map((time, index) => (
                  <View key={index} style={styles.timeRow}>
                    <TimePicker
                      time={time}
                      onTimeChange={(newTime) => handleTimeChange(index, newTime)}
                    />
                    {preferences.reminder_times.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveTime(index)}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity style={styles.addButton} onPress={handleAddTime}>
                  <Text style={styles.addButtonText}>+ Add Time</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.settingCard}>
                <Text style={styles.settingLabel}>Reminder Days</Text>
                <Text style={styles.settingDescription}>
                  Select which days to receive reminders
                </Text>
                <View style={styles.daysContainer}>
                  {DAYS_OF_WEEK.map((day) => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.dayButton,
                        preferences.reminder_days.includes(day.value) &&
                          styles.dayButtonActive,
                      ]}
                      onPress={() => handleToggleDay(day.value)}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          preferences.reminder_days.includes(day.value) &&
                            styles.dayButtonTextActive,
                        ]}
                      >
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.settingCard}>
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.settingLabel}>Streak Reminders</Text>
                    <Text style={styles.settingDescription}>
                      Get reminders when your streak is at risk
                    </Text>
                  </View>
                  <Switch
                    value={preferences.streak_reminders}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, streak_reminders: value })
                    }
                    trackColor={{ false: "#1e293b", true: "#38bdf8" }}
                    thumbColor="#ffffff"
                  />
                </View>
              </View>

              <View style={styles.settingCard}>
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.settingLabel}>Mood Insights</Text>
                    <Text style={styles.settingDescription}>
                      Receive notifications with mood insights
                    </Text>
                  </View>
                  <Switch
                    value={preferences.mood_insights}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, mood_insights: value })
                    }
                    trackColor={{ false: "#1e293b", true: "#38bdf8" }}
                    thumbColor="#ffffff"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? "Saving..." : "Save Notification Settings"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
          </TouchableOpacity>
          <Text style={styles.deleteAccountWarning}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#e5e7eb",
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  infoLabel: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#e5e7eb",
  },
  settingCard: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#38bdf8",
    borderStyle: "dashed",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#38bdf8",
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#1e293b",
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f97373",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  dayButtonActive: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
  },
  dayButtonTextActive: {
    color: "#ffffff",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  saveButton: {
    backgroundColor: "#38bdf8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  deleteAccountButton: {
    backgroundColor: "#991b1b",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dc2626",
    marginBottom: 8,
  },
  deleteAccountButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  deleteAccountWarning: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 16,
  },
});
