import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { Profile } from "../api/types";

interface ProfileHeaderProps {
  profile: Profile | null;
  email: string | undefined;
}

export function ProfileHeader({ profile, email }: ProfileHeaderProps) {
  const firstName = profile?.first_name || "";
  const lastName = profile?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";

  // Calculate member since
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>
      <Text style={styles.name}>{fullName}</Text>
      <Text style={styles.email}>{email || "No email"}</Text>
      <Text style={styles.memberSince}>Member since {memberSince}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#38bdf8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#0f172a",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#ffffff",
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 8,
    textAlign: "center",
  },
  email: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 12,
    color: "#64748b",
  },
});

