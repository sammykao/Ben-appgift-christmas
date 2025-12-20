/// <reference path="./expo-env.d.ts" />


import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "The MentalPitch",
  slug: "the-mental-pitch",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "thementalpitch",
  platforms: ["ios", "android", "web"],
  icon: "./assets/images/app_logo.png",
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true
  },
  ios: {
    bundleIdentifier: "com.mentalpitch.app",
    buildNumber: "1",
    supportsTablet: true,
    requireFullScreen: false,
  },
  android: {
    package: "com.mentalpitch.app",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/images/app_logo.png",
      backgroundColor: "#ffffff",
    },
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  }
};

export default config;

