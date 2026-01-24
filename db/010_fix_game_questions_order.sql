-- 010_fix_game_questions_order.sql
-- Fix Game entry questions:
-- 1. Add "Who was your opponent?" as a pregame question
-- 2. Update existing questions (instead of deleting to preserve existing answers):
--    - Change "What was your mindset..." to "What is your mindset..." (present tense)
--    - Move mindset and moments questions to postgame phase
-- 3. Preserves all existing answers by updating questions in-place

set check_function_bodies = off;

-- Update existing questions instead of deleting them (preserves existing answers)
-- Update the mindset question: change to present tense and move to postgame
UPDATE public.journal_questions
SET 
  prompt = 'What is your mindset going into the game?',
  help_text = 'Phase: Postgame',
  sort_order = 120
WHERE owner_id IS NULL
  AND is_system_default = true
  AND workout_type_id IN (
    SELECT id FROM public.workout_types WHERE name = 'Game' AND owner_id IS NULL
  )
  AND prompt = 'What was your mindset going into the game?';

-- Update the moments question: change wording and move to postgame
UPDATE public.journal_questions
SET 
  prompt = 'What were two moments that stood out?',
  help_text = 'Phase: Postgame',
  sort_order = 130
WHERE owner_id IS NULL
  AND is_system_default = true
  AND workout_type_id IN (
    SELECT id FROM public.workout_types WHERE name = 'Game' AND owner_id IS NULL
  )
  AND prompt = 'What were 1–2 key moments that stood out?';

-- Add new opponent question as first pregame question
WITH wt AS (
  SELECT id FROM public.workout_types 
  WHERE name = 'Game' AND owner_id IS NULL 
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
  wt.id,
  'Who was your opponent?',
  'Phase: Pregame',
  false,
  5,
  true
FROM wt
ON CONFLICT DO NOTHING;

-- Note: The mindset and moments questions are updated above, not inserted
-- This preserves existing answers that reference those question IDs
