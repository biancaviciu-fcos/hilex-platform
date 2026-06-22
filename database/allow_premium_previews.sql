drop policy if exists "Members can read allowed published lessons" on public.lessons;

create policy "Members can read allowed published lessons"
on public.lessons for select
using (
  status = 'published'
  and auth.uid() is not null
);
