alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_resources enable row level security;
alter table public.video_uploads enable row level security;
alter table public.favorite_lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.lesson_views enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_access_level()
returns public.access_level
language sql
security definer
set search_path = public
as $$
  select access_level
  from public.subscriptions
  where user_id = auth.uid()
    and status in ('active', 'trialing')
    and (current_period_end is null or current_period_end > now())
  order by case when access_level = 'premium' then 1 else 2 end
  limit 1;
$$;

create policy "Users can read own profile"
on public.profiles for select
using (id = auth.uid() or public.current_user_role() in ('admin', 'owner'));

create policy "Users can read own subscriptions"
on public.subscriptions for select
using (user_id = auth.uid() or public.current_user_role() in ('admin', 'owner'));

create policy "Members can read categories"
on public.categories for select
using (auth.uid() is not null);

create policy "Members can read subcategories"
on public.subcategories for select
using (auth.uid() is not null);

create policy "Members can read allowed published lessons"
on public.lessons for select
using (
  status = 'published'
  and auth.uid() is not null
);

create policy "Admins can manage lessons"
on public.lessons for all
using (public.current_user_role() in ('admin', 'owner'))
with check (public.current_user_role() in ('admin', 'owner'));

create policy "Members can read allowed resources"
on public.lesson_resources for select
using (
  auth.uid() is not null
  and (
    access_level = 'basic'
    or public.current_access_level() = 'premium'
  )
);

create policy "Users can manage own favorite lessons"
on public.favorite_lessons for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can manage own lesson progress"
on public.lesson_progress for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can manage own lesson views"
on public.lesson_views for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Admins can manage resources"
on public.lesson_resources for all
using (public.current_user_role() in ('admin', 'owner'))
with check (public.current_user_role() in ('admin', 'owner'));

create policy "Admins can manage video uploads"
on public.video_uploads for all
using (public.current_user_role() in ('admin', 'owner'))
with check (public.current_user_role() in ('admin', 'owner'));

create policy "Members can read lesson resource files"
on storage.objects for select
using (
  bucket_id = 'lesson-resources'
  and auth.uid() is not null
);

create policy "Admins can manage lesson resource files"
on storage.objects for all
using (
  bucket_id = 'lesson-resources'
  and public.current_user_role() in ('admin', 'owner')
)
with check (
  bucket_id = 'lesson-resources'
  and public.current_user_role() in ('admin', 'owner')
);
