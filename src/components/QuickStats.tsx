import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { ProfileStatsSummary } from "../api/types";

interface QuickStatsProps {
  stats: ProfileStatsSummary;
}

export function QuickStats({ stats }: QuickStatsProps) {
  const statsCards = [
    {
      label: "Total Entries",
      value: stats.totalEntries.toString(),
      icon: "📔",
    },
    {
      label: "Current Streak",
      value: `${stats.currentStreak}`,
      unit: "days",
      icon: "🔥",
    },
    {
      label: "Longest Streak",
      value: `${stats.longestStreak}`,
      unit: "days",
      icon: "⭐",
    },
    {
      label: "Avg Mood",
      value: stats.averageMood?.toFixed(1) || "—",
      unit: "/10",
      icon: "😊",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Stats</Text>
      <View style={styles.grid}>
        {statsCards.map((card, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.icon}>{card.icon}</Text>
            <Text style={styles.value}>{card.value}</Text>
            {card.unit && <Text style={styles.unit}>{card.unit}</Text>}
            <Text style={styles.label}>{card.label}</Text>
          </View>
        ))}
      </View>
      {stats.mostActiveWorkoutType && (
        <View style={styles.mostActiveContainer}>
          <Text style={styles.mostActiveLabel}>Most Active Activity</Text>
          <Text style={styles.mostActiveValue}>{stats.mostActiveWorkoutType}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 2,
  },
  unit: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
  mostActiveContainer: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
  },
  mostActiveLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
  },
  mostActiveValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#38bdf8",
  },
});

