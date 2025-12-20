/**
 * Loading Screen Component
 * 
 * Architecture Notes:
 * - Used during app initialization and auth state checks
 * - Minimal, focused design to reduce perceived load time
 * - Consistent with app branding and dark theme
 * - Accessible with proper contrast ratios
 */

import { ActivityIndicator, StyleSheet, Text, View, Image } from "react-native";
import { StatusBar } from "expo-status-bar";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={require("../../assets/images/app_logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.subtitle}>
        {message || "Loading your mental performance space…"}
      </Text>
      <ActivityIndicator size="large" color="#38bdf8" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 17,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 24,
  },
  spinner: {
    marginTop: 8,
  },
});
