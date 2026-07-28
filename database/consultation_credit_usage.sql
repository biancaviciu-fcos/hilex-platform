create table if not exists public.consultation_credit_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  booking_id text not null,
  source text not null default 'forest-booking',
  minutes integer not null check (minutes > 0),
  created_at timestamptz not null default now(),
  unique(user_id, booking_id)
);

create index if not exists consultation_credit_usage_user_created_idx
on public.consultation_credit_usage(user_id, created_at desc);

alter table public.consultation_credit_usage enable row level security;

drop policy if exists "Users can read own consultation credit usage" on public.consultation_credit_usage;
drop policy if exists "Admins can manage consultation credit usage" on public.consultation_credit_usage;

create policy "Users can read own consultation credit usage"
on public.consultation_credit_usage for select
using (user_id = auth.uid() or public.current_user_role() in ('admin', 'owner'));

create policy "Admins can manage consultation credit usage"
on public.consultation_credit_usage for all
using (public.current_user_role() in ('admin', 'owner'))
with check (public.current_user_role() in ('admin', 'owner'));
