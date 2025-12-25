import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { getProfile, updateProfile, upsertProfile, getProfileStatsSummary } from "../src/api";
import type { Profile, ProfileUpdate } from "../src/api/types";
import { ProfileHeader } from "../src/components/ProfileHeader";
import { SportPreferences } from "../src/components/SportPreferences";
import { QuickStats } from "../src/components/QuickStats";
import { EditProfileForm } from "../src/components/EditProfileForm";

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        getProfile(),
        getProfileStatsSummary(),
      ]);

      // Create profile if it doesn't exist
      if (!profileData && user) {
        const newProfile = await upsertProfile({
          id: user.id,
          first_name: null,
          last_name: null,
          preferred_sport: null,
          preferred_position: null,
        });
        setProfile(newProfile);
      } else {
        setProfile(profileData);
      }

      setStats(statsData);

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
    } catch (error: any) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updates: ProfileUpdate) => {
    try {
      setSaving(true);
      const updated = await updateProfile(updates);
      setProfile(updated);
      setEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      throw error; // Let EditProfileForm handle the error
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator color="#38bdf8" size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        {!editing && (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )}
        {editing && <View style={styles.headerSpacer} />}
      </View>

      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {editing ? (
            <EditProfileForm
              profile={profile}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              <ProfileHeader profile={profile} email={user?.email} />

              <SportPreferences profile={profile} />

              {stats && <QuickStats stats={stats} />}

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push("/stats")}
                >
                  <Text style={styles.actionButtonText}>View Full Stats</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.settingsButton]}
                  onPress={() => router.push("/settings")}
                >
                  <Text style={styles.actionButtonText}>Settings</Text>
                </TouchableOpacity>
              </View>
            </>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#e5e7eb",
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 50,
  },
  backText: {
    fontSize: 14,
    color: "#38bdf8",
    fontWeight: "600",
  },
  editText: {
    fontSize: 14,
    color: "#38bdf8",
    fontWeight: "600",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  settingsButton: {
    borderColor: "#38bdf8",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
  },
});

