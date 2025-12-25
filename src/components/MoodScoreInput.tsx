import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

interface MoodScoreInputProps {
  moodScore: string;
  onMoodChange: (score: string) => void;
  isFoodType?: boolean;
}

export function MoodScoreInput({ moodScore, onMoodChange, isFoodType = false }: MoodScoreInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {isFoodType ? "Overall mood after eating" : "Mood"}
      </Text>
      <Text style={styles.helperText}>
        Tap a number from 1–10 to {isFoodType ? "set" : "adjust"} your mood.
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => {
          const selected = Number(moodScore) === value;
          return (
            <TouchableOpacity
              key={value}
              style={[styles.moodOption, selected && styles.moodOptionSelected]}
              onPress={() => onMoodChange(String(value))}
            >
              <Text
                style={[styles.moodOptionText, selected && styles.moodOptionTextSelected]}
              >
                {value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 12,
  },
  helperText: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 8,
  },
  scrollContent: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  moodOption: {
    minWidth: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020617",
  },
  moodOptionSelected: {
    borderColor: "#38bdf8",
    backgroundColor: "#0b1120",
  },
  moodOptionText: {
    fontSize: 16,
    color: "#9ca3af",
    fontWeight: "500",
  },
  moodOptionTextSelected: {
    color: "#e5e7eb",
    fontWeight: "700",
  },
});

