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
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false
    }
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
    eas: {
      projectId: "b3ae1797-9e71-41a3-b535-c49b1d2f8b4c"
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  },
  
};

export default config;

