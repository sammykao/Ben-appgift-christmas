import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

interface MoodScoreInputProps {
  moodScore: string;
  onMoodChange: (score: string) => void;
  isFoodType?: boolean;
}

export function MoodScoreInput({ moodScore, onMoodChange, isFoodType = false }: MoodScoreInputProps) {
  const numericScore = moodScore ? Number(moodScore) : 5;
  const displayScore = isNaN(numericScore) ? 5 : numericScore;

  const handleValueChange = (value: number) => {
    // Round to nearest integer (1-10)
    const rounded = Math.round(value);
    onMoodChange(String(rounded));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>
          {isFoodType ? "Overall mood after eating" : "Mood"}
        </Text>
        <View style={styles.scoreDisplay}>
          <Text style={styles.scoreValue}>{displayScore}</Text>
          <Text style={styles.scoreLabel}>/10</Text>
        </View>
      </View>
      <Text style={styles.helperText}>
        Drag the slider to {isFoodType ? "set" : "adjust"} your mood from 1–10.
      </Text>
      <View style={styles.sliderContainer}>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>1</Text>
          <Text style={styles.sliderLabel}>10</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={displayScore}
          onValueChange={handleValueChange}
          minimumTrackTintColor="#38bdf8"
          maximumTrackTintColor="#1e293b"
          thumbTintColor="#38bdf8"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  scoreDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "#0b1120",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#38bdf8",
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9ca3af",
    marginLeft: 2,
  },
  helperText: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 16,
  },
  sliderContainer: {
    paddingVertical: 8,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  slider: {
    width: "100%",
    height: 40,
  },
});

