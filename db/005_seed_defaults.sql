-- 005_seed_defaults.sql
-- Seed some sensible default workout types and journal question templates.
-- Safe to run multiple times because of ON CONFLICT DO NOTHING.

-- Default workout types ------------------------------------------------------

insert into public.workout_types (id, owner_id, name, description, sort_order, is_system_default)
values
  (gen_random_uuid(), null, 'Game', 'Competitive game or match.', 10, true),
  (gen_random_uuid(), null, 'Practice', 'Team or individual practice session.', 20, true),
  (gen_random_uuid(), null, 'Lift', 'Strength or conditioning session.', 30, true),
  (gen_random_uuid(), null, 'Visualization', 'Mental rehearsal or visualization session.', 40, true)
on conflict do nothing;


-- Default journal questions --------------------------------------------------
-- We attach these to workout types by name so you can safely modify IDs later.

with wt as (
  select name, id
  from public.workout_types
  where owner_id is null
)
insert into public.journal_questions (
  id,
  owner_id,
  workout_type_id,
  prompt,
  help_text,
  is_required,
  sort_order,
  is_system_default
)
values
  -- Generic questions (no specific workout type)
  (gen_random_uuid(), null, null,
    'How are you feeling mentally today?',
    'Describe your overall mood, stress level, and focus.',
    false, 5, true),
  (gen_random_uuid(), null, null,
    'What is one thing you did well today?',
    'Focus on a specific action, decision, or mindset you’re proud of.',
    false, 10, true),
  (gen_random_uuid(), null, null,
    'What is one thing you want to improve next time?',
    'Keep it small and actionable.',
    false, 20, true),

  -- Game-specific
  (gen_random_uuid(), null,
    (select id from wt where name = 'Game'),
    'What was your mindset going into the game?',
    'Were you confident, nervous, distracted, locked in?',
    false, 10, true),
  (gen_random_uuid(), null,
    (select id from wt where name = 'Game'),
    'What were 1–2 key moments that stood out?',
    'Think about plays, decisions, or emotional swings.',
    false, 20, true),

  -- Practice-specific
  (gen_random_uuid(), null,
    (select id from wt where name = 'Practice'),
    'What was your primary focus for this practice?',
    'E.g. technique, communication, effort, discipline.',
    false, 10, true),
  (gen_random_uuid(), null,
    (select id from wt where name = 'Practice'),
    'Did your focus stay where you wanted it?',
    'If not, when did it slip and why?',
    false, 20, true),

  -- Lift-specific
  (gen_random_uuid(), null,
    (select id from wt where name = 'Lift'),
    'How did your body feel during this lift?',
    'Note energy, soreness, and any pain signals.',
    false, 10, true),

  -- Visualization-specific
  (gen_random_uuid(), null,
    (select id from wt where name = 'Visualization'),
    'What scenario did you visualize?',
    'Describe the situation and your ideal response.',
    false, 10, true),
  (gen_random_uuid(), null,
    (select id from wt where name = 'Visualization'),
    'How vivid and real did the visualization feel (1–10)?',
    null,
    false, 20, true)
on conflict do nothing;


