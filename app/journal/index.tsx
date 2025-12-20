import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { getEntriesByDate, type JournalEntry } from "../../src/api";

function formatDateHeading(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeString: string | null): string {
  if (!timeString) return "Time not set";

  // Accept values like "HH:MM", "HH:MM:SS", or "HH:MM:SS+TZ"
  const match = timeString.match(/(\d{2}):(\d{2})/);
  if (!match) return "Time not set";

  const [, hh, mm] = match;
  const hour24 = Number(hh);
  if (Number.isNaN(hour24)) return "Time not set";

  const isAM = hour24 < 12;
  const hour12 = ((hour24 + 11) % 12) + 1; // 0 -> 12, 13 -> 1, etc.

  return `${hour12}:${mm} ${isAM ? "AM" : "PM"}`;
}

export default function JournalScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use provided date or default to today
  const targetDate = date ? new Date(date) : new Date();
  const isoDate = targetDate.toISOString().slice(0, 10); // YYYY-MM-DD

  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEntriesByDate(isoDate);
        setEntries(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load entries");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadEntries();
    }
  }, [user, isoDate]);

  const renderItem = ({ item }: { item: JournalEntry }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/journal/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title || "Untitled session"}</Text>
          {item.mood_score != null && (
            <View style={styles.moodPill}>
              <Text style={styles.moodLabel}>Mood</Text>
              <Text style={styles.moodValue}>{item.mood_score}/10</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardMeta}>{formatTime(item.entry_time)}</Text>
        {item.notes ? (
          <Text style={styles.cardNotes} numberOfLines={2}>
            {item.notes}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrapper}>
          <Text style={styles.heading}>Your Journal</Text>
          <Text style={styles.subheading}>{formatDateHeading(targetDate)}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/")} style={styles.homeButton}>
          <Text style={styles.homeButtonText}>Home</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator color="#38bdf8" />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.placeholderWrapper}>
          <Text style={styles.placeholderTitle}>
            {date ? "No entries yet for this date" : "No entries yet for today"}
          </Text>
          <Text style={styles.placeholderBody}>
            Capture how you feel, what you trained, or how you played by creating your first
            journal entry.
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={styles.bottomIconButton}
          onPress={() => router.push("/")}
        >
          <View style={styles.homeIcon}>
            <View style={styles.homeIconRoof} />
            <View style={styles.homeIconBase} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomIconButton}
          onPress={() => router.push(`/journal/new${date ? `?date=${date}` : ""}`)}
        >
          <Text style={styles.bottomIconText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomIconButton}
          onPress={() => router.push("/calendar")}
        >
          <View style={styles.calendarInner}>
            <View style={styles.calendarHeader} />
            <View style={styles.calendarBody} />
          </View>
        </TouchableOpacity>
      </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTextWrapper: {
    flexShrink: 1,
    flex: 1,
  },
  heading: {
    fontSize: 32,
    fontWeight: "700",
    color: "#e5e7eb",
    letterSpacing: -0.5,
  },
  subheading: {
    marginTop: 4,
    fontSize: 18,
    color: "#9ca3af",
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
  placeholderWrapper: {
    paddingTop: 48,
    paddingHorizontal: 8,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 8,
  },
  placeholderBody: {
    fontSize: 16,
    color: "#9ca3af",
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 48,
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
    flexShrink: 1,
    marginRight: 8,
  },
  cardMeta: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 4,
  },
  cardNotes: {
    fontSize: 13,
    color: "#cbd5f5",
  },
  moodPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#0b1120",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#38bdf8",
  },
  moodLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginRight: 4,
  },
  moodValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  bottomIconButton: {
    width: 64,
    height: 64,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#38bdf8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020617",
  },
  bottomIconText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  calendarInner: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#38bdf8",
    overflow: "hidden",
  },
  calendarHeader: {
    height: 10,
    backgroundColor: "#38bdf8",
  },
  calendarBody: {
    flex: 1,
    backgroundColor: "#020617",
  },
  homeIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  homeIconRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#38bdf8",
    marginBottom: -2,
  },
  homeIconBase: {
    width: 16,
    height: 10,
    backgroundColor: "#38bdf8",
    borderRadius: 1,
  },
});
