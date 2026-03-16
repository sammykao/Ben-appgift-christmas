# 1) One-time setup
pnpm install
pnpm lint

# 2) Build iOS production artifact (App Store)
pnpm eas build --platform ios --profile production
# (equivalent raw command: pnpm exec eas build --platform ios --profile production)
# 3) Submit build to App Store Connect
pnpm eas submit --platform ios --profile production
