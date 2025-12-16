import { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { LoadingScreen } from "../src/components/LoadingScreen";

export default function Index() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Temporary fake loading to show the splash/loading UI.
    const timer = setTimeout(() => setIsReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to The MentalPitch</Text>
      <Text style={styles.body}>
        This is your starting point. Next up: hook this screen to your calendar
        dashboard and journaling flows.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 24,
    paddingTop: 96
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 12
  },
  body: {
    fontSize: 16,
    color: "#9ca3af"
  }
});


