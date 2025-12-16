-- 006_profiles.sql
-- Per-user profiles table for The MentalPitch.
-- Stores additional athlete metadata beyond auth.users.

set check_function_bodies = off;

create table if not exists public.profiles (
  -- 1-1 with auth.users.
  id uuid primary key references auth.users (id) on delete cascade,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Basic identity
  first_name text,
  last_name text,

  -- Sport context
  preferred_sport text,
  preferred_position text
);

comment on table public.profiles is
  'Public athlete profile information for The MentalPitch.';

comment on column public.profiles.preferred_sport is
  'Primary sport the athlete plays (e.g. soccer, basketball, baseball).';

comment on column public.profiles.preferred_position is
  'Primary position within the chosen sport.';


-- Re-use generic updated_at trigger function if it already exists.
-- This will no-op if the function is absent at migration time.
do $$
begin
  perform 1
  from pg_proc
  where proname = 'set_current_timestamp_updated_at'
    and pg_function_is_visible(oid);

  if found then
    drop trigger if exists set_profiles_updated_at on public.profiles;

    create trigger set_profiles_updated_at
    before update on public.profiles
    for each row
    execute procedure public.set_current_timestamp_updated_at();
  end if;
end;
$$;


-- Row Level Security ---------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

-- Each user can see only their own profile.
create policy "Users can view their own profile"
  on public.profiles
  for select
  using (id = auth.uid());

-- Each user can create a profile row only for themselves.
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (id = auth.uid());

-- Each user can update only their own profile.
create policy "Users can update their own profile"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Optional: allow users to delete their profile record.
create policy "Users can delete their own profile"
  on public.profiles
  for delete
  using (id = auth.uid());


