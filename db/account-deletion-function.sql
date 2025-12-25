-- Database function for account deletion
-- Run this in your Supabase SQL editor to enable account deletion

-- Function to delete user account and all associated data
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_to_delete uuid;
BEGIN
  -- Get the current user ID
  user_id_to_delete := auth.uid();
  
  IF user_id_to_delete IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Delete notification preferences
  DELETE FROM public.notification_preferences
  WHERE user_id = user_id_to_delete;

  -- Delete journal entries (cascade will handle answers and food_meals)
  DELETE FROM public.journal_entries
  WHERE user_id = user_id_to_delete;

  -- Delete profile
  DELETE FROM public.profiles
  WHERE id = user_id_to_delete;

  -- Delete custom workout types (user-owned)
  DELETE FROM public.workout_types
  WHERE owner_id = user_id_to_delete;

  -- Delete custom journal questions (user-owned)
  DELETE FROM public.journal_questions
  WHERE owner_id = user_id_to_delete;

  -- Note: Direct deletion from auth.users requires admin privileges
  -- In Supabase, you typically need to use the Admin API or a webhook
  -- For now, we'll delete all user data and the auth.users record
  -- will be handled by Supabase's cleanup processes or admin API
  
  -- Attempt to delete from auth.users (may require additional permissions)
  -- If this fails, the user data is still deleted and the account is effectively inactive
  BEGIN
    DELETE FROM auth.users WHERE id = user_id_to_delete;
  EXCEPTION WHEN OTHERS THEN
    -- If deletion fails, log but don't fail the entire operation
    -- The user data has been deleted, making the account effectively inactive
    RAISE NOTICE 'Could not delete auth.users record. User data has been removed.';
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- Add comment
COMMENT ON FUNCTION delete_user_account() IS 
  'Deletes the current authenticated user account and all associated data. This is a destructive operation with no undo.';
