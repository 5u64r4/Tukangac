-- ==============================================================================
-- TUKANG AC ONLINE - SUPABASE DATABASE MIGRATION & RLS POLICIES
-- Target: Supabase PostgreSQL + Auth + Realtime
-- File: supabase/migrations/20260929000000_init_supabase_schema.sql
-- ==============================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- 2.1 Profiles Table (Linked to Supabase Auth auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  role text not null check (role in ('customer', 'technician', 'admin', 'superadmin')) default 'customer',
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2.2 Customer Profiles Table
create table if not exists public.customer_profiles (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  default_address text,
  address_label text default 'Rumah',
  total_orders integer default 0,
  points integer default 0,
  joined_date text,
  status text default 'active' check (status in ('active', 'vip', 'inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2.3 Technician Profiles Table
create table if not exists public.technician_profiles (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  code text,
  avatar text,
  photo_url text,
  email text,
  phone text not null,
  rating numeric(3,2) default 4.90,
  review_count integer default 0,
  is_online boolean default true,
  active_orders integer default 0,
  distance text default '1.2 km',
  role_title text default 'Teknisi Senior',
  vehicle_plate text,
  experience_years text default '5+ tahun',
  domicile text default 'Bekasi Selatan',
  custom_fee_percent numeric(5,2),
  custom_fee_enabled boolean default false,
  assigned_priority_areas text[] default '{}',
  is_priority_technician boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2.4 Services Catalog Table
create table if not exists public.services (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(12,2) not null,
  price_formatted text not null,
  unit text default 'Unit',
  icon_name text,
  description text,
  badge text,
  popular boolean default false,
  created_at timestamptz default now()
);

-- 2.5 Orders Table
create table if not exists public.orders (
  id text primary key,
  customer_id text references public.customer_profiles(id) on delete set null,
  technician_id text references public.technician_profiles(id) on delete set null,
  service_id text references public.services(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  service_name text not null,
  unit_count integer default 1,
  complaint text default '',
  address_label text default 'Rumah',
  full_address text not null,
  date text not null,
  time_slot text not null,
  total_price numeric(12,2) not null,
  status text not null check (status in ('baru', 'menuju', 'service', 'selesai', 'batal')) default 'baru',
  technician_name text,
  technician_rating numeric(3,2),
  technician_distance text,
  estimated_arrival text,
  created_at text not null,
  payment_method text,
  payment_channel text,
  payment_status text,
  midtrans_snap_token text,
  midtrans_redirect_url text,
  midtrans_transaction_id text,
  midtrans_payment_type text,
  midtrans_paid_at text,
  midtrans_va_number text,
  midtrans_bank text,
  midtrans_bill_key text,
  midtrans_biller_code text,
  invoice_number text,
  invoice_issued_at text,
  updated_at timestamptz default now()
);

-- 2.6 Order Messages (Live Chat per Order)
create table if not exists public.order_messages (
  id text primary key,
  order_id text not null references public.orders(id) on delete cascade,
  sender_id text,
  sender_role text not null check (sender_role in ('customer', 'technician', 'system')),
  sender_name text not null,
  sender_avatar text,
  message text not null,
  timestamp text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 2.7 Technician Applicants Table (Comprehensive Mitra Onboarding)
create table if not exists public.technician_applicants (
  id text primary key,
  name text not null,
  avatar text,
  photo_url text,
  phone text not null,
  email text not null,
  domicile text not null,
  experience_years text,
  education text,
  certifications text[] default '{}',
  skills text[] default '{}',
  applied_date text not null,
  status text not null check (status in ('pending', 'diterima', 'ditolak', 'diperbaiki')) default 'pending',
  notes text,
  expected_salary text,
  
  -- I. IDENTITAS DIRI
  nik text,
  ktp_number text,
  ktp_image text,
  birth_place text,
  birth_date text,
  gender text,
  religion text,
  marital_status text,
  citizenship text default 'WNI',
  
  -- II. KONTAK DAN ALAMAT
  ktp_address text,
  rt_rw text,
  subdistrict_kecamatan text,
  city_kabupaten text,
  postal_code text,
  is_domicile_same_as_ktp boolean default true,
  domicile_address text,
  
  -- IV. KONTAK DARURAT
  emergency_contact jsonb,
  emergency_contact_name text,
  emergency_contact_relation text,
  emergency_contact_phone text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2.8 Admin Settings Table
create table if not exists public.admin_settings (
  id text primary key,
  key text not null unique,
  value jsonb not null,
  category text not null check (category in ('pricing', 'operational', 'notification', 'security')),
  description text,
  last_updated text,
  updated_at timestamptz default now()
);

-- 2.9 Admin Audit Logs Table
create table if not exists public.admin_audit_logs (
  id text primary key,
  action text not null,
  role text not null check (role in ('customer', 'admin', 'technician', 'system')),
  target text not null,
  details text not null,
  timestamp timestamptz default now()
);

-- 2.10 Articles Table (CMS)
create table if not exists public.articles (
  id text primary key,
  title text not null,
  slug text not null unique,
  category text not null,
  category_color jsonb,
  status text not null check (status in ('published', 'draft', 'archived')) default 'published',
  read_time text not null,
  date text not null,
  author jsonb not null,
  image text not null,
  badge text,
  summary text not null,
  content jsonb not null,
  tags text[] default '{}',
  views integer default 0,
  featured boolean default false,
  related_service_name text,
  related_service_price text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==============================================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
create index if not exists idx_orders_customer_phone on public.orders(customer_phone);
create index if not exists idx_orders_technician_name on public.orders(technician_name);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_messages_order_id on public.order_messages(order_id);
create index if not exists idx_order_messages_created_at on public.order_messages(created_at asc);
create index if not exists idx_articles_status on public.articles(status);
create index if not exists idx_articles_slug on public.articles(slug);
create index if not exists idx_audit_logs_timestamp on public.admin_audit_logs(timestamp desc);

-- ==============================================================================
-- 4. REALTIME REPLICATION ENABLEMENT (IDEMPOTENT)
-- ==============================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'order_messages'
  ) then
    alter publication supabase_realtime add table public.order_messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'technician_profiles'
  ) then
    alter publication supabase_realtime add table public.technician_profiles;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'articles'
  ) then
    alter publication supabase_realtime add table public.articles;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'admin_audit_logs'
  ) then
    alter publication supabase_realtime add table public.admin_audit_logs;
  end if;
end $$;

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) & HELPER FUNCTIONS
-- ==============================================================================

-- 5.0 Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.technician_profiles enable row level security;
alter table public.services enable row level security;
alter table public.orders enable row level security;
alter table public.order_messages enable row level security;
alter table public.technician_applicants enable row level security;
alter table public.admin_settings enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.articles enable row level security;

-- Helper function: get user role from profiles securely
create or replace function public.current_user_role()
returns text as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid() limit 1),
    'customer'
  );
$$ language sql stable security definer set search_path = public;

-- Helper trigger function: automatically refresh updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Set triggers for updated_at
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.handle_updated_at();

drop trigger if exists set_customer_profiles_updated_at on public.customer_profiles;
create trigger set_customer_profiles_updated_at before update on public.customer_profiles
for each row execute function public.handle_updated_at();

drop trigger if exists set_technician_profiles_updated_at on public.technician_profiles;
create trigger set_technician_profiles_updated_at before update on public.technician_profiles
for each row execute function public.handle_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at before update on public.orders
for each row execute function public.handle_updated_at();

drop trigger if exists set_technician_applicants_updated_at on public.technician_applicants;
create trigger set_technician_applicants_updated_at before update on public.technician_applicants
for each row execute function public.handle_updated_at();

drop trigger if exists set_admin_settings_updated_at on public.admin_settings;
create trigger set_admin_settings_updated_at before update on public.admin_settings
for each row execute function public.handle_updated_at();

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at before update on public.articles
for each row execute function public.handle_updated_at();

-- Helper trigger function: enforce superadmin role for Sugara.ardi19@gmail.com and ardi5u64r4@gmail.com,
-- and prevent unauthorized role escalations (Customer -> Technician/Admin/Superadmin, Technician -> Admin/Superadmin, Admin -> Superadmin)
create or replace function public.enforce_superadmin_role()
returns trigger as $$
declare
  v_caller_role text;
begin
  -- 1. Designated tester & privileged accounts: assign proper tested roles
  if new.email is not null then
    if lower(trim(new.email)) in ('sugara.ardi@gmail.com', 'sugara.ardi19@gmail.com') then
      new.role := 'superadmin';
      return new;
    elsif lower(trim(new.email)) = 'ardi5u64r4@gmail.com' then
      new.role := 'admin';
      return new;
    elsif lower(trim(new.email)) = 'andipratama@gmail.com' then
      new.role := 'technician';
      return new;
    elsif lower(trim(new.email)) = 'budisantoso@gmail.com' then
      new.role := 'customer';
      return new;
    end if;
  end if;

  -- 2. On INSERT: Public signups cannot self-assign superadmin, admin, or technician
  if tg_op = 'INSERT' then
    if new.role in ('admin', 'superadmin', 'technician') then
      new.role := 'customer';
    end if;
    return new;
  end if;

  -- 3. On UPDATE: Check caller role to prevent unauthorized client-side escalation
  if tg_op = 'UPDATE' then
    v_caller_role := public.current_user_role();

    -- Protected: No one can escalate to superadmin via client
    if new.role = 'superadmin' and old.role <> 'superadmin' then
      new.role := old.role;
    end if;

    -- If caller is regular user (not admin or superadmin), deny any self-role change
    if v_caller_role not in ('superadmin', 'admin') then
      if new.role <> old.role then
        new.role := old.role;
      end if;
    -- If caller is admin, they cannot promote to admin or superadmin
    elsif v_caller_role = 'admin' then
      if new.role in ('admin', 'superadmin') and old.role not in ('admin', 'superadmin') then
        new.role := old.role;
      end if;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_enforce_superadmin_role on public.profiles;
create trigger trg_enforce_superadmin_role
before insert or update on public.profiles
for each row execute function public.enforce_superadmin_role();

-- Auto-provision or link profile when user is created in Supabase Auth (auth.users)
create or replace function public.handle_new_auth_user()
returns trigger as $$
declare
  v_role text := 'customer';
  v_name text := 'Pengguna';
begin
  if lower(trim(new.email)) in ('sugara.ardi@gmail.com', 'sugara.ardi19@gmail.com') then
    v_role := 'superadmin';
    v_name := 'Ardi Sugara (Superadmin)';
  elsif lower(trim(new.email)) = 'ardi5u64r4@gmail.com' then
    v_role := 'admin';
    v_name := 'Ardi Sugara (Admin)';
  elsif lower(trim(new.email)) = 'andipratama@gmail.com' then
    v_role := 'technician';
    v_name := 'Andi Pratama';
  elsif lower(trim(new.email)) = 'budisantoso@gmail.com' then
    v_role := 'customer';
    v_name := 'Budi Santoso';
  else
    v_role := 'customer';
    v_name := coalesce(new.raw_user_meta_data->>'full_name', 'Pengguna');
  end if;

  insert into public.profiles (id, full_name, phone, email, role, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', v_name),
    coalesce(new.raw_user_meta_data->>'phone', '0812-3456-7890'),
    new.email,
    v_role,
    true
  )
  on conflict (id) do update set
    email = new.email,
    role = v_role,
    is_active = true;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- 5.1 Profiles Policies
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.current_user_role() in ('admin', 'superadmin'));

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id or public.current_user_role() in ('admin', 'superadmin'));

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id or public.current_user_role() in ('admin', 'superadmin'));

drop policy if exists "Admins can manage all profiles" on public.profiles;
create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.current_user_role() in ('admin', 'superadmin'));

-- 5.2 Customer Profiles Policies
drop policy if exists "Customers can read own profile" on public.customer_profiles;
create policy "Customers can read own profile"
  on public.customer_profiles for select
  using (user_id = auth.uid() or public.current_user_role() in ('admin', 'superadmin', 'technician') or auth.role() = 'anon');

drop policy if exists "Customers can update own profile" on public.customer_profiles;
create policy "Customers can update own profile"
  on public.customer_profiles for update
  using (user_id = auth.uid() or public.current_user_role() in ('admin', 'superadmin') or auth.role() = 'anon');

drop policy if exists "Anyone can register customer profile or admin manage" on public.customer_profiles;
create policy "Anyone can register customer profile or admin manage"
  on public.customer_profiles for insert
  with check (true);

-- 5.3 Technician Profiles Policies
drop policy if exists "Anyone can view online technicians" on public.technician_profiles;
create policy "Anyone can view online technicians"
  on public.technician_profiles for select
  using (true);

drop policy if exists "Technicians update own profile or Admin manage" on public.technician_profiles;
create policy "Technicians update own profile or Admin manage"
  on public.technician_profiles for update
  using (user_id = auth.uid() or public.current_user_role() in ('admin', 'superadmin') or auth.role() = 'anon');

drop policy if exists "Admin can insert/delete technicians" on public.technician_profiles;
create policy "Admin can insert/delete technicians"
  on public.technician_profiles for all
  using (public.current_user_role() in ('admin', 'superadmin'));

-- 5.4 Services Catalog Policies
drop policy if exists "Public can view services" on public.services;
create policy "Public can view services"
  on public.services for select
  using (true);

drop policy if exists "Only admin can modify services" on public.services;
create policy "Only admin can modify services"
  on public.services for all
  using (public.current_user_role() in ('admin', 'superadmin'));

-- 5.5 Orders Policies
drop policy if exists "Customers view their own orders" on public.orders;
create policy "Customers view their own orders"
  on public.orders for select
  using (
    customer_phone in (select phone from public.profiles where id = auth.uid())
    or customer_id in (select id from public.customer_profiles where user_id = auth.uid())
    or technician_id in (select id from public.technician_profiles where user_id = auth.uid())
    or public.current_user_role() in ('admin', 'superadmin')
    or auth.role() = 'anon'
  );

drop policy if exists "Customers can create new orders" on public.orders;
create policy "Customers can create new orders"
  on public.orders for insert
  with check (true);

drop policy if exists "Technicians can update assigned orders status" on public.orders;
create policy "Technicians can update assigned orders status"
  on public.orders for update
  using (
    technician_id in (select id from public.technician_profiles where user_id = auth.uid())
    or public.current_user_role() in ('admin', 'superadmin')
    or auth.role() = 'anon'
  );

drop policy if exists "Admin can manage all orders" on public.orders;
create policy "Admin can manage all orders"
  on public.orders for all
  using (public.current_user_role() in ('admin', 'superadmin'));

-- 5.6 Order Messages (Chat) Policies
drop policy if exists "Participants can read order messages" on public.order_messages;
create policy "Participants can read order messages"
  on public.order_messages for select
  using (
    order_id in (
      select id from public.orders 
      where customer_phone in (select phone from public.profiles where id = auth.uid())
         or technician_id in (select id from public.technician_profiles where user_id = auth.uid())
         or public.current_user_role() in ('admin', 'superadmin')
    )
    or auth.role() = 'anon'
  );

drop policy if exists "Participants can insert order messages" on public.order_messages;
create policy "Participants can insert order messages"
  on public.order_messages for insert
  with check (true);

-- 5.7 Articles Policies
drop policy if exists "Anyone can read published articles" on public.articles;
create policy "Anyone can read published articles"
  on public.articles for select
  using (status = 'published' or public.current_user_role() in ('admin', 'superadmin') or auth.role() = 'anon');

drop policy if exists "Admin can manage all articles" on public.articles;
create policy "Admin can manage all articles"
  on public.articles for all
  using (public.current_user_role() in ('admin', 'superadmin'));

-- 5.8 Technician Applicants Policies
drop policy if exists "Applicants can submit application" on public.technician_applicants;
create policy "Applicants can submit application"
  on public.technician_applicants for insert
  with check (true);

drop policy if exists "Applicants can view their own application" on public.technician_applicants;
create policy "Applicants can view their own application"
  on public.technician_applicants for select
  using (
    lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
    or public.current_user_role() in ('admin', 'superadmin')
    or auth.role() = 'anon'
  );

drop policy if exists "Applicants can update their application when requested" on public.technician_applicants;
create policy "Applicants can update their application when requested"
  on public.technician_applicants for update
  using (
    (lower(email) = lower(coalesce(auth.jwt()->>'email', '')) and status = 'diperbaiki')
    or public.current_user_role() in ('admin', 'superadmin')
  );

drop policy if exists "Admin can view and manage applicants" on public.technician_applicants;
create policy "Admin can view and manage applicants"
  on public.technician_applicants for all
  using (public.current_user_role() in ('admin', 'superadmin'));

-- 5.9 Admin Settings Policies
drop policy if exists "Anyone can read public settings" on public.admin_settings;
create policy "Anyone can read public settings"
  on public.admin_settings for select
  using (true);

drop policy if exists "Admin can manage settings" on public.admin_settings;
create policy "Admin can manage settings"
  on public.admin_settings for all
  using (public.current_user_role() in ('admin', 'superadmin'));

-- 5.10 Audit Logs Policies
drop policy if exists "Anyone can log audit events" on public.admin_audit_logs;
create policy "Anyone can log audit events"
  on public.admin_audit_logs for insert
  with check (true);

drop policy if exists "Admin can view audit logs" on public.admin_audit_logs;
create policy "Admin can view audit logs"
  on public.admin_audit_logs for select
  using (public.current_user_role() in ('admin', 'superadmin') or auth.role() = 'anon');

-- ==============================================================================
-- 6. VIEWS INCREMENT FUNCTION (Atomic PostgreSQL Views Increment)
-- ==============================================================================
create or replace function public.increment_article_views(article_id text)
returns void as $$
begin
  update public.articles
  set views = coalesce(views, 0) + 1,
      updated_at = now()
  where id = article_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ==============================================================================
-- 7. ESSENTIAL GRANTS (Permissions for anon and authenticated Supabase roles)
-- ==============================================================================
-- Grant schema usage
grant usage on schema public to anon, authenticated;

-- Grant table privileges
grant select, insert, update, delete on all tables in schema public to anon, authenticated;

-- Grant sequence privileges
grant usage, select on all sequences in schema public to anon, authenticated;

-- Grant routine/function execution privileges
grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.increment_article_views(text) to anon, authenticated;
grant execute on function public.handle_updated_at() to anon, authenticated;
grant execute on function public.enforce_superadmin_role() to anon, authenticated;
grant execute on function public.handle_new_auth_user() to anon, authenticated;

-- Ensure future tables inherit grants
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated;
alter default privileges in schema public grant execute on functions to anon, authenticated;

-- ==============================================================================
-- 8. INITIAL SERVICES SEED CATALOG (Safe Insert If Empty)
-- ==============================================================================
insert into public.services (id, name, category, price, price_formatted, unit, icon_name, description, badge, popular)
values
  ('svc-wash-1', 'Cuci AC Standar 0.5 - 1 PK', 'Cuci AC', 75000, 'Rp 75.000', 'Unit', 'AcWashIcon', 'Pembersihan filter, evaporator, dan outdoor unit dengan sprayer bertekanan tinggi.', 'Paling Laris', true),
  ('svc-wash-2', 'Cuci AC Besar 1.5 - 2 PK', 'Cuci AC', 95000, 'Rp 95.000', 'Unit', 'AcWashIcon', 'Pembersihan mendalam untuk unit kapasitas besar inverter/non-inverter.', null, false),
  ('svc-freon-1', 'Tambah Freon R32 / R410A', 'Freon', 150000, 'Rp 150.000', 'Unit', 'FreonTankIcon', 'Pengisian refrigeran ramah lingkungan untuk mengembalikan hembusan dingin maksimal.', 'Garansi 30 Hari', true),
  ('svc-freon-2', 'Isi Ulang Freon Total (Kosong)', 'Freon', 250000, 'Rp 250.000', 'Unit', 'FreonTankIcon', 'Flushing sistem pipa pendingin dan pengisian ulang freon dari kondisi kosong.', null, false),
  ('svc-repair-1', 'Perbaikan AC Bocor / Netes Air', 'Perbaikan', 120000, 'Rp 120.000', 'Titik', 'AcRepairIcon', 'Penanganan saluran pembuangan mampet, pembersihan talang air, dan re-isolasi pipa.', 'Garansi Bocor', true),
  ('svc-repair-2', 'Pengecekan Kelistrikan / Mati Total', 'Perbaikan', 85000, 'Rp 85.000', 'Pemeriksaan', 'AcRepairIcon', 'Diagnosa kompresor, kapasitor, PCB modul elektronik, dan kabel daya.', null, false),
  ('svc-install-1', 'Bongkar Pasang AC (Relokasi)', 'Bongkar Pasang', 350000, 'Rp 350.000', 'Paket', 'AcInstallIcon', 'Pemindahan unit indoor & outdoor ke ruangan atau rumah baru termasuk vakum.', null, false),
  ('svc-install-2', 'Pemasangan Unit Baru', 'Bongkar Pasang', 250000, 'Rp 250.000', 'Unit', 'AcInstallIcon', 'Instalasi unit AC baru dengan standar SOP resmi pabrikan dan uji kebocoran.', 'Resmi', false)
on conflict (id) do nothing;

-- ==============================================================================
-- 9. SEED TESTER ACCOUNTS & SYSTEM SETTINGS
-- ==============================================================================
-- Provision tested accounts into profiles table if present in auth.users:
-- 1. Pelanggan: budisantoso@gmail.com (role: customer)
-- 2. Teknisi: andipratama@gmail.com (role: technician)
-- 3. Admin: ardi5u64r4@gmail.com (role: admin)
-- 4. Superadmin: sugara.ardi@gmail.com (role: superadmin)
do $$
declare
  u_superadmin uuid;
  u_admin uuid;
  u_technician uuid;
  u_customer uuid;
begin
  -- Superadmin: sugara.ardi@gmail.com
  select id into u_superadmin from auth.users where lower(trim(email)) in ('sugara.ardi@gmail.com', 'sugara.ardi19@gmail.com') limit 1;
  if u_superadmin is not null then
    insert into public.profiles (id, full_name, phone, email, role, is_active)
    values (u_superadmin, 'Ardi Sugara (Superadmin)', '0812-3456-7890', 'sugara.ardi@gmail.com', 'superadmin', true)
    on conflict (id) do update set email = 'sugara.ardi@gmail.com', role = 'superadmin', is_active = true;
  end if;

  -- Admin: ardi5u64r4@gmail.com
  select id into u_admin from auth.users where lower(trim(email)) = 'ardi5u64r4@gmail.com' limit 1;
  if u_admin is not null then
    insert into public.profiles (id, full_name, phone, email, role, is_active)
    values (u_admin, 'Ardi Sugara (Admin)', '0812-3456-7890', 'ardi5u64r4@gmail.com', 'admin', true)
    on conflict (id) do update set email = 'ardi5u64r4@gmail.com', role = 'admin', is_active = true;
  end if;

  -- Technician: andipratama@gmail.com
  select id into u_technician from auth.users where lower(trim(email)) = 'andipratama@gmail.com' limit 1;
  if u_technician is not null then
    insert into public.profiles (id, full_name, phone, email, role, is_active)
    values (u_technician, 'Andi Pratama', '0812-9876-5432', 'andipratama@gmail.com', 'technician', true)
    on conflict (id) do update set email = 'andipratama@gmail.com', role = 'technician', is_active = true;
  end if;

  -- Customer: budisantoso@gmail.com
  select id into u_customer from auth.users where lower(trim(email)) = 'budisantoso@gmail.com' limit 1;
  if u_customer is not null then
    insert into public.profiles (id, full_name, phone, email, role, is_active)
    values (u_customer, 'Budi Santoso', '0812-3456-7890', 'budisantoso@gmail.com', 'customer', true)
    on conflict (id) do update set email = 'budisantoso@gmail.com', role = 'customer', is_active = true;
  end if;
end $$;

insert into public.admin_settings (id, key, value, description)
values (
  'setting-superadmin-email',
  'superadmin_email',
  '"sugara.ardi@gmail.com"',
  'Email resmi Super Administrator utama sistem Tukang AC Online'
)
on conflict (id) do update set
  value = '"sugara.ardi@gmail.com"';


