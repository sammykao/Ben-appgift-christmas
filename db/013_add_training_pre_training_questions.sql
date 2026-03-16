-- 013_add_training_pre_training_questions.sql
-- Add three pre-training prompts to the default Training journal questions.
-- This also overrides accidental.sql by updating existing rows to the intended
-- help_text + sort_order values before inserting any missing prompts.

set check_function_bodies = off;

BEGIN;

WITH training_type AS (
  SELECT id
  FROM public.workout_types
  WHERE lower(name) = 'training'
    AND owner_id IS NULL
  LIMIT 1
),
target_questions(prompt, sort_order) AS (
  VALUES
    ('What aspect of my game do I want to focus on today?', 1),
    ('What could potentially distract me from staying focused?', 2),
    ('How will I refocus after getting distracted?', 3)
)
UPDATE public.journal_questions jq
SET
  help_text = 'Phase: Pre-training',
  is_required = false,
  sort_order = target_questions.sort_order,
  is_system_default = true
FROM training_type, target_questions
WHERE jq.workout_type_id = training_type.id
  AND jq.owner_id IS NULL
  AND lower(jq.prompt) = lower(target_questions.prompt);

WITH training_type AS (
  SELECT id
  FROM public.workout_types
  WHERE lower(name) = 'training'
    AND owner_id IS NULL
  LIMIT 1
),
target_questions(prompt, sort_order) AS (
  VALUES
    ('What aspect of my game do I want to focus on today?', 1),
    ('What could potentially distract me from staying focused?', 2),
    ('How will I refocus after getting distracted?', 3)
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
  training_type.id,
  target_questions.prompt,
  'Phase: Pre-training',
  false,
  target_questions.sort_order,
  true
FROM training_type
CROSS JOIN target_questions
WHERE NOT EXISTS (
  SELECT 1
  FROM public.journal_questions jq
  WHERE jq.workout_type_id = training_type.id
    AND jq.owner_id IS NULL
    AND lower(jq.prompt) = lower(target_questions.prompt)
);

COMMIT;
