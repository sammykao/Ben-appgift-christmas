-- 008_food_meals.sql
-- Structured meal logging for Food workout type.

set check_function_bodies = off;


-- Meal type enum -------------------------------------------------------------

-- Create enum type for meal categories if it does not already exist.
do $$
begin
  if not exists (
    select 1
    from pg_type t
    where t.typname = 'meal_type_enum'
  ) then
    create type meal_type_enum as enum ('Breakfast', 'Lunch', 'Snack', 'Dinner');
  end if;
end;
$$;


-- Food meals table -----------------------------------------------------------

create table if not exists public.food_meals (
  id uuid primary key default gen_random_uuid(),

  -- Parent journal entry (should have workout_type = 'Food').
  entry_id uuid not null
    references public.journal_entries (id)
    on delete cascade,

  meal_type meal_type_enum not null,

  -- Time the meal was consumed within the day.
  time_of_day time with time zone not null,

  -- What was eaten.
  food_items text not null,

  -- Optional feelings/notes about the meal (primarily used for dinner).
  feeling_notes text,

  created_at timestamptz not null default now()
);

create index if not exists food_meals_entry_idx
  on public.food_meals (entry_id);

comment on table public.food_meals is
  'Per-meal records attached to a Food journal entry (Breakfast, Lunch, Snack, Dinner).';
