insert into storage.buckets (id, name, public)
values ('lesson-resources', 'lesson-resources', false)
on conflict (id) do nothing;

drop policy if exists "Members can read lesson resource files" on storage.objects;
drop policy if exists "Admins can manage lesson resource files" on storage.objects;

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
