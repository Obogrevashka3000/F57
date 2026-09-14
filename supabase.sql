-- F57 / SUPABASE DATABASE
-- Run this whole file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  product_id text not null,
  product_name text not null,
  category text not null,
  size_code text not null check (size_code in ('S','M','L')),
  size_name text not null,
  task text not null,
  ooc_id varchar(3) not null check (ooc_id ~ '^[0-9]{2,3}$'),
  point jsonb not null,
  status text not null default 'WAITING' check (status in ('WAITING','REVIEW','APPROVED','REJECTED','DELIVERED')),
  client_note text,
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);

create or replace function public.is_f57_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_f57_admin() from public;
grant execute on function public.is_f57_admin() to authenticated;

alter table public.orders enable row level security;
alter table public.admins enable row level security;

-- Public visitors can create an RP order, but cannot read the order table.
drop policy if exists "orders_public_insert" on public.orders;
create policy "orders_public_insert"
on public.orders
for insert
to anon, authenticated
with check (
  char_length(id) between 8 and 32
  and char_length(product_id) between 1 and 80
  and char_length(product_name) between 1 and 160
  and char_length(category) between 1 and 100
  and size_code in ('S','M','L')
  and char_length(size_name) between 1 and 40
  and char_length(task) between 1 and 1000
  and ooc_id ~ '^[0-9]{2,3}$'
  and point ? 'nx'
  and point ? 'ny'
);

-- Only users explicitly listed in admins can see/update orders.
drop policy if exists "orders_admin_select" on public.orders;
create policy "orders_admin_select"
on public.orders
for select
to authenticated
using (public.is_f57_admin());

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update"
on public.orders
for update
to authenticated
using (public.is_f57_admin())
with check (public.is_f57_admin());

-- No public access to the admins table.
drop policy if exists "admins_self_select" on public.admins;
create policy "admins_self_select"
on public.admins
for select
to authenticated
using (user_id = auth.uid());

-- Keep updated_at current.
create or replace function public.touch_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
before update on public.orders
for each row execute function public.touch_orders_updated_at();

-- Enable Realtime for the admin panel.
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then
  null;
end $$;
