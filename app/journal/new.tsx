import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  getWorkoutTypes,
  getQuestionsByWorkoutType,
  createEntry,
  createAnswers,
  updateEntry,
  createMeals,
  type WorkoutType,
  type JournalQuestion,
  type MealType,
} from "../../src/api";
import { TimeInput } from "../../src/components/TimeInput";
import { MoodScoreInput } from "../../src/components/MoodScoreInput";
import { QuestionsSection } from "../../src/components/QuestionsSection";
import { normalizeTime, validateMoodScore } from "../../src/utils/timeValidation";

export default function NewJournalEntryScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"type" | "questions">("type");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([]);
  const [selectedType, setSelectedType] = useState<WorkoutType | null>(null);
  const [questions, setQuestions] = useState<JournalQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [moodScore, setMoodScore] = useState<string>("");
  const [amPm, setAmPm] = useState<"AM" | "PM">("AM");
  const [timeString, setTimeString] = useState<string>("");
  const [meals, setMeals] = useState<
    Record<MealType, { food: string; feeling: string }>
  >({
    Breakfast: { food: "", feeling: "" },
    Lunch: { food: "", feeling: "" },
    Snack: { food: "", feeling: "" },
    Dinner: { food: "", feeling: "" },
  });

  useEffect(() => {
    const loadTypes = async () => {
      try {
        setLoading(true);
        const types = await getWorkoutTypes();
        // Only show system defaults for now to keep list concise
        const systemTypes = types.filter((t) => t.is_system_default);
        setWorkoutTypes(systemTypes);
      } catch (err: any) {
        Alert.alert("Error", err?.message || "Failed to load workout types");
      } finally {
        setLoading(false);
      }
    };

    loadTypes();
  }, []);

  const handleSelectType = async (type: WorkoutType) => {
    try {
      setSelectedType(type);
      setLoading(true);

      const isFood =
        type.name.toLowerCase().includes("food") ||
        type.name.toLowerCase().includes("nutrition");

      if (isFood) {
        // Food entries use the dedicated Food UI, not generic questions
        setQuestions([]);
        setAnswers({});
        setMeals({
          Breakfast: { food: "", feeling: "" },
          Lunch: { food: "", feeling: "" },
          Snack: { food: "", feeling: "" },
          Dinner: { food: "", feeling: "" },
        });
        setStep("questions");
        return;
      }

      const qs = await getQuestionsByWorkoutType(type.id);
      setQuestions(qs);
      // Initialize answers map (non-food)
      const initial: Record<string, string> = {};
      qs.forEach((q) => {
        initial[q.id] = "";
      });
      setAnswers(initial);
      setStep("questions");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedType) return;
    try {
      setSaving(true);

      // Validate and normalize time
      const normalizedTime = normalizeTime(timeString, amPm);
      if (!normalizedTime) {
        Alert.alert("Error", "Please enter a valid time (hour: 1-12, minute: 0-59).");
        setSaving(false);
        return;
      }

      // Validate mood score
      const numericMood = validateMoodScore(moodScore);
      if (numericMood === null) {
        Alert.alert("Error", "Please enter your mood score (1–10) before saving.");
        setSaving(false);
        return;
      }

      // Use provided date or default to today
      const targetDate = date ? new Date(date) : new Date();
      const isoDate = targetDate.toISOString().slice(0, 10);

      const entry = await createEntry({
        workout_type_id: selectedType.id,
        entry_date: isoDate,
        title: selectedType.name,
        entry_time: normalizedTime,
      });

      if (isFoodType) {
        // Save meals for Food entry
        const mealInputs = (["Breakfast", "Lunch", "Snack", "Dinner"] as MealType[])
          .map((mealType) => ({
            mealType,
            fields: meals[mealType],
          }))
          .filter(
            ({ fields }) =>
              fields.food.trim().length > 0 || fields.feeling.trim().length > 0
          )
          .map(({ mealType, fields }) => ({
            entry_id: entry.id,
            meal_type: mealType,
            time_of_day: normalizedTime,
            food_items: fields.food.trim() || "(unspecified)",
            feeling_notes: fields.feeling.trim() || null,
          }));

        if (mealInputs.length > 0) {
          await createMeals(mealInputs);
        }
      } else {
        // Save question answers for non-food entries
        const nonEmptyAnswers = questions
          .map((q) => ({
            question_id: q.id,
            text: (answers[q.id] || "").trim(),
          }))
          .filter((a) => a.text.length > 0);

        if (nonEmptyAnswers.length > 0) {
          await createAnswers(
            nonEmptyAnswers.map((a) => ({
              entry_id: entry.id,
              question_id: a.question_id,
              answer_text: a.text,
            }))
          );
        }
      }

      await updateEntry(entry.id, { mood_score: numericMood });

      Alert.alert("Saved", "Your new entry has been created.");
      router.replace("/journal");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to create entry");
    } finally {
      setSaving(false);
    }
  };

  const isFoodType =
    selectedType && selectedType.name.toLowerCase().includes("food");

  if (loading && step === "type") {
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
          <Text style={styles.heading}>New Entry</Text>
          <Text style={styles.subheading}>
            {step === "type" ? "Choose a session type" : selectedType?.name}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {step === "questions" && (
        <Text style={styles.helperText}>
          {isFoodType
            ? "Use these prompts to log what you ate and how it made you feel. You don’t have to answer every question."
            : "Answer as many prompts as you like — you don’t need to fill out every question."}
        </Text>
      )}

      {step === "type" ? (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
        >
          {workoutTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={styles.typeCard}
              onPress={() => handleSelectType(type)}
            >
              <Text style={styles.typeName}>{type.name}</Text>
              {type.description ? (
                <Text style={styles.typeDescription}>{type.description}</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
        ) : (
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
              isFoodType={isFoodType}
            />

          {isFoodType ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meals</Text>
              <Text style={styles.mealsHelperText}>
                Use the cards below to log what you ate for each meal and how it
                made you feel.
              </Text>

              {(["Breakfast", "Lunch", "Snack", "Dinner"] as MealType[]).map(
                (mealType) => (
                  <View key={mealType} style={styles.mealCard}>
                    <View style={styles.mealHeader}>
                      <Text style={styles.mealTitle}>{mealType}</Text>
                      <Text style={styles.mealPlus}>+</Text>
                    </View>
                    <TextInput
                      style={styles.mealFoodInput}
                      multiline
                      placeholder="What did you eat?"
                      placeholderTextColor="#64748b"
                      value={meals[mealType].food}
                      onChangeText={(text) =>
                        setMeals((prev) => ({
                          ...prev,
                          [mealType]: { ...prev[mealType], food: text },
                        }))
                      }
                    />
                    <TextInput
                      style={styles.mealFeelingInput}
                      multiline
                      placeholder="How did it make you feel? (optional)"
                      placeholderTextColor="#64748b"
                      value={meals[mealType].feeling}
                      onChangeText={(text) =>
                        setMeals((prev) => ({
                          ...prev,
                          [mealType]: { ...prev[mealType], feeling: text },
                        }))
                      }
                    />
                  </View>
                )
              )}
            </View>
          ) : (
            <QuestionsSection
              questions={questions}
              answers={answers}
              onAnswerChange={(questionId, text) =>
                setAnswers((prev) => ({
                  ...prev,
                  [questionId]: text,
                }))
              }
            />
          )}
          </ScrollView>
        )}

        {step === "questions" && (
          <>
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Entry"}</Text>
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
          </>
        )}
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
    fontSize: 24,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  subheading: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  backText: {
    fontSize: 14,
    color: "#38bdf8",
    fontWeight: "600",
  },
  helperText: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  typeCard: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  typeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 13,
    color: "#9ca3af",
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
  moodScrollContent: {
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
  mealsHelperText: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 12,
  },
  mealCard: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  mealPlus: {
    fontSize: 18,
    fontWeight: "700",
    color: "#38bdf8",
  },
  mealFoodInput: {
    backgroundColor: "#020617",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#e5e7eb",
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 8,
  },
  mealFeelingInput: {
    backgroundColor: "#020617",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#e5e7eb",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  footer: {
    paddingVertical: 16,
    paddingBottom: 24,
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
