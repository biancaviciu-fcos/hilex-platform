alter table public.lessons
add column if not exists extra_info jsonb not null default '[]'::jsonb;
