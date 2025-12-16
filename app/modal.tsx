import { Stack, useRouter } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function ModalScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ presentation: "modal", title: "Modal" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Modal</Text>
        <Text style={styles.body}>
          This is a temporary modal screen to verify navigation wiring.
        </Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Close</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 24,
    paddingTop: 80
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 8
  },
  body: {
    fontSize: 16,
    color: "#9ca3af",
    marginBottom: 24
  },
  button: {
    alignSelf: "flex-start",
    backgroundColor: "#38bdf8",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  buttonText: {
    color: "#0f172a",
    fontWeight: "600"
  }
});


