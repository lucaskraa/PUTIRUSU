-- PUTIRUSU — Parte 1: fundação de dados
-- Execute em um projeto Supabase exclusivo do PUTIRUSU.
-- Todas as tabelas abaixo são privadas por usuário e protegidas com RLS.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  current_level text not null default 'A1'
    check (current_level in ('A1','A2','B1','B2','C1','C2')),
  daily_goal_minutes smallint not null default 20
    check (daily_goal_minutes between 5 and 180),
  preferred_voice text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learner_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp bigint not null default 0 check (xp >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  lessons_completed integer not null default 0 check (lessons_completed >= 0),
  current_unit_id text,
  current_lesson_id text,
  last_study_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_mastery (
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_code text not null,
  mastery smallint not null default 0 check (mastery between 0 and 100),
  attempts integer not null default 0 check (attempts >= 0),
  correct_attempts integer not null default 0 check (correct_attempts >= 0),
  last_practiced_at timestamptz,
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, skill_code)
);

create table if not exists public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_id text,
  lesson_id text,
  exercise_id text not null,
  modality text not null
    check (modality in ('reading','writing','listening','speaking','grammar','vocabulary','conversation')),
  answer jsonb not null default '{}'::jsonb,
  score numeric(5,2) check (score between 0 and 100),
  feedback jsonb not null default '{}'::jsonb,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  unit_id text,
  lesson_id text,
  exercise_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null default 'learning',
  memory_key text not null,
  content text not null,
  importance smallint not null default 1 check (importance between 1 and 5),
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, scope, memory_key)
);

create index if not exists exercise_attempts_user_created_idx
  on public.exercise_attempts (user_id, created_at desc);

create index if not exists learning_events_user_created_idx
  on public.learning_events (user_id, created_at desc);

create index if not exists skill_mastery_review_idx
  on public.skill_mastery (user_id, next_review_at);

create index if not exists ai_memories_user_scope_idx
  on public.ai_memories (user_id, scope);

alter table public.profiles enable row level security;
alter table public.learner_progress enable row level security;
alter table public.skill_mastery enable row level security;
alter table public.exercise_attempts enable row level security;
alter table public.learning_events enable row level security;
alter table public.ai_memories enable row level security;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.learner_progress to authenticated;
grant select, insert, update, delete on public.skill_mastery to authenticated;
grant select, insert, update, delete on public.exercise_attempts to authenticated;
grant select, insert, update, delete on public.learning_events to authenticated;
grant select, insert, update, delete on public.ai_memories to authenticated;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "progress_select_own"
  on public.learner_progress for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "progress_insert_own"
  on public.learner_progress for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "progress_update_own"
  on public.learner_progress for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "skill_mastery_select_own"
  on public.skill_mastery for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "skill_mastery_insert_own"
  on public.skill_mastery for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "skill_mastery_update_own"
  on public.skill_mastery for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "attempts_select_own"
  on public.exercise_attempts for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "attempts_insert_own"
  on public.exercise_attempts for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "events_select_own"
  on public.learning_events for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "events_insert_own"
  on public.learning_events for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "ai_memories_select_own"
  on public.ai_memories for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "ai_memories_insert_own"
  on public.ai_memories for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "ai_memories_update_own"
  on public.ai_memories for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "ai_memories_delete_own"
  on public.ai_memories for delete
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
