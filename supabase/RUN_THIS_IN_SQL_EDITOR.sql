-- COLE E EXECUTE ESTE ARQUIVO INTEIRO NO SUPABASE SQL EDITOR.
-- Nao selecione apenas um trecho. Se selecionar so a parte do ALTER TABLE,
-- o Supabase vai mostrar: relation "patients" does not exist.

create extension if not exists "pgcrypto";

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  document_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  crp text,
  phone text,
  email text,
  specialty text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'professional',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  full_name text not null,
  preferred_name text,
  cpf text,
  birth_date date,
  status text not null default 'intake',
  tags text[] not null default '{}',
  notes text,
  email text,
  phone text,
  address text,
  emergency_contact text,
  guardian text,
  occupation text,
  referral_source text,
  main_complaint text,
  pending_balance numeric(12,2) not null default 0,
  next_session text,
  last_session text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles
  add column if not exists email text,
  add column if not exists specialty text,
  add column if not exists bio text;

alter table patients
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists emergency_contact text,
  add column if not exists guardian text,
  add column if not exists occupation text,
  add column if not exists referral_source text,
  add column if not exists main_complaint text,
  add column if not exists pending_balance numeric(12,2) not null default 0,
  add column if not exists next_session text,
  add column if not exists last_session text;

create index if not exists organization_members_profile_idx
  on organization_members (profile_id, organization_id)
  where active = true;

create index if not exists patients_organization_status_idx
  on patients (organization_id, status);

create or replace function is_org_member(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from organization_members om
    where om.organization_id = target_organization_id
      and om.profile_id = auth.uid()
      and om.active = true
  );
$$;

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table organization_members enable row level security;
alter table patients enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles can insert own profile'
  ) then
    create policy "profiles can insert own profile"
      on profiles
      for insert
      with check (id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles can read own profile'
  ) then
    create policy "profiles can read own profile"
      on profiles
      for select
      using (id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles can update own profile'
  ) then
    create policy "profiles can update own profile"
      on profiles
      for update
      using (id = auth.uid())
      with check (id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'organizations'
      and policyname = 'members can read own organizations'
  ) then
    create policy "members can read own organizations"
      on organizations
      for select
      using (is_org_member(id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'organization_members'
      and policyname = 'members can read own memberships'
  ) then
    create policy "members can read own memberships"
      on organization_members
      for select
      using (profile_id = auth.uid() or is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'patients'
      and policyname = 'members can read own patients'
  ) then
    create policy "members can read own patients"
      on patients
      for select
      using (is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'patients'
      and policyname = 'members can create own patients'
  ) then
    create policy "members can create own patients"
      on patients
      for insert
      with check (is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'patients'
      and policyname = 'members can update own patients'
  ) then
    create policy "members can update own patients"
      on patients
      for update
      using (is_org_member(organization_id))
      with check (is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'patients'
      and policyname = 'members can delete own patients'
  ) then
    create policy "members can delete own patients"
      on patients
      for delete
      using (is_org_member(organization_id));
  end if;
end $$;

create or replace function ensure_personal_workspace(profile_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  workspace_id uuid;
  resolved_name text;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  resolved_name := coalesce(nullif(profile_name, ''), 'Profissional Nexopsi');

  insert into profiles (id, full_name, email)
  values (current_user_id, resolved_name, (auth.jwt() ->> 'email'))
  on conflict (id) do update
    set full_name = coalesce(nullif(profiles.full_name, ''), excluded.full_name),
        email = coalesce(profiles.email, excluded.email),
        updated_at = now();

  select om.organization_id
    into workspace_id
  from organization_members om
  where om.profile_id = current_user_id
    and om.active = true
  order by om.created_at asc
  limit 1;

  if workspace_id is null then
    insert into organizations (name)
    values ('Clinica de ' || resolved_name)
    returning id into workspace_id;

    insert into organization_members (organization_id, profile_id, role, active)
    values (workspace_id, current_user_id, 'owner', true)
    on conflict (organization_id, profile_id) do update
      set role = 'owner',
          active = true;
  end if;

  return workspace_id;
end;
$$;

grant execute on function ensure_personal_workspace(text) to authenticated;
