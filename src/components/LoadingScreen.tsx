import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>The MentalPitch</Text>
      <Text style={styles.subtitle}>Loading your mental performance space…</Text>
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
    paddingHorizontal: 24
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center"
  },
  spinner: {
    marginTop: 24
  }
});


