import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import type { Profile, ProfileUpdate } from "../api/types";

interface EditProfileFormProps {
  profile: Profile | null;
  onSave: (updates: ProfileUpdate) => Promise<void>;
  onCancel: () => void;
}

const SPORTS = [
  "Soccer",
  "Basketball",
  "Baseball",
  "Football",
  "Tennis",
  "Swimming",
  "Track & Field",
  "Volleyball",
  "Golf",
  "Other",
];

const POSITIONS: Record<string, string[]> = {
  Soccer: ["Goalkeeper", "Defender", "Midfielder", "Forward"],
  Basketball: ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
  Baseball: ["Pitcher", "Catcher", "First Base", "Second Base", "Third Base", "Shortstop", "Outfield"],
  Football: ["Quarterback", "Running Back", "Wide Receiver", "Tight End", "Offensive Line", "Defensive Line", "Linebacker", "Cornerback", "Safety"],
  Tennis: ["Singles", "Doubles"],
  Swimming: ["Freestyle", "Backstroke", "Breaststroke", "Butterfly"],
  "Track & Field": ["Sprints", "Distance", "Jumps", "Throws"],
  Volleyball: ["Setter", "Outside Hitter", "Middle Blocker", "Opposite", "Libero"],
  Golf: ["Player"],
  Other: ["Player"],
};

export function EditProfileForm({ profile, onSave, onCancel }: EditProfileFormProps) {
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [selectedSport, setSelectedSport] = useState(profile?.preferred_sport || "");
  const [selectedPosition, setSelectedPosition] = useState(profile?.preferred_position || "");
  const [saving, setSaving] = useState(false);

  const availablePositions = selectedSport ? POSITIONS[selectedSport] || [] : [];

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        preferred_sport: selectedSport || null,
        preferred_position: selectedPosition || null,
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Preferred Sport</Text>
          <View style={styles.optionsContainer}>
            {SPORTS.map((sport) => (
              <TouchableOpacity
                key={sport}
                style={[
                  styles.optionButton,
                  selectedSport === sport && styles.optionButtonActive,
                ]}
                onPress={() => {
                  setSelectedSport(sport);
                  setSelectedPosition(""); // Reset position when sport changes
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedSport === sport && styles.optionTextActive,
                  ]}
                >
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedSport && availablePositions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Preferred Position</Text>
            <View style={styles.optionsContainer}>
              {availablePositions.map((position) => (
                <TouchableOpacity
                  key={position}
                  style={[
                    styles.optionButton,
                    selectedPosition === position && styles.optionButtonActive,
                  ]}
                  onPress={() => setSelectedPosition(position)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedPosition === position && styles.optionTextActive,
                    ]}
                  >
                    {position}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    fontSize: 16,
    color: "#e5e7eb",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  optionButtonActive: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9ca3af",
  },
  optionTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#1e293b",
  },
  saveButton: {
    backgroundColor: "#38bdf8",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9ca3af",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
