import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { getNotificationPreferences } from "../src/api";
import { scheduleNotifications, setupNotificationListeners } from "../src/services/notifications";

function NotificationSetup() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    // Setup notification tap handler
    const cleanup = setupNotificationListeners(() => {
      router.push("/journal");
    });

    // Load and schedule notifications
    const initializeNotifications = async () => {
      try {
        const preferences = await getNotificationPreferences();
        if (preferences.enabled) {
          await scheduleNotifications(preferences);
        }
      } catch (error: any) {
        // Silently handle errors - don't crash the app
        // Common errors: permissions denied, Expo Go limitations
        if (error?.message?.includes("permission") || error?.message?.includes("Unauthorized")) {
          console.warn("Notification permissions not available:", error.message);
        } else {
          console.error("Error initializing notifications:", error);
        }
      }
    };

    initializeNotifications();

    return cleanup;
  }, [user, router]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NotificationSetup />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#020617" }
            }}
          />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


