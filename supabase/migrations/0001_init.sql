-- Mango — initial schema
-- Apply via: Supabase Dashboard > SQL Editor > paste this file > Run.

create extension if not exists "pgcrypto";

-- ---------- enums ----------
do $$ begin
  create type account_stage as enum (
    'researching', 'pitched', 'approved', 'on_shelf', 'reordering', 'lost'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type interaction_type as enum (
    'email', 'call', 'meeting', 'sample', 'reorder', 'pitch', 'note', 'job_change'
  );
exception when duplicate_object then null; end $$;

-- ---------- tables ----------
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create unique index if not exists brands_owner_unique on public.brands(owner_user_id);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  banner text,
  location_text text,
  region text,
  doors_count integer not null default 1,
  stage account_stage not null default 'researching',
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists accounts_brand_idx on public.accounts(brand_id);
create index if not exists accounts_stage_idx on public.accounts(stage);

create table if not exists public.buyers (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name text not null,
  title text,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists buyers_account_idx on public.buyers(account_id);

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  buyer_id uuid references public.buyers(id) on delete set null,
  type interaction_type not null,
  occurred_at timestamptz not null default now(),
  summary text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists interactions_account_idx on public.interactions(account_id);
create index if not exists interactions_occurred_idx on public.interactions(occurred_at desc);

create table if not exists public.reorders (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  units integer,
  dollars numeric(12,2),
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists reorders_account_idx on public.reorders(account_id);
create index if not exists reorders_occurred_idx on public.reorders(occurred_at desc);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  due_date date not null,
  label text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists reminders_account_idx on public.reminders(account_id);
create index if not exists reminders_due_idx on public.reminders(due_date) where completed = false;

-- keep updated_at fresh on accounts
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists accounts_set_updated_at on public.accounts;
create trigger accounts_set_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

-- ---------- RLS ----------
alter table public.brands enable row level security;
alter table public.accounts enable row level security;
alter table public.buyers enable row level security;
alter table public.interactions enable row level security;
alter table public.reorders enable row level security;
alter table public.reminders enable row level security;

-- helper: is the calling user the owner of a given brand?
create or replace function public.is_brand_owner(b_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.brands
    where id = b_id and owner_user_id = auth.uid()
  );
$$;

-- brands
drop policy if exists "brands_select_own" on public.brands;
create policy "brands_select_own" on public.brands
  for select using (owner_user_id = auth.uid());
drop policy if exists "brands_insert_own" on public.brands;
create policy "brands_insert_own" on public.brands
  for insert with check (owner_user_id = auth.uid());
drop policy if exists "brands_update_own" on public.brands;
create policy "brands_update_own" on public.brands
  for update using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());
drop policy if exists "brands_delete_own" on public.brands;
create policy "brands_delete_own" on public.brands
  for delete using (owner_user_id = auth.uid());

-- accounts (gate on owning brand)
drop policy if exists "accounts_rw_own_brand" on public.accounts;
create policy "accounts_rw_own_brand" on public.accounts
  for all using (public.is_brand_owner(brand_id))
  with check (public.is_brand_owner(brand_id));

-- buyers / interactions / reorders / reminders gate via account -> brand
create or replace function public.account_is_mine(a_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.accounts a
    join public.brands b on b.id = a.brand_id
    where a.id = a_id and b.owner_user_id = auth.uid()
  );
$$;

drop policy if exists "buyers_rw_own" on public.buyers;
create policy "buyers_rw_own" on public.buyers
  for all using (public.account_is_mine(account_id))
  with check (public.account_is_mine(account_id));

drop policy if exists "interactions_rw_own" on public.interactions;
create policy "interactions_rw_own" on public.interactions
  for all using (public.account_is_mine(account_id))
  with check (public.account_is_mine(account_id));

drop policy if exists "reorders_rw_own" on public.reorders;
create policy "reorders_rw_own" on public.reorders
  for all using (public.account_is_mine(account_id))
  with check (public.account_is_mine(account_id));

drop policy if exists "reminders_rw_own" on public.reminders;
create policy "reminders_rw_own" on public.reminders
  for all using (public.account_is_mine(account_id))
  with check (public.account_is_mine(account_id));

-- ---------- Storage: brand-logos bucket ----------
insert into storage.buckets (id, name, public)
values ('brand-logos', 'brand-logos', true)
on conflict (id) do nothing;

drop policy if exists "brand_logos_read_all" on storage.objects;
create policy "brand_logos_read_all" on storage.objects
  for select using (bucket_id = 'brand-logos');

drop policy if exists "brand_logos_write_own" on storage.objects;
create policy "brand_logos_write_own" on storage.objects
  for insert with check (
    bucket_id = 'brand-logos'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "brand_logos_update_own" on storage.objects;
create policy "brand_logos_update_own" on storage.objects
  for update using (
    bucket_id = 'brand-logos'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "brand_logos_delete_own" on storage.objects;
create policy "brand_logos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'brand-logos'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
