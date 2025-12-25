# Step-by-Step Guide: Submitting to the App Store

## Prerequisites Checklist

- [ ] Apple Developer Account ($99/year) - [Sign up here](https://developer.apple.com/programs/)
- [ ] Expo account (free) - [Sign up here](https://expo.dev/signup)
- [ ] EAS CLI installed globally
- [ ] App configured with bundle identifier
- [ ] App icon ready (1024x1024px PNG)

---

## Step 1: Install EAS CLI

Open your terminal and run:

```bash
npm install -g eas-cli
```

Verify installation:
```bash
eas --version
```

---

## Step 2: Login to Expo

```bash
eas login
```

Enter your Expo account credentials. If you don't have an account, create one at [expo.dev/signup](https://expo.dev/signup).

---

## Step 3: Configure Your Project for EAS

Run this command in your project directory:

```bash
eas build:configure
```

This will:
- Link your project to EAS
- Verify your `app.config.ts` and `eas.json` are set up correctly
- Set up build profiles

**Note**: If prompted about credentials, choose "Let EAS handle credentials" for the first build.

---

## Step 4: Prepare Your App Icon

Your app icon (`assets/images/app_logo.png`) should be:
- **1024x1024 pixels**
- **PNG format**
- **No transparency** (iOS requires opaque background)
- **Square** (no rounded corners - iOS adds them automatically)

If your logo isn't 1024x1024, resize it before building. You can use online tools like:
- [Squoosh](https://squoosh.app/)
- [TinyPNG](https://tinypng.com/)

---

## Step 5: Build Your App for iOS

### First Build (Production)

```bash
eas build --platform ios --profile production
```

**What happens:**
1. EAS will ask about credentials - choose "Let EAS handle credentials automatically"
2. EAS will create certificates and provisioning profiles for you
3. Your app will be built in the cloud (takes 10-20 minutes)
4. You'll get a build URL to track progress

**Important**: Save the build URL - you'll need it later!

### Monitor Build Progress

You can:
- Watch the build in your terminal
- Visit the build URL provided
- Check at [expo.dev](https://expo.dev) → Your Project → Builds

---

## Step 6: Create Apple Developer Account (If Needed)

If you don't have an Apple Developer account:

1. Go to [developer.apple.com/programs](https://developer.apple.com/programs/)
2. Click "Enroll"
3. Sign in with your Apple ID
4. Complete enrollment (requires payment of $99/year)
5. Wait for approval (usually instant, but can take up to 48 hours)

---

## Step 7: Create App in App Store Connect

1. **Go to App Store Connect**
   - Visit [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Sign in with your Apple ID (must be enrolled in Developer Program)

2. **Create New App**
   - Click "My Apps" → "+" button → "New App"
   - Fill in:
     - **Platform**: iOS
     - **Name**: "The MentalPitch" (or your preferred name)
     - **Primary Language**: English (or your language)
     - **Bundle ID**: Select "com.mentalpitch.app" (or create new one)
     - **SKU**: A unique identifier (e.g., "mentalpitch-001")
     - **User Access**: Full Access (unless you have a team)

3. **Click "Create"**

---

## Step 8: Configure App Information

In App Store Connect, fill out all required information:

### App Information Tab

- **Name**: The MentalPitch
- **Subtitle**: (Optional) A short tagline
- **Category**: 
  - Primary: Health & Fitness (or appropriate category)
  - Secondary: (Optional)
- **Content Rights**: Answer if you have rights to use content

### Pricing and Availability

- **Price**: Set your price (or Free)
- **Availability**: Select countries where app will be available

---

## Step 9: Prepare App Store Listing

### Required Information:

1. **App Description** (up to 4000 characters)
   - Write compelling description of your app
   - Highlight key features
   - Use line breaks for readability

2. **Keywords** (up to 100 characters)
   - Comma-separated keywords
   - Example: "mental health, journal, wellness, mood tracking"

3. **Support URL**
   - A website where users can get help
   - Can be your website or a support page

4. **Marketing URL** (Optional)
   - Your app's marketing website

5. **Privacy Policy URL** (REQUIRED)
   - You MUST provide a privacy policy
   - Can be hosted on your website or use a service like:
     - [Privacy Policy Generator](https://www.freeprivacypolicy.com/)
     - [Termly](https://termly.io/)

6. **App Icon** (1024x1024px)
   - Upload your app icon
   - Must match what's in your app

7. **Screenshots** (REQUIRED)
   - **iPhone 6.7" Display** (1290 x 2796 pixels) - At least 1, up to 10
   - **iPhone 6.5" Display** (1242 x 2688 pixels) - At least 1, up to 10
   - **iPhone 5.5" Display** (1242 x 2208 pixels) - Optional
   - Take screenshots from your app running on simulator or device

8. **App Preview Video** (Optional but recommended)
   - Short video showing your app in action

---

## Step 10: Upload Your Build

### Option A: Using EAS Submit (Recommended)

Once your build completes:

```bash
eas submit --platform ios --profile production
```

**First time setup:**
- EAS will ask for your Apple ID
- EAS will ask for App-Specific Password (see below)
- EAS will ask for your App Store Connect API Key (optional but recommended)

**Create App-Specific Password:**
1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Sign in → Security → App-Specific Passwords
3. Generate new password for "EAS Submit"
4. Copy and paste when prompted

**The build will be uploaded automatically!**

### Option B: Manual Upload

1. Download the `.ipa` file from your EAS build page
2. Install **Transporter** app from Mac App Store (Mac only)
3. Open Transporter → Drag and drop `.ipa` file
4. Click "Deliver" → Wait for upload to complete

---

## Step 11: Select Build in App Store Connect

1. Go back to App Store Connect
2. Navigate to your app → **App Store** tab
3. Scroll to **Build** section
4. Click **"+ Build"** or **"Select a build before you submit your app"**
5. Select your uploaded build
6. If you don't see your build:
   - Wait a few minutes (processing takes time)
   - Check that build status is "Ready to Submit"

---

## Step 12: Complete App Review Information

In App Store Connect, fill out:

### App Review Information

- **Contact Information**
  - First Name, Last Name
  - Phone Number
  - Email Address

- **Demo Account** (if your app requires login)
  - Username
  - Password
  - Notes about the account

- **Notes** (Optional)
  - Any special instructions for reviewers
  - Information about features that need testing

### Version Information

- **What's New in This Version**
  - Release notes for users
  - Describe new features, bug fixes, etc.

### Export Compliance

- Answer questions about encryption
- Most apps: "No" to encryption questions (unless you use custom encryption)

### Advertising Identifier (IDFA)

- Answer if you use advertising
- Most apps: "No" unless you show ads

---

## Step 13: Submit for Review

1. **Review Everything**
   - Check all information is complete
   - Verify screenshots look good
   - Ensure description is accurate

2. **Submit**
   - Click **"Add for Review"** or **"Submit for Review"** button
   - Confirm submission

3. **Status Changes**
   - Status will change to "Waiting for Review"
   - You'll receive email notifications about status changes

---

## Step 14: Wait for Review

**Typical Timeline:**
- **Initial Review**: 24-48 hours
- **Re-review** (if rejected): 24-48 hours after fixes

**Status Updates:**
- **Waiting for Review** → Your app is in queue
- **In Review** → Apple is reviewing your app
- **Pending Developer Release** → Approved, waiting for you to release
- **Ready for Sale** → Live on App Store!
- **Rejected** → Review feedback provided, fix and resubmit

**You'll receive emails for each status change.**

---

## Step 15: Handle Rejection (If Needed)

If your app is rejected:

1. **Read the feedback carefully**
   - Apple provides specific reasons
   - Check email and App Store Connect

2. **Common Rejection Reasons:**
   - Missing privacy policy
   - App crashes or bugs
   - Missing required information
   - Guideline violations
   - Incomplete functionality

3. **Fix Issues**
   - Address all feedback
   - Test thoroughly

4. **Resubmit**
   - Upload new build (if needed)
   - Update app information (if needed)
   - Submit again

---

## Step 16: Release Your App

Once approved:

1. **Automatic Release** (if selected)
   - App goes live immediately after approval

2. **Manual Release**
   - Go to App Store Connect
   - Click "Release This Version"
   - App goes live within 24 hours

---

## Quick Command Reference

```bash
# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production

# Check build status
eas build:list

# View build details
eas build:view [BUILD_ID]
```

---

## Troubleshooting

### Build Fails
- Check build logs in EAS dashboard
- Verify `app.config.ts` is correct
- Ensure all dependencies are compatible

### Can't See Build in App Store Connect
- Wait 5-10 minutes after upload
- Check build status is "Ready to Submit"
- Verify bundle identifier matches

### Submission Rejected
- Read rejection email carefully
- Address all issues mentioned
- Test app thoroughly before resubmitting

### Credential Issues
- Let EAS handle credentials automatically
- If manual, ensure certificates are valid
- Check Apple Developer account status

---

## Cost Breakdown

- **Apple Developer Program**: $99/year (required)
- **Expo EAS**: Free tier available (limited builds/month)
  - Paid plans start at $29/month for more builds
- **App Store**: No additional fee (included in Developer Program)

---

## Timeline Summary

- **Setup & Build**: 1-2 hours
- **App Store Connect Setup**: 1-2 hours
- **Build Processing**: 10-20 minutes
- **Review Process**: 24-48 hours
- **Total Time**: 2-4 days (mostly waiting for review)

---

## Next Steps After Approval

1. **Monitor Reviews**
   - Respond to user reviews
   - Address common issues

2. **Update Your App**
   - Increment version in `app.config.ts`
   - Build new version: `eas build --platform ios --profile production`
   - Submit update through App Store Connect

3. **Marketing**
   - Share on social media
   - Update your website
   - Consider App Store Optimization (ASO)

---

## Need Help?

- **EAS Documentation**: [docs.expo.dev/build/introduction](https://docs.expo.dev/build/introduction/)
- **App Store Connect Help**: [help.apple.com/app-store-connect](https://help.apple.com/app-store-connect/)
- **Apple Review Guidelines**: [developer.apple.com/app-store/review/guidelines](https://developer.apple.com/app-store/review/guidelines/)

Good luck with your submission! 🚀
