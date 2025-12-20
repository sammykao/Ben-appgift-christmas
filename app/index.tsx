import { View, StyleSheet, Text, Image, TouchableOpacity, Animated } from "react-native";
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
  const sponsorPulse = useRef(new Animated.Value(0)).current;

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

    // Idle pulsing for primary CTA and sponsor logo
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

    Animated.loop(
      Animated.sequence([
        Animated.timing(sponsorPulse, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(sponsorPulse, {
          toValue: 0,
          duration: 2600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [loading, logoOpacity, logoScale, stackOpacity, stackTranslateY, journalPulse, sponsorPulse]);

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
            style={[
              styles.sponsorContainer,
              {
                opacity: sponsorPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                }),
              },
            ]}
          >
            <Image
              source={require("../assets/images/company_logo.png")}
              style={styles.sponsorLogo}
              resizeMode="contain"
            />
          </Animated.View>

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
    backgroundColor: "#020617",
  },
  stack: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  appLogo: {
    width: 220,
    height: 220,
  },
  lowerSection: {
    marginTop: 40,
    width: "100%",
    alignItems: "center",
    gap: 32,
  },
  journalButton: {
    backgroundColor: "#38bdf8",
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  journalButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#020617",
    letterSpacing: 0.5,
  },
  sponsorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  sponsorLogo: {
    width: 200,
    height: 80,
    opacity: 0.8,
  },
  statsButton: {
    backgroundColor: "#0f172a",
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#38bdf8",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statsButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#38bdf8",
    letterSpacing: 0.5,
  },
  profileButton: {
    backgroundColor: "#0f172a",
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#38bdf8",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  profileButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#38bdf8",
    letterSpacing: 0.5,
  },
  settingsButton: {
    backgroundColor: "#020617",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#475569",
  },
  settingsButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#e5e7eb",
    letterSpacing: 0.3,
  },
});
