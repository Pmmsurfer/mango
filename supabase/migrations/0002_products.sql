-- Mango — products (SKUs) + margin tracking on reorders
-- Apply via Supabase Dashboard > SQL Editor.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  sku text,
  upc text,
  unit_cost_cents integer not null default 0,
  wholesale_price_cents integer not null default 0,
  msrp_cents integer,
  case_pack integer not null default 12,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_brand_idx on public.products(brand_id);
create unique index if not exists products_brand_sku_unique
  on public.products(brand_id, sku) where sku is not null;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- Extend reorders to tie back to a product + snapshot cost at log time.
alter table public.reorders add column if not exists product_id uuid references public.products(id) on delete set null;
alter table public.reorders add column if not exists unit_cost_cents integer;
create index if not exists reorders_product_idx on public.reorders(product_id);

-- RLS
alter table public.products enable row level security;

drop policy if exists "products_rw_own" on public.products;
create policy "products_rw_own" on public.products
  for all using (public.is_brand_owner(brand_id))
  with check (public.is_brand_owner(brand_id));
