import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { getStats, type StatsPeriod, type StatsData } from "../src/api";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function SimpleMoodChart({ data }: { data: { date: string; averageMood: number | null }[] }) {
  if (data.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartPlaceholder}>No mood data available</Text>
      </View>
    );
  }

  const validData = data.filter((d) => d.averageMood !== null);
  if (validData.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartPlaceholder}>No mood scores recorded</Text>
      </View>
    );
  }

  const maxMood = 10;
  const minMood = 1;
  const chartHeight = 120;
  const barWidth = Math.max(20, Math.min(60, 300 / validData.length));

  return (
    <View style={styles.chartContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chart}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <Text style={styles.yAxisLabel}>10</Text>
            <Text style={styles.yAxisLabel}>5</Text>
            <Text style={styles.yAxisLabel}>1</Text>
          </View>

          {/* Chart area with bars */}
          <View style={styles.chartArea}>
            {/* Grid lines */}
            <View style={styles.gridLine} />
            <View style={[styles.gridLine, { top: chartHeight / 2 }]} />
            <View style={[styles.gridLine, { top: chartHeight }]} />

            {/* Bars */}
            <View style={styles.barsContainer}>
              {validData.map((point, index) => {
                const mood = point.averageMood!;
                const barHeight = ((mood - minMood) / (maxMood - minMood)) * chartHeight;

                return (
                  <View key={point.date} style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          width: barWidth - 4,
                        },
                      ]}
                    />
                    <Text style={styles.barValue}>{mood.toFixed(1)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* X-axis labels */}
      <View style={styles.xAxis}>
        {validData.length <= 7
          ? validData.map((point) => (
              <Text key={point.date} style={styles.xAxisLabel}>
                {formatDate(point.date)}
              </Text>
            ))
          : [
              validData[0],
              validData[Math.floor(validData.length / 2)],
              validData[validData.length - 1],
            ].map((point) => (
              <Text key={point.date} style={styles.xAxisLabel}>
                {formatDate(point.date)}
              </Text>
            ))}
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<StatsPeriod>("month");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getStats(period);
        setStats(data);

        // Animate content
        fadeAnim.setValue(0);
        slideAnim.setValue(20);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (err: any) {
        setError(err?.message || "Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [period]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Stats</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator color="#38bdf8" size="large" />
        </View>
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Stats</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || "Failed to load statistics"}</Text>
        </View>
      </View>
    );
  }

  const getTrendEmoji = (trend: string) => {
    switch (trend) {
      case "improving":
        return "📈";
      case "declining":
        return "📉";
      default:
        return "➡️";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Stats</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(["week", "month", "year"] as StatsPeriod[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p && styles.periodButtonActive]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[styles.periodButtonText, period === p && styles.periodButtonTextActive]}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Current Streak</Text>
              <Text style={styles.summaryCardValue}>
                {stats.summary.streakData.currentStreak}
              </Text>
              <Text style={styles.summaryCardUnit}>days</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Average Mood</Text>
              <Text style={styles.summaryCardValue}>
                {stats.summary.averageMood?.toFixed(1) ?? "—"}
              </Text>
              <Text style={styles.summaryCardUnit}>/ 10</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Total Entries</Text>
              <Text style={styles.summaryCardValue}>{stats.summary.totalEntries}</Text>
              <Text style={styles.summaryCardUnit}>
                {stats.summary.mostActiveWorkoutType
                  ? stats.summary.mostActiveWorkoutType
                  : "entries"}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Mood Trend</Text>
              <Text style={styles.summaryCardValue}>
                {getTrendEmoji(stats.summary.moodTrend)}
              </Text>
              <Text style={styles.summaryCardUnit}>
                {stats.summary.moodTrend.charAt(0).toUpperCase() +
                  stats.summary.moodTrend.slice(1)}
              </Text>
            </View>
          </View>

          {/* Mood Trend Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mood Trend</Text>
            <SimpleMoodChart data={stats.moodTrends} />
          </View>

          {/* Activity Breakdown */}
          {stats.workoutTypeDistribution.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activity Breakdown</Text>
              {stats.workoutTypeDistribution.map((workout) => (
                <View key={workout.workoutTypeId} style={styles.activityRow}>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityName}>{workout.workoutTypeName}</Text>
                    <Text style={styles.activityStats}>
                      {workout.entryCount} entries
                      {workout.averageMood !== null
                        ? ` • Avg mood: ${workout.averageMood.toFixed(1)}/10`
                        : ""}
                    </Text>
                  </View>
                  <View style={styles.activityBarContainer}>
                    <View
                      style={[
                        styles.activityBar,
                        { width: `${workout.percentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.activityPercentage}>
                    {workout.percentage.toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Insights */}
          {stats.insights.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Insights</Text>
              {stats.insights.map((insight, index) => (
                <View key={index} style={styles.insightCard}>
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Time Patterns */}
          {stats.timePatterns.some((tp) => tp.entryCount > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Time Patterns</Text>
              <View style={styles.timePatternGrid}>
                {stats.timePatterns
                  .filter((tp) => tp.entryCount > 0)
                  .map((pattern) => (
                    <View key={pattern.timeOfDay} style={styles.timePatternCard}>
                      <Text style={styles.timePatternLabel}>
                        {pattern.timeOfDay.charAt(0).toUpperCase() +
                          pattern.timeOfDay.slice(1)}
                      </Text>
                      <Text style={styles.timePatternValue}>
                        {pattern.averageMood?.toFixed(1) ?? "—"}
                      </Text>
                      <Text style={styles.timePatternCount}>
                        {pattern.entryCount} {pattern.entryCount === 1 ? "entry" : "entries"}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#e5e7eb",
    letterSpacing: -0.5,
  },
  backText: {
    fontSize: 14,
    color: "#38bdf8",
    fontWeight: "600",
  },
  periodSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: "#0b1120",
    borderColor: "#38bdf8",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9ca3af",
  },
  periodButtonTextActive: {
    color: "#38bdf8",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#f97373",
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
  },
  summaryCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryCardValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 4,
  },
  summaryCardUnit: {
    fontSize: 11,
    color: "#64748b",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  chart: {
    height: 140,
    flexDirection: "row",
    minWidth: 300,
  },
  yAxis: {
    width: 30,
    height: 120,
    justifyContent: "space-between",
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "500",
  },
  chartArea: {
    flex: 1,
    height: 120,
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#1e293b",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
    paddingHorizontal: 4,
    gap: 4,
  },
  barWrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 120,
  },
  bar: {
    backgroundColor: "#38bdf8",
    borderRadius: 4,
    marginBottom: 4,
  },
  barValue: {
    fontSize: 9,
    color: "#9ca3af",
    fontWeight: "500",
  },
  chartPlaceholder: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
    paddingVertical: 40,
  },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 30,
  },
  xAxisLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  activityInfo: {
    flex: 1,
    minWidth: 120,
  },
  activityName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 4,
  },
  activityStats: {
    fontSize: 12,
    color: "#9ca3af",
  },
  activityBarContainer: {
    flex: 2,
    height: 8,
    backgroundColor: "#1e293b",
    borderRadius: 4,
    overflow: "hidden",
  },
  activityBar: {
    height: "100%",
    backgroundColor: "#38bdf8",
    borderRadius: 4,
  },
  activityPercentage: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    minWidth: 40,
    textAlign: "right",
  },
  insightCard: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    borderLeftWidth: 3,
    borderLeftColor: "#38bdf8",
  },
  insightText: {
    fontSize: 14,
    color: "#e5e7eb",
    lineHeight: 20,
  },
  timePatternGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timePatternCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
  },
  timePatternLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  timePatternValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#38bdf8",
    marginBottom: 4,
  },
  timePatternCount: {
    fontSize: 11,
    color: "#64748b",
  },
});

