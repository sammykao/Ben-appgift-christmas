import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import type { JournalQuestion } from "../api";

interface QuestionsSectionProps {
  questions: JournalQuestion[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, text: string) => void;
}

export function QuestionsSection({
  questions,
  answers,
  onAnswerChange,
}: QuestionsSectionProps) {
  if (questions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Questions</Text>
      {questions.map((q) => (
        <View key={q.id} style={styles.qaCard}>
          <Text style={styles.questionText}>{q.prompt}</Text>
          <TextInput
            style={styles.answerInput}
            multiline
            placeholder={q.help_text || "Write your answer..."}
            placeholderTextColor="#64748b"
            value={answers[q.id] ?? ""}
            onChangeText={(text) => onAnswerChange(q.id, text)}
          />
        </View>
      ))}
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
  scrollHint: {
    fontSize: 13,
    color: "#64748b",
    fontStyle: "italic",
    marginBottom: 16,
    textAlign: "center",
  },
  qaCard: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
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
});

