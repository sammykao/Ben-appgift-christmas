-- 004_rls_policies.sql
-- Strict row-level security policies for The MentalPitch schema.

-- Workout types --------------------------------------------------------------

alter table public.workout_types enable row level security;
alter table public.workout_types force row level security;

-- Everyone can read system defaults and their own custom types.
create policy "Workout types are readable per user and system"
  on public.workout_types
  for select
  using (
    owner_id is null
    or owner_id = auth.uid()
  );

-- Users can create their own custom workout types.
create policy "Users can insert their own workout types"
  on public.workout_types
  for insert
  with check (
    -- Either explicitly set to the current user, or left null for admins/system.
    owner_id = auth.uid()
    and is_system_default = false
  );

-- Users can update/delete only their own non-system types.
create policy "Users can update their own workout types"
  on public.workout_types
  for update
  using (
    owner_id = auth.uid()
    and is_system_default = false
  )
  with check (
    owner_id = auth.uid()
    and is_system_default = false
  );

create policy "Users can delete their own workout types"
  on public.workout_types
  for delete
  using (
    owner_id = auth.uid()
    and is_system_default = false
  );


-- Journal question templates -------------------------------------------------

alter table public.journal_questions enable row level security;
alter table public.journal_questions force row level security;

-- Everyone can read system default questions and their own custom questions.
create policy "Question templates are readable per user and system"
  on public.journal_questions
  for select
  using (
    owner_id is null
    or owner_id = auth.uid()
  );

-- Users can create their own question templates.
create policy "Users can insert their own question templates"
  on public.journal_questions
  for insert
  with check (
    owner_id = auth.uid()
    and is_system_default = false
  );

-- Users can update/delete only their own non-system templates.
create policy "Users can update their own question templates"
  on public.journal_questions
  for update
  using (
    owner_id = auth.uid()
    and is_system_default = false
  )
  with check (
    owner_id = auth.uid()
    and is_system_default = false
  );

create policy "Users can delete their own question templates"
  on public.journal_questions
  for delete
  using (
    owner_id = auth.uid()
    and is_system_default = false
  );


-- Journal entries ------------------------------------------------------------

alter table public.journal_entries enable row level security;
alter table public.journal_entries force row level security;

-- A user can read only their own entries.
create policy "Users can read their own journal entries"
  on public.journal_entries
  for select
  using (user_id = auth.uid());

-- A user can create entries only for themselves.
create policy "Users can insert their own journal entries"
  on public.journal_entries
  for insert
  with check (user_id = auth.uid());

-- A user can update/delete only their own entries.
create policy "Users can update their own journal entries"
  on public.journal_entries
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own journal entries"
  on public.journal_entries
  for delete
  using (user_id = auth.uid());


-- Journal entry answers ------------------------------------------------------

alter table public.journal_entry_answers enable row level security;
alter table public.journal_entry_answers force row level security;

-- Helper predicate to check entry ownership.
-- NOTE: This is written inline in policies to keep the schema simple.

-- A user can read answers only for entries they own.
create policy "Users can read answers for their own entries"
  on public.journal_entry_answers
  for select
  using (
    exists (
      select 1
      from public.journal_entries e
      where e.id = journal_entry_answers.entry_id
        and e.user_id = auth.uid()
    )
  );

-- A user can insert answers only for entries they own.
create policy "Users can insert answers for their own entries"
  on public.journal_entry_answers
  for insert
  with check (
    exists (
      select 1
      from public.journal_entries e
      where e.id = journal_entry_answers.entry_id
        and e.user_id = auth.uid()
    )
  );

-- A user can update/delete answers only for entries they own.
create policy "Users can update answers for their own entries"
  on public.journal_entry_answers
  for update
  using (
    exists (
      select 1
      from public.journal_entries e
      where e.id = journal_entry_answers.entry_id
        and e.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.journal_entries e
      where e.id = journal_entry_answers.entry_id
        and e.user_id = auth.uid()
    )
  );

create policy "Users can delete answers for their own entries"
  on public.journal_entry_answers
  for delete
  using (
    exists (
      select 1
      from public.journal_entries e
      where e.id = journal_entry_answers.entry_id
        and e.user_id = auth.uid()
    )
  );


