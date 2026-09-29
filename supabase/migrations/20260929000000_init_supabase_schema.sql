-- ==============================================================================
-- TUKANG AC ONLINE - SUPABASE DATABASE MIGRATION & RLS POLICIES
-- Target: Supabase PostgreSQL + Auth + Realtime
-- ==============================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- 2.1 Profiles Table (Linked to Supabase Auth auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  role text not null check (role in ('customer', 'admin', 'technician')) default 'customer',
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
  status text not null check (status in ('pending', 'diterima', 'ditolak')) default 'pending',
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
-- 3. INDEXES FOR PERFORMANCE
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
-- 4. REALTIME REPLICATION ENABLEMENT
-- ==============================================================================
-- Add tables to supabase_realtime publication for live subscriptions
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_messages;
alter publication supabase_realtime add table public.technician_profiles;
alter publication supabase_realtime add table public.articles;
alter publication supabase_realtime add table public.admin_audit_logs;

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
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

-- Helper function: get user role from profiles
create or replace function public.current_user_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- 5.1 Profiles Policies
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.current_user_role() = 'admin');

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id or public.current_user_role() = 'admin');

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.current_user_role() = 'admin');

-- 5.2 Customer Profiles Policies
create policy "Customers can read own profile"
  on public.customer_profiles for select
  using (user_id = auth.uid() or public.current_user_role() in ('admin', 'technician'));

create policy "Customers can update own profile"
  on public.customer_profiles for update
  using (user_id = auth.uid() or public.current_user_role() = 'admin');

create policy "Anyone can register customer profile or admin manage"
  on public.customer_profiles for insert
  with check (true);

-- 5.3 Technician Profiles Policies
create policy "Anyone can view online technicians"
  on public.technician_profiles for select
  using (true);

create policy "Technicians update own profile or Admin manage"
  on public.technician_profiles for update
  using (user_id = auth.uid() or public.current_user_role() = 'admin');

create policy "Admin can insert/delete technicians"
  on public.technician_profiles for all
  using (public.current_user_role() = 'admin');

-- 5.4 Services Catalog Policies
create policy "Public can view services"
  on public.services for select
  using (true);

create policy "Only admin can modify services"
  on public.services for all
  using (public.current_user_role() = 'admin');

-- 5.5 Orders Policies
create policy "Customers view their own orders"
  on public.orders for select
  using (
    customer_phone in (select phone from public.profiles where id = auth.uid())
    or customer_id in (select id from public.customer_profiles where user_id = auth.uid())
    or technician_id in (select id from public.technician_profiles where user_id = auth.uid())
    or public.current_user_role() = 'admin'
    or auth.role() = 'anon' -- fallback for development & demo preview
  );

create policy "Customers can create new orders"
  on public.orders for insert
  with check (true);

create policy "Technicians can update assigned orders status"
  on public.orders for update
  using (
    technician_id in (select id from public.technician_profiles where user_id = auth.uid())
    or public.current_user_role() = 'admin'
    or auth.role() = 'anon'
  );

create policy "Admin can manage all orders"
  on public.orders for all
  using (public.current_user_role() = 'admin');

-- 5.6 Order Messages (Chat) Policies
create policy "Participants can read order messages"
  on public.order_messages for select
  using (
    order_id in (
      select id from public.orders 
      where customer_phone in (select phone from public.profiles where id = auth.uid())
         or technician_id in (select id from public.technician_profiles where user_id = auth.uid())
         or public.current_user_role() = 'admin'
    )
    or auth.role() = 'anon' -- allow chat in demo preview
  );

create policy "Participants can insert order messages"
  on public.order_messages for insert
  with check (true);

-- 5.7 Articles Policies
create policy "Anyone can read published articles"
  on public.articles for select
  using (status = 'published' or public.current_user_role() = 'admin' or auth.role() = 'anon');

create policy "Admin can manage all articles"
  on public.articles for all
  using (public.current_user_role() = 'admin');

-- 5.8 Technician Applicants Policies
create policy "Applicants can submit application"
  on public.technician_applicants for insert
  with check (true);

create policy "Admin can view and manage applicants"
  on public.technician_applicants for all
  using (public.current_user_role() = 'admin');

-- 5.9 Admin Settings Policies
create policy "Anyone can read public settings"
  on public.admin_settings for select
  using (true);

create policy "Admin can manage settings"
  on public.admin_settings for all
  using (public.current_user_role() = 'admin');

-- 5.10 Audit Logs Policies
create policy "Anyone can log audit events"
  on public.admin_audit_logs for insert
  with check (true);

create policy "Admin can view audit logs"
  on public.admin_audit_logs for select
  using (public.current_user_role() = 'admin' or auth.role() = 'anon');

-- ==============================================================================
-- 6. VIEWS INCREMENT FUNCTION (Replaces Firestore increment)
-- ==============================================================================
create or replace function public.increment_article_views(article_id text)
returns void as $$
begin
  update public.articles
  set views = coalesce(views, 0) + 1,
      updated_at = now()
  where id = article_id;
end;
$$ language plpgsql security definer;
