import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { getDailyMoodAveragesForMonth, type DailyMoodAverage } from "../src/api";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

function getMoodColor(averageMood: number | null): string {
  if (averageMood === null) return "#1e293b"; // No data - dark gray

  // Smooth gradient from red (1) -> yellow (5) -> green (10)
  // Red: rgb(220, 38, 38) at 1
  // Yellow: rgb(234, 179, 8) at 5
  // Green: rgb(34, 197, 94) at 10

  if (averageMood >= 1 && averageMood <= 5) {
    // Red to Yellow transition (1-5)
    const t = (averageMood - 1) / 4; // 0 to 1
    const r = Math.round(220 + (234 - 220) * t);
    const g = Math.round(38 + (179 - 38) * t);
    const b = Math.round(38 + (8 - 38) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to Green transition (5-10)
    const t = (averageMood - 5) / 5; // 0 to 1
    const r = Math.round(234 + (34 - 234) * t);
    const g = Math.round(179 + (197 - 179) * t);
    const b = Math.round(8 + (94 - 8) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export default function CalendarScreen() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [moodAverages, setMoodAverages] = useState<DailyMoodAverage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const calendarOpacity = useRef(new Animated.Value(0)).current;
  const calendarScale = useRef(new Animated.Value(0.95)).current;
  const dayAnimations = useRef<Animated.Value[]>([]).current;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-12

  useEffect(() => {
    const loadMoodAverages = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDailyMoodAveragesForMonth(year, month);
        setMoodAverages(data);
        
        // Reset animations
        headerOpacity.setValue(0);
        headerTranslateY.setValue(-20);
        calendarOpacity.setValue(0);
        calendarScale.setValue(0.95);
        
        // Animate header
        Animated.parallel([
          Animated.timing(headerOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(headerTranslateY, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();

        // Animate calendar grid
        Animated.parallel([
          Animated.timing(calendarOpacity, {
            toValue: 1,
            duration: 500,
            delay: 150,
            useNativeDriver: true,
          }),
          Animated.spring(calendarScale, {
            toValue: 1,
            friction: 7,
            tension: 50,
            delay: 150,
            useNativeDriver: true,
          }),
        ]).start();

        // Initialize day animations
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const totalCells = firstDay + daysInMonth;
        
        // Ensure we have enough animation values
        while (dayAnimations.length < totalCells) {
          dayAnimations.push(new Animated.Value(0));
        }
        
        // Reset all animations to 0
        dayAnimations.slice(0, totalCells).forEach((anim) => {
          anim.setValue(0);
        });

        // Stagger day animations
        const dayAnimationsToRun = dayAnimations.slice(0, totalCells);
        if (dayAnimationsToRun.length > 0) {
          Animated.stagger(
            15,
            dayAnimationsToRun.map((anim) =>
              Animated.spring(anim, {
                toValue: 1,
                friction: 6,
                tension: 50,
                useNativeDriver: true,
              })
            )
          ).start();
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load mood data");
      } finally {
        setLoading(false);
      }
    };

    loadMoodAverages();
  }, [year, month]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const getMoodForDate = (date: number): number | null => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    const found = moodAverages.find((avg) => avg.date === dateStr);
    return found?.average_mood ?? null;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  // Create calendar grid
  const calendarDays: (number | null)[] = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handleDayPress = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    router.push(`/journal?date=${dateStr}`);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.headerRow,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthName}</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator color="#38bdf8" />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <Animated.View
          style={{
            opacity: calendarOpacity,
            transform: [{ scale: calendarScale }],
          }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Day headers */}
            <Animated.View style={styles.dayHeaders}>
              {DAYS_OF_WEEK.map((day, idx) => (
                <Animated.View
                  key={day}
                  style={[
                    styles.dayHeader,
                    {
                      opacity: headerOpacity,
                      transform: [
                        {
                          translateY: headerTranslateY.interpolate({
                            inputRange: [-20, 0],
                            outputRange: [-10, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.dayHeaderText}>{day}</Text>
                </Animated.View>
              ))}
            </Animated.View>

            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => {
                const animValue = dayAnimations[index] || new Animated.Value(1);
                
                if (day === null) {
                  return (
                    <Animated.View
                      key={`empty-${index}`}
                      style={{
                        opacity: animValue,
                        transform: [
                          {
                            scale: animValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1],
                            }),
                          },
                        ],
                      }}
                    >
                      <View style={styles.dayCell} />
                    </Animated.View>
                  );
                }

                const mood = getMoodForDate(day);
                const color = getMoodColor(mood);
                const isToday =
                  day === new Date().getDate() &&
                  month === new Date().getMonth() + 1 &&
                  year === new Date().getFullYear();

                return (
                  <Animated.View
                    key={day}
                    style={{
                      opacity: animValue,
                      transform: [
                        {
                          scale: animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1],
                          }),
                        },
                      ],
                    }}
                  >
                    <TouchableOpacity
                      style={[styles.dayCell, { backgroundColor: color }]}
                      onPress={() => handleDayPress(day)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isToday && styles.todayText,
                          mood === null && styles.noDataText,
                        ]}
                      >
                        {day}
                      </Text>
                      {mood !== null && (
                        <Text style={styles.moodIndicator}>
                          {mood.toFixed(1)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 70,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  backText: {
    fontSize: 14,
    color: "#38bdf8",
    fontWeight: "600",
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  monthText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e5e7eb",
    minWidth: 180,
    textAlign: "center",
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
    flexGrow: 0,
  },
  dayHeaders: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dayCell: {
    width: "13.5%",
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#1e293b",
    minHeight: 50,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  todayText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#ffffff",
  },
  noDataText: {
    color: "#64748b",
  },
  moodIndicator: {
    fontSize: 9,
    fontWeight: "500",
    color: "#ffffff",
    marginTop: 2,
    opacity: 0.9,
  },
});

