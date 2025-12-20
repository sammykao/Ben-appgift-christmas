import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  getEntryWithAnswers,
  updateEntry,
  updateAnswer,
  getQuestionsByWorkoutType,
  createAnswers,
  deleteEntry,
  type JournalEntryWithAnswers,
  type JournalQuestion,
} from "../../src/api";
import { TimeInput } from "../../src/components/TimeInput";
import { MoodScoreInput } from "../../src/components/MoodScoreInput";
import { QuestionsSection } from "../../src/components/QuestionsSection";
import { normalizeTime, validateMoodScore } from "../../src/utils/timeValidation";

function formatEntryDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function JournalEntryDetail() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [entry, setEntry] = useState<JournalEntryWithAnswers | null>(null);
  const [questions, setQuestions] = useState<JournalQuestion[]>([]);
  const [answerTexts, setAnswerTexts] = useState<Record<string, string>>({});
  const [moodScore, setMoodScore] = useState<string>("");
  const [timeString, setTimeString] = useState<string>("");
  const [amPm, setAmPm] = useState<"AM" | "PM">("AM");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!entryId) return;

        // Load entry + answers
        const data = await getEntryWithAnswers(entryId as string);
        setEntry(data);
        setMoodScore(data.mood_score != null ? String(data.mood_score) : "");

        // Initialize time + AM/PM from stored 24h time
        if (data.entry_time) {
          const match = data.entry_time.match(/(\d{2}):(\d{2})/);
          if (match) {
            let hour24 = Number(match[1]);
            const minute = match[2];
            const isAM = hour24 < 12;
            const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
            setTimeString(`${String(hour12)}:${minute}`);
            setAmPm(isAM ? "AM" : "PM");
          }
        }

        // Load questions for this workout type so UI matches new-entry screen
        let qs: JournalQuestion[] = [];
        if (data.workout_type_id) {
          qs = await getQuestionsByWorkoutType(data.workout_type_id);
        }
        setQuestions(qs);

        // Build initial answer text map for all questions
        const initial: Record<string, string> = {};
        qs.forEach((q) => {
          initial[q.id] = "";
        });
        for (const ans of data.answers) {
          if (ans.question_id in initial) {
            initial[ans.question_id] = ans.answer_text ?? "";
          }
        }
        setAnswerTexts(initial);
      } catch (err: any) {
        Alert.alert("Error", err?.message || "Failed to load entry");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [entryId]);

  const handleSave = async () => {
    if (!entry) return;
    try {
      setSaving(true);

      // Validate and normalize time
      const normalizedTime = normalizeTime(timeString, amPm);
      if (!normalizedTime) {
        Alert.alert("Error", "Please enter a valid time (hour: 1-12, minute: 0-59).");
        setSaving(false);
        return;
      }

      // Validate mood
      const numericMood = validateMoodScore(moodScore);
      if (numericMood === null) {
        Alert.alert("Error", "Mood score must be a number between 1 and 10");
        setSaving(false);
        return;
      }

      await updateEntry(entry.id, {
        entry_time: normalizedTime,
        mood_score: numericMood ?? null,
      });

      // Sync answers: update existing answers and create new ones for questions
      if (questions.length > 0) {
        const existingByQuestion = new Map(
          entry.answers.map((a) => [a.question_id, a])
        );

        const updatePromises: Promise<unknown>[] = [];
        for (const q of questions) {
          const newText = (answerTexts[q.id] ?? "").trim();
          const existingAnswer = existingByQuestion.get(q.id);

          if (existingAnswer) {
            // Update existing answer
            if (newText !== (existingAnswer.answer_text ?? "").trim()) {
              updatePromises.push(
                updateAnswer(existingAnswer.id, {
                  answer_text: newText || null,
                })
              );
            }
          } else if (newText) {
            // Create new answer if text is provided for a previously unanswered question
            updatePromises.push(
              createAnswers([{
                entry_id: entry.id,
                question_id: q.id,
                answer_text: newText,
              }])
            );
          }
        }

        if (updatePromises.length > 0) {
          await Promise.all(updatePromises);
        }
      }

      Alert.alert("Saved", "Your updates have been saved.");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!entry) return;
    
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteEntry(entry.id);
              Alert.alert("Deleted", "Entry has been deleted.");
              router.replace("/journal");
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Failed to delete entry");
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !entry) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#38bdf8" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.heading}>{entry.title || "Journal Entry"}</Text>
            <Text style={styles.subheading}>{formatEntryDate(entry.entry_date)}</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        >
          <TimeInput
            timeString={timeString}
            amPm={amPm}
            onTimeChange={setTimeString}
            onAmPmChange={setAmPm}
          />

          <MoodScoreInput
            moodScore={moodScore}
            onMoodChange={setMoodScore}
          />

          <QuestionsSection
            questions={questions}
            answers={answerTexts}
            onAnswerChange={(questionId, text) =>
              setAnswerTexts((prev) => ({
                ...prev,
                [questionId]: text,
              }))
            }
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
            onPress={handleDelete}
            disabled={deleting || saving}
          >
            <Text style={styles.deleteButtonText}>
              {deleting ? "Deleting..." : "Delete Entry"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving || deleting}
          >
            <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Changes"}</Text>
          </TouchableOpacity>
        </View>
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
            onPress={() => router.push("/calendar")}
          >
            <View style={styles.calendarInner}>
              <View style={styles.calendarHeader} />
              <View style={styles.calendarBody} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerText: {
    flexShrink: 1,
    flex: 1,
    paddingRight: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#e5e7eb",
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4,
  },
  backText: {
    fontSize: 14,
    color: "#38bdf8",
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  timeInputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 4,
  },
  timeInput: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e5e7eb",
    textAlign: "center",
    minWidth: 40,
    paddingVertical: 4,
  },
  timeSeparator: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
  },
  amPmToggle: {
    flexDirection: "row",
    backgroundColor: "#020617",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
  },
  amPmOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  amPmOptionSelected: {
    backgroundColor: "#0b1120",
    borderColor: "#38bdf8",
  },
  amPmText: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "500",
  },
  amPmTextSelected: {
    color: "#e5e7eb",
    fontWeight: "700",
  },
  moodHelperText: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 8,
  },
  moodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  moodOption: {
    minWidth: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginRight: 8,
    marginBottom: 8,
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
  qaCard: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  questionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 8,
  },
  answerInput: {
    backgroundColor: "#020617",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: "#e5e7eb",
    borderWidth: 1,
    borderColor: "#1e293b",
    minHeight: 60,
    textAlignVertical: "top",
  },
  footer: {
    paddingVertical: 16,
    paddingBottom: 24,
    gap: 12,
  },
  deleteButton: {
    backgroundColor: "#020617",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ef4444",
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ef4444",
  },
  saveButton: {
    backgroundColor: "#38bdf8",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#020617",
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingVertical: 12,
    paddingBottom: 20,
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
