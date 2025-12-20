import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { Profile } from "../api/types";

interface SportPreferencesProps {
  profile: Profile | null;
  editable?: boolean;
  onEdit?: () => void;
}

export function SportPreferences({ profile, editable = false, onEdit }: SportPreferencesProps) {
  const sport = profile?.preferred_sport || "Not set";
  const position = profile?.preferred_position || "Not set";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sport Preferences</Text>
        {editable && onEdit && (
          <Text style={styles.editLink} onPress={onEdit}>
            Edit
          </Text>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.item}>
          <Text style={styles.label}>Preferred Sport</Text>
          <Text style={styles.value}>{sport}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Preferred Position</Text>
          <Text style={styles.value}>{position}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  editLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#38bdf8",
  },
  content: {
    gap: 12,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#9ca3af",
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#e5e7eb",
  },
});
