create table if not exists public.favorite_lessons (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index if not exists favorite_lessons_lesson_idx on public.favorite_lessons(lesson_id);

alter table public.favorite_lessons enable row level security;

drop policy if exists "Users can manage own favorite lessons" on public.favorite_lessons;

create policy "Users can manage own favorite lessons"
on public.favorite_lessons for all
using (user_id = auth.uid())
with check (user_id = auth.uid());
