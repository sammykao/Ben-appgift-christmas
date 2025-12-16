-- 003_journal_entry_tables.sql
-- Core journaling tables: entries/sessions and answers

set check_function_bodies = off;

-- Top-level journal entry for a specific workout/session.
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),

  -- The athlete who owns this entry.
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),

  -- What kind of workout this entry is about (game, practice, lift, etc.).
  workout_type_id uuid references public.workout_types (id),

  -- Calendar date the workout/session is associated with.
  entry_date date not null default current_date,

  -- Optional time-of-day within the entry_date, for ordering multiple sessions.
  entry_time time with time zone,

  -- Optional fields for richer context.
  title text,
  notes text,

  -- Simple 1-10 sentiment/mood score for easy statistics.
  mood_score integer check (mood_score between 1 and 10),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_entries_user_date_idx
  on public.journal_entries (user_id, entry_date desc);

create index if not exists journal_entries_workout_type_date_idx
  on public.journal_entries (workout_type_id, entry_date desc);

comment on table public.journal_entries is
  'Top-level journaling entries per athlete and day.';


-- Answers to dynamic journal questions for a given entry.
create table if not exists public.journal_entry_answers (
  id uuid primary key default gen_random_uuid(),

  entry_id uuid not null references public.journal_entries (id) on delete cascade,
  question_id uuid not null references public.journal_questions (id),

  -- Free-form text answer; the client can enforce structure if needed.
  answer_text text,

  created_at timestamptz not null default now()
);

create index if not exists journal_entry_answers_entry_idx
  on public.journal_entry_answers (entry_id);

create index if not exists journal_entry_answers_question_idx
  on public.journal_entry_answers (question_id);

comment on table public.journal_entry_answers is
  'Answers to dynamic question templates for each journal entry.';


-- Utility trigger to auto-update updated_at on journal_entries.
create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_journal_entries_updated_at on public.journal_entries;

create trigger set_journal_entries_updated_at
before update on public.journal_entries
for each row
execute procedure public.set_current_timestamp_updated_at();


