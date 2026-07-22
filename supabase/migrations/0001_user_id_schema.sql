-- Nexopsi: camada Supabase enxuta por usuario.
-- Rode este arquivo inteiro no SQL Editor do Supabase.

create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  crp text,
  specialty text default 'Psicologia clinica',
  bio text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists professional_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text,
  crp text,
  email text,
  phone text,
  specialty text default 'Psicologia clinica',
  bio text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  cpf text,
  birth_date date,
  status text default 'intake',
  tags text[] default '{}',
  notes text,
  email text,
  phone text,
  address text,
  emergency_contact text,
  guardian text,
  occupation text,
  referral_source text,
  main_complaint text,
  pending_balance numeric default 0,
  next_session text default 'A agendar',
  last_session text default 'Sem historico',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text default 'scheduled',
  mode text default 'in_person',
  type text,
  paid boolean default false,
  room text,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists service_prices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  duration text,
  value numeric default 0,
  recurrence text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  patient_name text not null,
  patient_cpf text,
  patient_phone text,
  patient_email text,
  description text not null,
  due_date date not null,
  amount numeric default 0,
  status text default 'pendente',
  method text default 'Pix',
  kind text default 'sessao',
  installments text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  selected_theme text default 'nexopsi',
  timezone text default 'America/Sao_Paulo',
  currency text default 'BRL',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  title text not null,
  kind text,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table profiles add column if not exists full_name text;
alter table profiles add column if not exists email text;
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists crp text;
alter table profiles add column if not exists specialty text default 'Psicologia clinica';
alter table profiles add column if not exists bio text;
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists created_at timestamptz default now();
alter table profiles add column if not exists updated_at timestamptz default now();

alter table professional_profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table professional_profiles add column if not exists full_name text;
alter table professional_profiles add column if not exists crp text;
alter table professional_profiles add column if not exists email text;
alter table professional_profiles add column if not exists phone text;
alter table professional_profiles add column if not exists specialty text default 'Psicologia clinica';
alter table professional_profiles add column if not exists bio text;
alter table professional_profiles add column if not exists avatar_url text;
alter table professional_profiles add column if not exists created_at timestamptz default now();
alter table professional_profiles add column if not exists updated_at timestamptz default now();

alter table patients add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table appointments add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table service_prices add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table invoices add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table user_settings add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table documents add column if not exists user_id uuid references auth.users(id) on delete cascade;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'professional_profiles',
    'patients',
    'appointments',
    'service_prices',
    'invoices',
    'user_settings',
    'documents'
  ]
  loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = target_table
        and column_name = 'organization_id'
    ) then
      execute format('alter table public.%I alter column organization_id drop not null', target_table);
    end if;
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = target_table and column_name = 'profile_id') then
      execute format('alter table public.%I alter column profile_id drop not null', target_table);
    end if;
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = target_table and column_name = 'clinic_id') then
      execute format('alter table public.%I alter column clinic_id drop not null', target_table);
    end if;
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = target_table and column_name = 'professional_id') then
      execute format('alter table public.%I alter column professional_id drop not null', target_table);
    end if;
  end loop;
end $$;

create unique index if not exists profiles_user_id_unique on profiles(user_id);
create unique index if not exists professional_profiles_user_id_unique on professional_profiles(user_id);
create unique index if not exists user_settings_user_id_unique on user_settings(user_id);
create unique index if not exists service_prices_user_name_unique on service_prices(user_id, name);
create index if not exists patients_user_status_idx on patients(user_id, status);
create index if not exists appointments_user_starts_idx on appointments(user_id, starts_at);
create index if not exists invoices_user_status_idx on invoices(user_id, status, due_date);

alter table profiles enable row level security;
alter table professional_profiles enable row level security;
alter table patients enable row level security;
alter table appointments enable row level security;
alter table service_prices enable row level security;
alter table invoices enable row level security;
alter table user_settings enable row level security;
alter table documents enable row level security;

do $$
declare
  target_table text;
  policy_record record;
begin
  foreach target_table in array array[
    'profiles',
    'professional_profiles',
    'patients',
    'appointments',
    'service_prices',
    'invoices',
    'user_settings',
    'documents'
  ]
  loop
    for policy_record in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = target_table
    loop
      execute format('drop policy if exists %I on public.%I', policy_record.policyname, target_table);
    end loop;

    execute format(
      'create policy %I on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())',
      target_table || '_own_rows',
      target_table
    );
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('professional-avatars', 'professional-avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "professional avatars public read" on storage.objects;
drop policy if exists "professional avatars own insert" on storage.objects;
drop policy if exists "professional avatars own update" on storage.objects;
drop policy if exists "professional avatars own delete" on storage.objects;

create policy "professional avatars public read"
  on storage.objects for select
  using (bucket_id = 'professional-avatars');

create policy "professional avatars own insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'professional-avatars' and split_part(name, '/', 1) = auth.uid()::text);

create policy "professional avatars own update"
  on storage.objects for update to authenticated
  using (bucket_id = 'professional-avatars' and split_part(name, '/', 1) = auth.uid()::text)
  with check (bucket_id = 'professional-avatars' and split_part(name, '/', 1) = auth.uid()::text);

create policy "professional avatars own delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'professional-avatars' and split_part(name, '/', 1) = auth.uid()::text);

drop function if exists public.ensure_personal_workspace(text);
drop function if exists public.save_professional_profile(text, text, text, text, text, text, text);
drop function if exists public.save_service_prices(jsonb);
drop function if exists public.is_org_member(uuid);
