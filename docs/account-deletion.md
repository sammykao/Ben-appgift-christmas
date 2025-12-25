# Account Deletion Feature

## Overview

Account deletion functionality has been added to the Settings page, allowing users to permanently delete their account and all associated data.

## Implementation

### 1. **API Function** (`src/api/account.ts`)

- `deleteAccount()`: Deletes user account using database RPC function
- Falls back to manual data deletion if RPC function doesn't exist
- Handles all user data cleanup

### 2. **Database Function** (`db/account-deletion-function.sql`)

**Required Setup**: Run this SQL in your Supabase SQL editor to enable full account deletion.

The function:
- Deletes notification preferences
- Deletes journal entries (cascades to answers and food_meals)
- Deletes profile
- Deletes custom workout types
- Deletes custom journal questions
- Attempts to delete auth.users record

**Note**: Direct deletion from `auth.users` may require additional permissions. If it fails, user data is still deleted and the account becomes effectively inactive.

### 3. **Settings UI** (`app/settings.tsx`)

Added "Danger Zone" section with:
- **Sign Out** button (existing)
- **Delete Account** button (new)
- Warning text about permanent deletion
- Double confirmation dialogs

## User Flow

1. User navigates to Settings
2. Scrolls to "Danger Zone" section
3. Taps "Delete Account"
4. First confirmation: "Are you sure? This cannot be undone."
5. Second confirmation: "Final confirmation - last chance to cancel"
6. Account deletion proceeds:
   - All user data deleted
   - User signed out
   - Redirected to landing page
   - Success message shown

## Security

- ✅ Only authenticated users can delete accounts
- ✅ Users can only delete their own account
- ✅ Double confirmation required
- ✅ RLS policies enforce data isolation
- ✅ Cascade deletes handle related data

## What Gets Deleted

When an account is deleted, the following data is removed:

1. **Notification Preferences** - All notification settings
2. **Journal Entries** - All journal entries (cascades to):
   - Journal entry answers
   - Food meals
3. **Profile** - User profile information
4. **Custom Workout Types** - User-created workout types
5. **Custom Journal Questions** - User-created questions
6. **Auth User** - The authentication record (if permissions allow)

## Database Setup

### Step 1: Run the Migration

Execute the SQL in `db/account-deletion-function.sql` in your Supabase SQL editor:

```sql
-- Creates delete_user_account() function
-- Grants execute permission to authenticated users
```

### Step 2: Verify Function

Test the function exists:
```sql
SELECT proname FROM pg_proc WHERE proname = 'delete_user_account';
```

### Step 3: Test (Optional)

Test with a test account:
```sql
-- This will be called automatically by the app
SELECT delete_user_account();
```

## Error Handling

### If RPC Function Doesn't Exist

- User data is still deleted manually
- User is signed out
- Error message explains database setup is needed
- User can contact support for full deletion

### If Deletion Fails

- Error message shown to user
- User remains signed in
- Data is not deleted
- User can try again or contact support

## UI Design

- **Danger Zone Section**: Clearly labeled section at bottom of settings
- **Delete Button**: Dark red button (#991b1b) with red border
- **Warning Text**: Small gray text explaining permanence
- **Double Confirmation**: Two alert dialogs to prevent accidental deletion

## Future Enhancements

1. **Soft Delete**: Option to deactivate instead of delete
2. **Data Export**: Allow users to export data before deletion
3. **Grace Period**: 30-day grace period before permanent deletion
4. **Admin Override**: Admin ability to restore deleted accounts
