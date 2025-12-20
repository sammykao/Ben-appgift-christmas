# How Local Notifications Work

## Overview

Local notifications are **scheduled on the device** and **triggered by the operating system** at the specified times. The app doesn't "run" them continuously - they're set up once and the OS handles delivery.

## How They Work

### 1. **Scheduling (One-Time Setup)**

When you call `scheduleNotifications()`, the app:
- Calculates all the notification times based on user preferences
- Schedules each notification with the device's OS (iOS/Android)
- The OS stores these in its notification queue

**When scheduling happens:**
- ✅ **App launch** - When user opens the app (in `_layout.tsx`)
- ✅ **Settings save** - When user saves notification preferences
- ✅ **After permission grant** - When user grants notification permissions

### 2. **Notification Delivery (OS-Controlled)**

Once scheduled, the **operating system** handles everything:
- The OS checks the scheduled times
- At the specified time, the OS displays the notification
- This happens **even if the app is closed**
- No app code runs until the user taps the notification

### 3. **Frequency**

Notifications are scheduled **recurring weekly**:
- If user sets "6 PM every day", the OS schedules 7 notifications (one per day)
- Each notification repeats weekly (every Monday at 6 PM, every Tuesday at 6 PM, etc.)
- The OS automatically repeats them - no app code needed

**Example:**
- User sets: 6 PM on Monday, Wednesday, Friday
- App schedules: 3 recurring notifications
- OS delivers: Every Monday at 6 PM, every Wednesday at 6 PM, every Friday at 6 PM
- Continues indefinitely until cancelled

### 4. **Limitations**

- **64 notifications max** per app (iOS/Android limit)
- **Physical devices only** (doesn't work in simulators)
- **Requires permissions** (user must grant notification access)
- **Device must be on** (notifications won't fire if device is off)

## Current Implementation

### Scheduling Logic (`src/services/notifications.ts`)

```typescript
// For each reminder time (e.g., ["09:00", "18:00"])
for (const timeStr of preferences.reminder_times) {
  // For each selected day (e.g., [0,1,2,3,4,5,6] = all days)
  for (const day of preferences.reminder_days) {
    // Schedule a recurring weekly notification
    await Notifications.scheduleNotificationAsync({
      trigger: {
        weekday: day + 1,  // Expo uses 1-7 (Sunday-Saturday)
        hour: hours,
        minute: minutes,
        repeats: true,     // Repeats every week
      },
    });
  }
}
```

### When Notifications Are Rescheduled

1. **App Launch** (`app/_layout.tsx`)
   - Loads preferences from database
   - Schedules all notifications if enabled

2. **Settings Save** (`app/settings.tsx`)
   - User updates preferences
   - Cancels all existing notifications
   - Schedules new notifications with updated times

3. **Permission Grant**
   - After user grants permissions
   - Automatically schedules based on current preferences

## Settings Page Customization

The settings page (`app/settings.tsx`) is **fully customizable**:

### ✅ Available Customizations

1. **Enable/Disable Toggle**
   - Master switch to turn all notifications on/off

2. **Multiple Reminder Times**
   - Add multiple times per day (e.g., 9 AM and 6 PM)
   - Remove times
   - Custom time picker with AM/PM

3. **Day Selection**
   - Select specific days of week
   - Visual day buttons (Sun-Sat)
   - Toggle individual days on/off

4. **Streak Reminders**
   - Toggle for streak-related notifications (future feature)

5. **Mood Insights**
   - Toggle for mood insight notifications (future feature)

### Settings UI Features

- **Time Picker Component**: Custom modal with hour/minute selection
- **Day Selector**: Visual buttons for each day
- **Add/Remove Times**: Dynamic list of reminder times
- **Save Button**: Persists preferences and reschedules notifications
- **Real-time Updates**: Changes reflected immediately in UI

## Testing Notifications

### On Physical Device

1. Set a reminder time 1-2 minutes in the future
2. Save preferences
3. Close the app completely
4. Wait for the scheduled time
5. Notification should appear even with app closed

### Debugging

Check scheduled notifications:
```typescript
const scheduled = await Notifications.getAllScheduledNotificationsAsync();
console.log("Scheduled notifications:", scheduled);
```

## Future Enhancements

1. **Smart Reminders**: Check if user logged today before sending
2. **Streak Alerts**: Special notifications when streak is at risk
3. **Weekly Summaries**: "Your week in review" notifications
4. **Push Notifications**: Server-side push for cross-device sync
