-- 002_core_config_tables.sql
-- Core configuration tables: workout types and journal question templates

set check_function_bodies = off;

-- Workout types (e.g. game, practice, lift, visualization)
create table if not exists public.workout_types (
  id uuid primary key default gen_random_uuid(),

  -- Null owner_id means "system default" type provided by the app.
  owner_id uuid references auth.users (id) on delete cascade default auth.uid(),

  name text not null,
  description text,

  -- Controls ordering in pickers; lower comes first.
  sort_order integer not null default 100,

  -- System defaults are shipped via migrations; users cannot modify them.
  is_system_default boolean not null default false,

  created_at timestamptz not null default now()
);

create unique index if not exists workout_types_owner_name_uq
  on public.workout_types (owner_id, lower(name));

comment on table public.workout_types is
  'Types of workouts/sessions (game, practice, lift, visualization, etc).';

comment on column public.workout_types.owner_id is
  'Null = system default; otherwise per-user custom workout type.';


-- Journal question templates.
-- These define the dynamic questions shown for a given workout type.
create table if not exists public.journal_questions (
  id uuid primary key default gen_random_uuid(),

  -- Null owner_id = system default question template.
  owner_id uuid references auth.users (id) on delete cascade default auth.uid(),

  workout_type_id uuid references public.workout_types (id) on delete cascade,

  -- The actual question text shown to the athlete.
  prompt text not null,

  -- Optional helper/description text.
  help_text text,

  -- If true, the client may choose to enforce an answer.
  is_required boolean not null default false,

  -- Controls ordering when rendering prompts.
  sort_order integer not null default 100,

  -- System defaults are shipped via migrations; users cannot modify them.
  is_system_default boolean not null default false,

  created_at timestamptz not null default now()
);

create index if not exists journal_questions_workout_type_idx
  on public.journal_questions (workout_type_id, sort_order);

comment on table public.journal_questions is
  'Question templates for journaling, optionally scoped to a workout type.';


