-- 011_remove_practice_add_lift.sql
-- Remove Practice workout type and all cascade dependencies
-- Add Lift workout type with 3 questions
-- Reorder Visualization questions (meta questions at end)
-- Make food_meals.time_of_day nullable

set check_function_bodies = off;

BEGIN;

-- Step 1: Delete Practice workout type (cascade will handle dependencies)
-- This will automatically delete:
-- - All journal_entries with workout_type_id = Practice
-- - All journal_questions with workout_type_id = Practice
-- - All journal_entry_answers for those entries
DELETE FROM public.workout_types 
WHERE lower(name) = 'practice' AND owner_id IS NULL;

-- Step 2: Add Lift workout type (if it doesn't exist)
INSERT INTO public.workout_types (id, owner_id, name, description, sort_order, is_system_default)
SELECT 
  gen_random_uuid(),
  NULL,
  'Lift',
  'Strength or conditioning session.',
  30,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.workout_types 
  WHERE lower(name) = 'lift' AND owner_id IS NULL
);

-- Step 3: Clean up old Lift questions and add correct ones
-- First, delete any old Lift questions (like the stretching question)
DELETE FROM public.journal_questions
WHERE workout_type_id IN (
  SELECT id FROM public.workout_types 
  WHERE lower(name) = 'lift' AND owner_id IS NULL
)
  AND owner_id IS NULL
  AND is_system_default = true;

-- Now add the 3 correct Lift questions
WITH lift_type AS (
  SELECT id FROM public.workout_types 
  WHERE lower(name) = 'lift' AND owner_id IS NULL
  LIMIT 1
)
INSERT INTO public.journal_questions (
  id,
  owner_id,
  workout_type_id,
  prompt,
  help_text,
  is_required,
  sort_order,
  is_system_default
)
SELECT
  gen_random_uuid(),
  NULL,
  lift_type.id,
  'How motivated was I before my lift today?',
  NULL,
  false,
  10,
  true
FROM lift_type
WHERE NOT EXISTS (
  SELECT 1 FROM public.journal_questions
  WHERE workout_type_id = lift_type.id
    AND prompt = 'How motivated was I before my lift today?'
    AND owner_id IS NULL
);

WITH lift_type AS (
  SELECT id FROM public.workout_types 
  WHERE lower(name) = 'lift' AND owner_id IS NULL
  LIMIT 1
)
INSERT INTO public.journal_questions (
  id,
  owner_id,
  workout_type_id,
  prompt,
  help_text,
  is_required,
  sort_order,
  is_system_default
)
SELECT
  gen_random_uuid(),
  NULL,
  lift_type.id,
  'Post-lift, how does my body feel?',
  NULL,
  false,
  20,
  true
FROM lift_type
WHERE NOT EXISTS (
  SELECT 1 FROM public.journal_questions
  WHERE workout_type_id = lift_type.id
    AND prompt = 'Post-lift, how does my body feel?'
    AND owner_id IS NULL
);

WITH lift_type AS (
  SELECT id FROM public.workout_types 
  WHERE lower(name) = 'lift' AND owner_id IS NULL
  LIMIT 1
)
INSERT INTO public.journal_questions (
  id,
  owner_id,
  workout_type_id,
  prompt,
  help_text,
  is_required,
  sort_order,
  is_system_default
)
SELECT
  gen_random_uuid(),
  NULL,
  lift_type.id,
  'Am I happy that I lifted?',
  NULL,
  false,
  30,
  true
FROM lift_type
WHERE NOT EXISTS (
  SELECT 1 FROM public.journal_questions
  WHERE workout_type_id = lift_type.id
    AND prompt = 'Am I happy that I lifted?'
    AND owner_id IS NULL
);

-- Step 4: Reorder Visualization questions
-- Move meta questions to the end (sort_order 110, 120)
-- Scenario prompts should remain at sort_order 10-100

-- Update "What scenario did you visualize?" to sort_order 110
UPDATE public.journal_questions
SET sort_order = 110
WHERE workout_type_id IN (
  SELECT id FROM public.workout_types 
  WHERE lower(name) = 'visualization' AND owner_id IS NULL
)
  AND prompt = 'What scenario did you visualize?'
  AND owner_id IS NULL;

-- Update "How vivid and real did the visualization feel" to sort_order 120
UPDATE public.journal_questions
SET sort_order = 120
WHERE workout_type_id IN (
  SELECT id FROM public.workout_types 
  WHERE lower(name) = 'visualization' AND owner_id IS NULL
)
  AND prompt LIKE '%How vivid and real did the visualization feel%'
  AND owner_id IS NULL;

-- Step 5: Make food_meals.time_of_day nullable
ALTER TABLE public.food_meals 
ALTER COLUMN time_of_day DROP NOT NULL;

COMMIT;
