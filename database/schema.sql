create extension if not exists "pgcrypto";

create type public.user_role as enum ('member', 'admin', 'owner');
create type public.access_level as enum ('basic', 'premium');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'expired', 'incomplete', 'incomplete_expired', 'unpaid', 'paused');
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.video_provider as enum ('cloudflare_stream', 'mux', 'external');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  access_level public.access_level not null,
  status public.subscription_status not null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(category_id, slug)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  body jsonb not null default '[]'::jsonb,
  key_points jsonb not null default '[]'::jsonb,
  access_level public.access_level not null default 'basic',
  status public.content_status not null default 'draft',
  duration_minutes integer,
  thumbnail_url text,
  video_provider public.video_provider,
  video_asset_id text,
  video_playback_id text,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  resource_type text not null check (resource_type in ('pdf', 'link')),
  url text not null,
  access_level public.access_level not null default 'basic',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.video_uploads (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  provider public.video_provider not null,
  provider_upload_id text,
  provider_asset_id text,
  status text not null default 'created',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lessons_category_idx on public.lessons(category_id);
create index lessons_subcategory_idx on public.lessons(subcategory_id);
create index lessons_access_status_idx on public.lessons(access_level, status);
create index subscriptions_user_status_idx on public.subscriptions(user_id, status);

insert into public.categories (name, slug, description, sort_order) values
('Dreptul Familiei', 'dreptul-familiei', 'Divort, copii, acord parental si aranjamente familiale.', 1),
('Drept Civil', 'drept-civil', 'Contracte, datorii, proprietate, raspundere si litigii civile.', 2),
('Imigratie', 'imigratie', 'Vize, cetatenie, statut, familie si aplicatii in UK.', 3),
('Drept Penal', 'drept-penal', 'Cazier, acuzatii, proceduri si efecte juridice.', 4);

insert into storage.buckets (id, name, public)
values ('lesson-resources', 'lesson-resources', false)
on conflict (id) do nothing;
