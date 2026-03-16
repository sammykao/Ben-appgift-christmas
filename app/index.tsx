import { View, StyleSheet, Text, TouchableOpacity, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { LoadingScreen } from "../src/components/LoadingScreen";
import { AuthScreen } from "../src/components/AuthScreen";
import { useAuth } from "../src/contexts/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const stackOpacity = useRef(new Animated.Value(0)).current;
  const stackTranslateY = useRef(new Animated.Value(24)).current;
  const journalPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) return;

    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(stackOpacity, {
        toValue: 1,
        delay: 150,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(stackTranslateY, {
        toValue: 0,
        delay: 150,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    // Idle pulsing for primary CTA
    Animated.loop(
      Animated.sequence([
        Animated.timing(journalPulse, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(journalPulse, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [loading, logoOpacity, logoScale, stackOpacity, stackTranslateY, journalPulse]);

  // Show loading screen while checking auth state
  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Show auth screen if not authenticated
  if (!user) {
    return <AuthScreen />;
  }

  // Show main app content if authenticated
  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.stack,
          { opacity: stackOpacity, transform: [{ translateY: stackTranslateY }] },
        ]}
      >
        <Animated.Image
          source={require("../assets/images/app_logo.png")}
          style={[styles.appLogo, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}
          resizeMode="contain"
        />

        <View style={styles.lowerSection}>
          <Animated.View
            style={{
              transform: [
                {
                  scale: journalPulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.04],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              style={styles.journalButton}
              onPress={() => router.push("/journal")}
            >
              <Text style={styles.journalButtonText}>Your Journal</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.statsButton}
            onPress={() => router.push("/stats")}
          >
            <Text style={styles.statsButtonText}>Your Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.profileButtonText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push("/settings")}
          >
            <Text style={styles.settingsButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e5e7eb",
  },
  stack: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  appLogo: {
    width: 280,
    height: 280,
  },
  lowerSection: {
    marginTop: 28,
    width: "100%",
    alignItems: "center",
    gap: 22,
  },
  journalButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 36,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.26,
    shadowRadius: 10,
    elevation: 6,
  },
  journalButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  statsButton: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 36,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  statsButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1d4ed8",
    letterSpacing: 0.5,
  },
  profileButton: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 36,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  profileButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1d4ed8",
    letterSpacing: 0.5,
  },
  settingsButton: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 36,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#3b82f6",
  },
  settingsButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1d4ed8",
    letterSpacing: 0.3,
  },
});
