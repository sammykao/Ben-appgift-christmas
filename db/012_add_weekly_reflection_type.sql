-- 012_add_weekly_reflection_type.sql
-- Add Weekly Reflection workout type with a single freeform prompt.

set check_function_bodies = off;

BEGIN;

-- Add Weekly Reflection workout type (if it doesn't exist)
INSERT INTO public.workout_types (id, owner_id, name, description, sort_order, is_system_default)
SELECT
  gen_random_uuid(),
  NULL,
  'Weekly Reflection',
  'Weekly reflection journal entry.',
  70,
  true
WHERE NOT EXISTS (
  SELECT 1
  FROM public.workout_types
  WHERE lower(name) = 'weekly reflection' AND owner_id IS NULL
);

-- Add single freeform prompt
WITH weekly_type AS (
  SELECT id
  FROM public.workout_types
  WHERE lower(name) = 'weekly reflection' AND owner_id IS NULL
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
  weekly_type.id,
  'Write whatever you want about your week.',
  NULL,
  false,
  10,
  true
FROM weekly_type
WHERE NOT EXISTS (
  SELECT 1
  FROM public.journal_questions
  WHERE workout_type_id = weekly_type.id
    AND prompt = 'Write whatever you want about your week.'
    AND owner_id IS NULL
);

COMMIT;
