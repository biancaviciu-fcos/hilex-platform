do $$
begin
  create type public.lesson_platform as enum ('essential', 'premium');
exception
  when duplicate_object then null;
end $$;

alter table public.lessons
add column if not exists platform public.lesson_platform not null default 'premium';

update public.lessons
set platform = 'premium'
where platform is null;

create index if not exists lessons_platform_status_idx on public.lessons(platform, status);
