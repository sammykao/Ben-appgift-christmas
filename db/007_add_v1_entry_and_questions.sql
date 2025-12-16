-- 007_add_v1_entry_and_questions.sql
-- Seed V1 workout types and detailed journal questions
-- matching the Mental Pitch README (Training, Rehab, Lift,
-- Game, Food, Imagery).

set check_function_bodies = off;


-- V1 workout types -----------------------------------------------------------

insert into public.workout_types (id, owner_id, name, description, sort_order, is_system_default)
values
  (gen_random_uuid(), null, 'Training', 'Training / practice session.', 10, true),
  (gen_random_uuid(), null, 'Rehab', 'Rehabilitation / recovery work.', 20, true),
  (gen_random_uuid(), null, 'Lift', 'Strength or conditioning session.', 30, true),
  (gen_random_uuid(), null, 'Game', 'Competitive game or match.', 40, true),
  (gen_random_uuid(), null, 'Food', 'Daily nutrition / meals log.', 50, true),
  (gen_random_uuid(), null, 'Imagery', 'Mental imagery / visualization session.', 60, true)
on conflict do nothing;


-- One row per question/prompt, attached to the correct workout type by name.

with wt as (
  -- Guard against duplicate names by collapsing to a single id per name.
  select lower(name) as name, min(id::text)::uuid as id
  from public.workout_types
  where owner_id is null
  group by lower(name)
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
  -- Training (6 default questions)
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Training')),
    'Did I feel focused during practice today?',
    null,
    false,
    10,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Training')),
    'What were distracting external factors for me during training?',
    null,
    false,
    20,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Training')),
    'What weakness in my game do I want to work on?',
    null,
    false,
    30,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Training')),
    'Write down what I did well today, and my "play of the day":',
    null,
    false,
    40,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Training')),
    'What''d I do when I first woke up this morning to set a positive tone for my day?',
    null,
    false,
    50,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Training')),
    'Did I do the treatment, activation, and stretching I normally do?',
    null,
    false,
    60,
    true
  ),

  -- Rehab (6 default questions)
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Rehab')),
    'How do I feel about my rehab performance today?',
    null,
    false,
    10,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Rehab')),
    'What did I do when I first woke up to set a positive tone for my recovery?',
    null,
    false,
    20,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Rehab')),
    'Did I get 20 minutes of stretching in today? If not, why?',
    null,
    false,
    30,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Rehab')),
    'How motivated was I before rehab today?',
    null,
    false,
    40,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Rehab')),
    'After rehab, do I feel better or worse about my recovery process?',
    null,
    false,
    50,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Rehab')),
    'What did/am I going to do to stay connected with my teammates today?',
    null,
    false,
    60,
    true
  ),

  -- Lift (4 default questions)
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Lift')),
    'How motivated was I before lift today?',
    null,
    false,
    10,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Lift')),
    'After my lift, how does my body feel?',
    null,
    false,
    20,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Lift')),
    'Am I happy I lifted?',
    null,
    false,
    30,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Lift')),
    'Have I stretched for 20 minutes today?',
    null,
    false,
    40,
    true
  ),

  -- Game (11 questions: 3 pregame, 8 postgame)
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Game')),
    'What are three things I can control today that will help me perform my best?',
    'Phase: Pregame',
    false,
    10,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Game')),
    'What external factors could distract me from playing my best?',
    'Phase: Pregame',
    false,
    20,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Game')),
    'How will I respond to mistakes in a way that keeps me focused?',
    'Phase: Pregame',
    false,
    30,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Game')),
    'Was I fully engaged in the game? YES or NO',
    'Phase: Postgame',
    false,
    40,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Game')),
    'Right now, how do I feel I played?',
    'Phase: Postgame',
    false,
    50,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Game')),
    'What are three things I did well?',
    'Phase: Postgame',
    false,
    60,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Game')),
    'What''s one thing I want to work on based on today''s game?',
    'Phase: Postgame',
    false,
    70,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Game')),
    'Do I think how I played will affect the rest of my day? What if I played the opposite of how I played?',
    'Phase: Postgame',
    false,
    80,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Game')),
    'How did I feel playing against the player I was matched up against?',
    'Phase: Postgame',
    false,
    90,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Game')),
    'How did I feel in my team''s system against the other team''s system?',
    'Phase: Postgame',
    false,
    100,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Game')),
    'How do I feel about my playing time today? If I don''t feel great about it, how can I work with my coaches to change it, without disrespecting their decision?',
    'Phase: Postgame',
    false,
    110,
    true
  ),

  -- Imagery (10 default prompts)
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Imagery')),
    'Visualize a successful pass that''s common in your position.',
    null,
    false,
    10,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Imagery')),
    'Envision Scoring a Goal: Picture yourself receiving the ball, beating a defender, and scoring.',
    null,
    false,
    20,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Imagery')),
    'Mentally Practice Defensive Positioning: Visualize positioning yourself to intercept an opponent''s pass.',
    null,
    false,
    30,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Imagery')),
    'Simulate Handling Pressure: Visualize maintaining composure when facing a high-pressure situation.',
    null,
    false,
    40,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Imagery')),
    'Imagine Effective Communication: Picture yourself directing teammates during a set piece.',
    null,
    false,
    50,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Imagery')),
    'Recreate a Successful Tackle: Mentally rehearse timing and executing a clean tackle.',
    null,
    false,
    60,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Imagery')),
    'Visualize Positive Body Language: Imagine displaying confident body language.',
    null,
    false,
    70,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Imagery')),
    'Envision Overcoming Adversity: Picture yourself recovering from a mistake.',
    null,
    false,
    80,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Imagery')),
    'Simulate Game Scenarios: Mentally rehearse various game situations.',
    null,
    false,
    90,
    true
  ),
  (gen_random_uuid(), null,
    (select id from wt where name = lower('Imagery')),
    'Relive your best moment: Close your eyes and think about your most fun game.',
    null,
    false,
    100,
    true
  )
on conflict do nothing;
