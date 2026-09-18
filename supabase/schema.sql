-- Sketchbook Prompt Generator — shared (2-person) backend schema.
--
-- Run this once in your Supabase project's SQL Editor (Dashboard ->
-- SQL Editor -> New query -> paste all of this -> Run).
--
-- Design: both signed-in users can READ every row in every table (that's
-- the "shared" part), but can only INSERT/DELETE their OWN rows (enforced
-- by Row Level Security below, not just by the app's UI). The "username"
-- column is copied onto each row at write time from the person's session,
-- so the app never needs to look up who's who.

create extension if not exists pgcrypto with schema extensions;

-- ---------- Tables ----------

create table if not exists public.prompt_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  text text not null,
  created_at timestamptz not null default now(),
  unique (user_id, text)
);

create table if not exists public.practice_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  text text not null,
  sketch_date date not null,
  photo_path text,
  created_at timestamptz not null default now()
);

create index if not exists prompt_history_created_at_idx on public.prompt_history (created_at desc);
create index if not exists practice_log_created_at_idx on public.practice_log (created_at desc);
create index if not exists practice_log_sketch_date_idx on public.practice_log (sketch_date);

-- ---------- Row Level Security ----------

alter table public.prompt_history enable row level security;
alter table public.favorites enable row level security;
alter table public.practice_log enable row level security;

create policy "history: read all" on public.prompt_history
  for select using (auth.role() = 'authenticated');
create policy "history: insert own" on public.prompt_history
  for insert with check (auth.uid() = user_id);
create policy "history: delete own" on public.prompt_history
  for delete using (auth.uid() = user_id);

create policy "favorites: read all" on public.favorites
  for select using (auth.role() = 'authenticated');
create policy "favorites: insert own" on public.favorites
  for insert with check (auth.uid() = user_id);
create policy "favorites: delete own" on public.favorites
  for delete using (auth.uid() = user_id);

create policy "practice: read all" on public.practice_log
  for select using (auth.role() = 'authenticated');
create policy "practice: insert own" on public.practice_log
  for insert with check (auth.uid() = user_id);
create policy "practice: delete own" on public.practice_log
  for delete using (auth.uid() = user_id);

-- ---------- Storage (sketch photos) ----------

insert into storage.buckets (id, name, public)
values ('sketches', 'sketches', false)
on conflict (id) do nothing;

-- Photos are uploaded under "<user_id>/<filename>", so the first path
-- segment doubles as an ownership check: you can only write into your own
-- folder, but either of you can read anything in the bucket, since the
-- practice log itself is shared.
create policy "sketches: read all" on storage.objects
  for select using (bucket_id = 'sketches' and auth.role() = 'authenticated');
create policy "sketches: insert own folder" on storage.objects
  for insert with check (
    bucket_id = 'sketches'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "sketches: delete own folder" on storage.objects
  for delete using (
    bucket_id = 'sketches'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------- Realtime ----------
-- Lets the app subscribe to live inserts/deletes so both people see each
-- other's new prompts/favorites/sketches without refreshing.

alter publication supabase_realtime add table public.prompt_history;
alter publication supabase_realtime add table public.favorites;
alter publication supabase_realtime add table public.practice_log;
