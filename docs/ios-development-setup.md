# iOS Development Setup Guide

## Two Different Approaches

### Option 1: Expo Go (QR Code Scanning) - Current Method

**Command**: `pnpm start` or `npx expo start`

**How it works**:
1. Starts Expo development server
2. Shows QR code in terminal
3. Open **Expo Go app** on your iPhone
4. Scan QR code with Expo Go app
5. App loads in Expo Go

**Limitations**:
- ❌ Notifications have limited support
- ❌ Some native modules may not work
- ✅ Fastest way to test
- ✅ No build required

### Option 2: Development Build (Direct Install) - Recommended for Notifications

**Command**: `npx expo run:ios`

**How it works**:
1. Builds the app with native code
2. Installs directly on connected iPhone or simulator
3. **No QR code scanning needed**
4. App runs as standalone app (not in Expo Go)

**Requirements**:
- ✅ Xcode installed (Mac only)
- ✅ iPhone connected via USB, OR
- ✅ iOS Simulator available
- ✅ Apple Developer account (for physical device)

**Benefits**:
- ✅ Full notification support
- ✅ All native modules work
- ✅ Production-like experience
- ✅ Better performance

## Step-by-Step: Development Build

### Prerequisites

1. **Install Xcode** (Mac only):
   ```bash
   # Download from Mac App Store or Apple Developer
   ```

2. **Install CocoaPods** (if not already):
   ```bash
   sudo gem install cocoapods
   ```

3. **Connect iPhone** (for physical device):
   - Connect via USB
   - Trust computer on iPhone
   - Enable Developer Mode on iPhone (Settings > Privacy & Security > Developer Mode)

### Build and Run

**For iOS Simulator**:
```bash
npx expo run:ios
```
- Automatically opens iOS Simulator
- Builds and installs app
- No QR code needed

**For Physical iPhone**:
```bash
npx expo run:ios --device
```
- Builds for your connected iPhone
- Installs directly on device
- No QR code needed

**First Time Setup**:
- May take 10-15 minutes (downloads dependencies, builds)
- Subsequent builds are faster (incremental)

## Comparison

| Feature | Expo Go (QR Scan) | Development Build |
|---------|-------------------|-------------------|
| Setup Time | Instant | 10-15 min first time |
| QR Code | ✅ Required | ❌ Not needed |
| Notifications | ⚠️ Limited | ✅ Full support |
| Native Modules | ⚠️ Limited | ✅ Full support |
| Performance | Good | Better |
| Build Required | ❌ No | ✅ Yes |

## Which Should You Use?

### Use Expo Go (QR Scan) When:
- ✅ Quick testing/development
- ✅ Testing UI changes
- ✅ Don't need notifications
- ✅ Want fastest iteration

### Use Development Build When:
- ✅ Testing notifications
- ✅ Need full native features
- ✅ Preparing for production
- ✅ Want production-like experience

## Troubleshooting

### "Command not found: xcodebuild"
- Install Xcode from Mac App Store
- Open Xcode once to accept license

### "No devices found"
- For simulator: `npx expo run:ios` (auto-selects simulator)
- For device: Connect iPhone, enable Developer Mode, trust computer

### Build fails
- Run `cd ios && pod install && cd ..`
- Clean build: `npx expo run:ios --clean`

### Slow builds
- First build is always slow (downloads dependencies)
- Subsequent builds are incremental and faster

## Quick Reference

```bash
# Expo Go (current method - QR code)
pnpm start
# Then scan QR with Expo Go app

# Development Build (no QR code)
npx expo run:ios              # Simulator
npx expo run:ios --device     # Physical iPhone
```
