import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";

interface TimeInputProps {
  timeString: string;
  amPm: "AM" | "PM";
  onTimeChange: (time: string) => void;
  onAmPmChange: (amPm: "AM" | "PM") => void;
}

export function TimeInput({ timeString, amPm, onTimeChange, onAmPmChange }: TimeInputProps) {
  const handleHourChange = (text: string) => {
    const parts = timeString.split(":");
    const hour = text.replace(/[^0-9]/g, "").slice(0, 2);
    onTimeChange(`${hour}:${parts[1] || ""}`);
  };

  const handleMinuteChange = (text: string) => {
    const parts = timeString.split(":");
    const minute = text.replace(/[^0-9]/g, "").slice(0, 2);
    onTimeChange(`${parts[0] || ""}:${minute}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Time</Text>
      <View style={styles.timeContainer}>
        <View style={styles.timeInputGroup}>
          <TextInput
            style={styles.timeInput}
            placeholder="12"
            placeholderTextColor="#64748b"
            value={timeString.split(":")[0] || ""}
            onChangeText={handleHourChange}
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={styles.timeSeparator}>:</Text>
          <TextInput
            style={styles.timeInput}
            placeholder="00"
            placeholderTextColor="#64748b"
            value={timeString.split(":")[1] || ""}
            onChangeText={handleMinuteChange}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
        <View style={styles.amPmToggle}>
          <TouchableOpacity
            style={[styles.amPmOption, amPm === "AM" && styles.amPmOptionSelected]}
            onPress={() => onAmPmChange("AM")}
          >
            <Text style={[styles.amPmText, amPm === "AM" && styles.amPmTextSelected]}>AM</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.amPmOption, amPm === "PM" && styles.amPmOptionSelected]}
            onPress={() => onAmPmChange("PM")}
          >
            <Text style={[styles.amPmText, amPm === "PM" && styles.amPmTextSelected]}>PM</Text>
          </TouchableOpacity>
        </View>
      </View>
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
});
