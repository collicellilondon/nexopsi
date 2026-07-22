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

create table if not exists professional_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  crp text,
  phone text,
  email text,
  specialty text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table if not exists service_prices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  duration text,
  value numeric(12,2) not null default 0,
  recurrence text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists invoices (
  id text primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  patient_name text not null,
  patient_cpf text,
  patient_phone text,
  patient_email text,
  description text not null,
  due_date date not null,
  amount numeric(12,2) not null default 0,
  status text not null default 'pendente',
  method text not null default 'Pix',
  kind text not null default 'mensalidade',
  installments text,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  professional_id uuid references profiles(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled',
  mode text not null default 'in_person',
  type text,
  paid boolean not null default false,
  room text,
  recurrence_rule text,
  location text,
  color text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists clinical_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  patient_id uuid references patients(id) on delete cascade,
  professional_id uuid references profiles(id) on delete set null,
  title text,
  summary text,
  status text not null default 'draft',
  duration_minutes integer,
  draft boolean not null default true,
  autosaved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clinical_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  clinical_session_id uuid references clinical_sessions(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  content text,
  evolution text,
  therapeutic_objectives text,
  techniques_used text,
  next_session_plan text,
  tasks text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists document_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  category text not null,
  body text not null,
  variables text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  template_id uuid references document_templates(id) on delete set null,
  title text not null,
  category text,
  body text not null,
  status text not null default 'draft',
  signed_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  invoice_id text references invoices(id) on delete set null,
  patient_id uuid references patients(id) on delete set null,
  amount numeric(12,2) not null default 0,
  paid_at date,
  method text,
  pdf_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prescriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  title text not null,
  body text not null,
  status text not null default 'draft',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  title text not null,
  category text not null default 'clinical',
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (organization_id, key)
);

create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  clinic_id uuid references organizations(id) on delete set null,
  selected_theme text not null default 'nexopsi',
  language text not null default 'pt-BR',
  timezone text not null default 'America/Sao_Paulo',
  currency text not null default 'BRL',
  date_format text not null default 'dd/MM/yyyy',
  notification_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table profiles
  add column if not exists email text,
  add column if not exists specialty text,
  add column if not exists bio text;

alter table professional_profiles
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists clinic_id uuid references organizations(id) on delete cascade,
  add column if not exists professional_name text,
  add column if not exists professional_registration text,
  add column if not exists professional_bio text,
  add column if not exists document_signature text,
  add column if not exists profile_photo_url text,
  add column if not exists currency text not null default 'BRL',
  add column if not exists timezone text not null default 'America/Sao_Paulo';

update professional_profiles
   set user_id = coalesce(user_id, profile_id),
       clinic_id = coalesce(clinic_id, organization_id),
       professional_name = coalesce(professional_name, full_name),
       professional_registration = coalesce(professional_registration, crp),
       professional_bio = coalesce(professional_bio, bio),
       document_signature = coalesce(document_signature, trim(both ' -' from concat(coalesce(full_name, ''), ' - ', coalesce(crp, '')))),
       profile_photo_url = coalesce(profile_photo_url, avatar_url)
 where user_id is null
    or clinic_id is null
    or professional_name is null
    or professional_registration is null
    or professional_bio is null
    or document_signature is null
    or profile_photo_url is null;

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

alter table invoices
  add column if not exists patient_cpf text,
  add column if not exists patient_phone text,
  add column if not exists patient_email text,
  add column if not exists installments text;

alter table appointments
  add column if not exists type text,
  add column if not exists paid boolean not null default false,
  add column if not exists room text,
  add column if not exists notes text;

alter table clinical_sessions
  add column if not exists title text,
  add column if not exists summary text,
  add column if not exists status text not null default 'draft';

alter table clinical_notes
  add column if not exists patient_id uuid references patients(id) on delete cascade,
  add column if not exists updated_at timestamptz not null default now();

alter table documents
  add column if not exists category text,
  add column if not exists status text not null default 'draft',
  add column if not exists updated_at timestamptz not null default now();

alter table app_settings
  add column if not exists organization_id uuid references organizations(id) on delete cascade,
  add column if not exists key text,
  add column if not exists value jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

alter table user_settings
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists clinic_id uuid references organizations(id) on delete set null,
  add column if not exists selected_theme text not null default 'nexopsi',
  add column if not exists language text not null default 'pt-BR',
  add column if not exists timezone text not null default 'America/Sao_Paulo',
  add column if not exists currency text not null default 'BRL',
  add column if not exists date_format text not null default 'dd/MM/yyyy',
  add column if not exists notification_preferences jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists organization_members_profile_idx
  on organization_members (profile_id, organization_id)
  where active = true;

create index if not exists patients_organization_status_idx
  on patients (organization_id, status);

create index if not exists professional_profiles_org_profile_idx
  on professional_profiles (organization_id, profile_id);

create unique index if not exists professional_profiles_user_unique
  on professional_profiles (user_id)
  where user_id is not null;

create index if not exists service_prices_organization_idx
  on service_prices (organization_id, active);

create index if not exists service_prices_organization_name_idx
  on service_prices (organization_id, name);

create index if not exists invoices_organization_status_idx
  on invoices (organization_id, status, due_date);

create index if not exists appointments_organization_starts_idx
  on appointments (organization_id, starts_at);

create index if not exists clinical_sessions_organization_patient_idx
  on clinical_sessions (organization_id, patient_id);

create index if not exists clinical_notes_organization_patient_idx
  on clinical_notes (organization_id, patient_id);

create index if not exists documents_organization_patient_idx
  on documents (organization_id, patient_id);

create index if not exists receipts_organization_patient_idx
  on receipts (organization_id, patient_id);

create index if not exists prescriptions_organization_patient_idx
  on prescriptions (organization_id, patient_id);

create index if not exists reports_organization_patient_idx
  on reports (organization_id, patient_id);

create unique index if not exists app_settings_organization_key_unique
  on app_settings (organization_id, key);

create unique index if not exists user_settings_user_unique
  on user_settings (user_id);

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
alter table professional_profiles enable row level security;
alter table service_prices enable row level security;
alter table invoices enable row level security;
alter table appointments enable row level security;
alter table clinical_sessions enable row level security;
alter table clinical_notes enable row level security;
alter table document_templates enable row level security;
alter table documents enable row level security;
alter table receipts enable row level security;
alter table prescriptions enable row level security;
alter table reports enable row level security;
alter table app_settings enable row level security;
alter table user_settings enable row level security;
alter table audit_logs enable row level security;

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

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'professional_profiles'
      and policyname = 'members can manage own professional profiles'
  ) then
    create policy "members can manage own professional profiles"
      on professional_profiles
      for all
      using (is_org_member(organization_id) and profile_id = auth.uid())
      with check (is_org_member(organization_id) and profile_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'service_prices'
      and policyname = 'members can manage own service prices'
  ) then
    create policy "members can manage own service prices"
      on service_prices
      for all
      using (is_org_member(organization_id))
      with check (is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'invoices'
      and policyname = 'members can manage own invoices'
  ) then
    create policy "members can manage own invoices"
      on invoices
      for all
      using (is_org_member(organization_id))
      with check (is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'appointments'
      and policyname = 'members can manage own appointments'
  ) then
    create policy "members can manage own appointments"
      on appointments
      for all
      using (is_org_member(organization_id))
      with check (is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'clinical_sessions'
      and policyname = 'members can manage own clinical sessions'
  ) then
    create policy "members can manage own clinical sessions"
      on clinical_sessions
      for all
      using (is_org_member(organization_id))
      with check (is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'clinical_notes'
      and policyname = 'members can manage own clinical notes'
  ) then
    create policy "members can manage own clinical notes"
      on clinical_notes
      for all
      using (is_org_member(organization_id))
      with check (is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'document_templates'
      and policyname = 'members can manage own document templates'
  ) then
    create policy "members can manage own document templates"
      on document_templates
      for all
      using (is_org_member(organization_id))
      with check (is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'documents'
      and policyname = 'members can manage own documents'
  ) then
    create policy "members can manage own documents"
      on documents
      for all
      using (is_org_member(organization_id))
      with check (is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'receipts'
      and policyname = 'members can manage own receipts'
  ) then
    create policy "members can manage own receipts"
      on receipts
      for all
      using (is_org_member(organization_id))
      with check (is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'prescriptions'
      and policyname = 'members can manage own prescriptions'
  ) then
    create policy "members can manage own prescriptions"
      on prescriptions
      for all
      using (is_org_member(organization_id))
      with check (is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'reports'
      and policyname = 'members can manage own reports'
  ) then
    create policy "members can manage own reports"
      on reports
      for all
      using (is_org_member(organization_id))
      with check (is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'app_settings'
      and policyname = 'members can manage own app settings'
  ) then
    create policy "members can manage own app settings"
      on app_settings
      for all
      using (is_org_member(organization_id))
      with check (is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_settings'
      and policyname = 'users can manage own settings'
  ) then
    create policy "users can manage own settings"
      on user_settings
      for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'audit_logs'
      and policyname = 'members can read own audit logs'
  ) then
    create policy "members can read own audit logs"
      on audit_logs
      for select
      using (organization_id is null or is_org_member(organization_id));
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'professional-avatars',
  'professional-avatars',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 4194304,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'public can read professional avatars'
  ) then
    create policy "public can read professional avatars"
      on storage.objects
      for select
      using (bucket_id = 'professional-avatars');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'users can upload own professional avatar'
  ) then
    create policy "users can upload own professional avatar"
      on storage.objects
      for insert
      with check (
        bucket_id = 'professional-avatars'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'users can update own professional avatar'
  ) then
    create policy "users can update own professional avatar"
      on storage.objects
      for update
      using (
        bucket_id = 'professional-avatars'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text
      )
      with check (
        bucket_id = 'professional-avatars'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'users can delete own professional avatar'
  ) then
    create policy "users can delete own professional avatar"
      on storage.objects
      for delete
      using (
        bucket_id = 'professional-avatars'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
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

create or replace function save_professional_profile(
  profile_name text default null,
  profile_register text default null,
  profile_email text default null,
  profile_phone text default null,
  profile_specialty text default null,
  profile_bio text default null,
  profile_photo_url text default null
)
returns table (
  full_name text,
  avatar_url text,
  crp text,
  phone text,
  email text,
  specialty text,
  bio text
)
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
  workspace_id := ensure_personal_workspace(resolved_name);

  insert into profiles (id, full_name, avatar_url, crp, phone, email, specialty, bio)
  values (
    current_user_id,
    resolved_name,
    nullif(profile_photo_url, ''),
    nullif(profile_register, ''),
    nullif(profile_phone, ''),
    coalesce(nullif(profile_email, ''), auth.jwt() ->> 'email'),
    nullif(profile_specialty, ''),
    nullif(profile_bio, '')
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        avatar_url = excluded.avatar_url,
        crp = excluded.crp,
        phone = excluded.phone,
        email = excluded.email,
        specialty = excluded.specialty,
        bio = excluded.bio,
        updated_at = now();

  insert into professional_profiles (
    organization_id,
    profile_id,
    user_id,
    clinic_id,
    full_name,
    avatar_url,
    crp,
    phone,
    email,
    specialty,
    bio,
    professional_name,
    professional_registration,
    professional_bio,
    document_signature,
    profile_photo_url,
    currency,
    timezone
  )
  values (
    workspace_id,
    current_user_id,
    current_user_id,
    workspace_id,
    resolved_name,
    nullif(profile_photo_url, ''),
    nullif(profile_register, ''),
    nullif(profile_phone, ''),
    coalesce(nullif(profile_email, ''), auth.jwt() ->> 'email'),
    nullif(profile_specialty, ''),
    nullif(profile_bio, ''),
    resolved_name,
    nullif(profile_register, ''),
    nullif(profile_bio, ''),
    trim(both ' -' from concat(resolved_name, ' - ', coalesce(nullif(profile_register, ''), ''))),
    nullif(profile_photo_url, ''),
    'BRL',
    'America/Sao_Paulo'
  )
  on conflict (organization_id, profile_id) do update
    set full_name = excluded.full_name,
        avatar_url = excluded.avatar_url,
        crp = excluded.crp,
        phone = excluded.phone,
        email = excluded.email,
        specialty = excluded.specialty,
        bio = excluded.bio,
        user_id = excluded.user_id,
        clinic_id = excluded.clinic_id,
        professional_name = excluded.professional_name,
        professional_registration = excluded.professional_registration,
        professional_bio = excluded.professional_bio,
        document_signature = excluded.document_signature,
        profile_photo_url = excluded.profile_photo_url,
        currency = excluded.currency,
        timezone = excluded.timezone,
        updated_at = now();

  return query
  select pp.full_name, pp.avatar_url, pp.crp, pp.phone, pp.email, pp.specialty, pp.bio
    from professional_profiles pp
   where pp.organization_id = workspace_id
     and pp.profile_id = current_user_id
   limit 1;
end;
$$;

grant execute on function save_professional_profile(text, text, text, text, text, text, text) to authenticated;

create or replace function save_service_prices(price_items jsonb)
returns table (
  id uuid,
  name text,
  duration text,
  value numeric,
  recurrence text,
  active boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  workspace_id uuid;
  item jsonb;
  candidate_id uuid;
  existing_id uuid;
  resolved_name text;
  resolved_duration text;
  resolved_value numeric;
  resolved_recurrence text;
  resolved_active boolean;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  workspace_id := ensure_personal_workspace(null);

  for item in select * from jsonb_array_elements(coalesce(price_items, '[]'::jsonb))
  loop
    resolved_name := nullif(item ->> 'name', '');
    if resolved_name is null then
      continue;
    end if;

    candidate_id := null;
    begin
      candidate_id := nullif(item ->> 'id', '')::uuid;
    exception when others then
      candidate_id := null;
    end;

    begin
      resolved_value := coalesce(nullif(item ->> 'value', '')::numeric, 0);
    exception when others then
      resolved_value := 0;
    end;

    resolved_duration := coalesce(nullif(item ->> 'duration', ''), '50 min');
    resolved_recurrence := coalesce(nullif(item ->> 'recurrence', ''), 'Por sessao');
    resolved_active := coalesce((item ->> 'active')::boolean, true);

    existing_id := null;
    if candidate_id is not null then
      select sp.id into existing_id
        from service_prices sp
       where sp.organization_id = workspace_id
         and sp.id = candidate_id
       limit 1;
    end if;

    if existing_id is null then
      select sp.id into existing_id
        from service_prices sp
       where sp.organization_id = workspace_id
         and lower(sp.name) = lower(resolved_name)
       order by sp.created_at asc
       limit 1;
    end if;

    if existing_id is null then
      insert into service_prices (organization_id, name, duration, value, recurrence, active)
      values (workspace_id, resolved_name, resolved_duration, resolved_value, resolved_recurrence, resolved_active);
    else
      update service_prices
         set name = resolved_name,
             duration = resolved_duration,
             value = resolved_value,
             recurrence = resolved_recurrence,
             active = resolved_active,
             updated_at = now()
       where service_prices.id = existing_id
         and service_prices.organization_id = workspace_id;
    end if;
  end loop;

  return query
  select sp.id, sp.name, sp.duration, sp.value, sp.recurrence, sp.active
    from service_prices sp
   where sp.organization_id = workspace_id
   order by sp.active desc, sp.created_at asc;
end;
$$;

grant execute on function save_service_prices(jsonb) to authenticated;
