create table if not exists public.lesson_views (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index if not exists lesson_views_viewed_idx on public.lesson_views(user_id, viewed_at desc);
create index if not exists lesson_views_lesson_idx on public.lesson_views(lesson_id);

alter table public.lesson_views enable row level security;

drop policy if exists "Users can manage own lesson views" on public.lesson_views;

create policy "Users can manage own lesson views"
on public.lesson_views for all
using (user_id = auth.uid())
with check (user_id = auth.uid());
