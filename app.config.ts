import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "The MentalPitch",
  slug: "the-mental-pitch",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "thementalpitch",
  platforms: ["ios", "android", "web"],
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  }
};

export default config;


