create extension if not exists "pgcrypto";

create type member_role as enum ('owner', 'admin', 'professional', 'assistant', 'billing');
create type patient_status as enum ('active', 'paused', 'discharged', 'intake');
create type appointment_status as enum ('scheduled', 'confirmed', 'completed', 'missed', 'cancelled', 'rescheduled');
create type appointment_mode as enum ('in_person', 'online');
create type transaction_kind as enum ('income', 'expense');
create type transaction_status as enum ('pending', 'paid', 'overdue', 'cancelled');

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  document_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clinics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  phone text,
  address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  crp text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role member_role not null default 'professional',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table patients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  clinic_id uuid references clinics(id) on delete set null,
  full_name text not null,
  preferred_name text,
  cpf text,
  birth_date date,
  status patient_status not null default 'intake',
  tags text[] not null default '{}',
  responsible_professional_id uuid references profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table patient_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  type text not null check (type in ('email', 'phone', 'emergency', 'guardian')),
  label text,
  value text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  clinic_id uuid references clinics(id) on delete set null,
  patient_id uuid references patients(id) on delete set null,
  professional_id uuid references profiles(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status appointment_status not null default 'scheduled',
  mode appointment_mode not null default 'in_person',
  recurrence_rule text,
  location text,
  color text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table appointment_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  appointment_id uuid not null references appointments(id) on delete cascade,
  previous_status appointment_status,
  new_status appointment_status not null,
  changed_by uuid references profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);

create table clinical_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  patient_id uuid not null references patients(id) on delete cascade,
  professional_id uuid references profiles(id) on delete set null,
  duration_minutes integer,
  draft boolean not null default true,
  autosaved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clinical_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  clinical_session_id uuid not null references clinical_sessions(id) on delete cascade,
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

create table anamnesis_forms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  schema jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table anamnesis_responses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  form_id uuid not null references anamnesis_forms(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz
);

create table therapeutic_goals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'active',
  target_date date,
  created_at timestamptz not null default now()
);

create table patient_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  mime_type text,
  uploaded_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  active boolean not null default true
);

create table session_packages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  sessions_total integer not null,
  sessions_used integer not null default 0,
  price numeric(12,2) not null,
  valid_until date,
  created_at timestamptz not null default now(),
  check (sessions_total > 0),
  check (sessions_used >= 0 and sessions_used <= sessions_total)
);

create table financial_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  appointment_id uuid references appointments(id) on delete set null,
  package_id uuid references session_packages(id) on delete set null,
  payment_method_id uuid references payment_methods(id) on delete set null,
  kind transaction_kind not null,
  status transaction_status not null default 'pending',
  description text not null,
  amount numeric(12,2) not null,
  due_date date,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table document_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  category text not null,
  body text not null,
  variables text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  template_id uuid references document_templates(id) on delete set null,
  title text not null,
  body text not null,
  signed_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table app_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (organization_id, key)
);

create index on organization_members (profile_id, organization_id) where active = true;
create index on patients (organization_id, status);
create index on appointments (organization_id, starts_at);
create index on clinical_sessions (organization_id, patient_id);
create index on financial_transactions (organization_id, status, due_date);

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

create or replace function is_org_admin(target_organization_id uuid)
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
      and om.role in ('owner', 'admin')
  );
$$;

alter table organizations enable row level security;
alter table clinics enable row level security;
alter table profiles enable row level security;
alter table organization_members enable row level security;
alter table patients enable row level security;
alter table patient_contacts enable row level security;
alter table appointments enable row level security;
alter table appointment_status_history enable row level security;
alter table clinical_sessions enable row level security;
alter table clinical_notes enable row level security;
alter table anamnesis_forms enable row level security;
alter table anamnesis_responses enable row level security;
alter table therapeutic_goals enable row level security;
alter table patient_files enable row level security;
alter table financial_transactions enable row level security;
alter table payment_methods enable row level security;
alter table session_packages enable row level security;
alter table documents enable row level security;
alter table document_templates enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;
alter table app_settings enable row level security;

create policy "profiles can read own profile" on profiles for select using (id = auth.uid());
create policy "profiles can update own profile" on profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "members can read organizations" on organizations for select using (is_org_member(id));
create policy "admins can update organizations" on organizations for update using (is_org_admin(id)) with check (is_org_admin(id));

create policy "members can read memberships" on organization_members for select using (is_org_member(organization_id));
create policy "admins can manage memberships" on organization_members for all using (is_org_admin(organization_id)) with check (is_org_admin(organization_id));

create policy "members can read clinics" on clinics for select using (is_org_member(organization_id));
create policy "admins can manage clinics" on clinics for all using (is_org_admin(organization_id)) with check (is_org_admin(organization_id));

create policy "members can read patients" on patients for select using (is_org_member(organization_id));
create policy "members can create patients" on patients for insert with check (is_org_member(organization_id));
create policy "members can update patients" on patients for update using (is_org_member(organization_id)) with check (is_org_member(organization_id));

create policy "members can read patient contacts" on patient_contacts for select using (is_org_member(organization_id));
create policy "members can manage patient contacts" on patient_contacts for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));

create policy "members can read appointments" on appointments for select using (is_org_member(organization_id));
create policy "members can manage appointments" on appointments for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));

create policy "members can read appointment history" on appointment_status_history for select using (is_org_member(organization_id));
create policy "members can create appointment history" on appointment_status_history for insert with check (is_org_member(organization_id));

create policy "members can manage clinical sessions" on clinical_sessions for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "members can manage clinical notes" on clinical_notes for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "members can manage anamnesis forms" on anamnesis_forms for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "members can manage anamnesis responses" on anamnesis_responses for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "members can manage goals" on therapeutic_goals for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "members can manage files" on patient_files for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "members can manage finances" on financial_transactions for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "members can manage payment methods" on payment_methods for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "members can manage packages" on session_packages for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "members can manage documents" on documents for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "members can manage templates" on document_templates for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "members can read own notifications" on notifications for select using (is_org_member(organization_id) and (profile_id = auth.uid() or profile_id is null));
create policy "members can update own notifications" on notifications for update using (is_org_member(organization_id) and profile_id = auth.uid()) with check (is_org_member(organization_id) and profile_id = auth.uid());
create policy "members can read audit logs" on audit_logs for select using (is_org_admin(organization_id));
create policy "members can create audit logs" on audit_logs for insert with check (is_org_member(organization_id));
create policy "admins can manage app settings" on app_settings for all using (is_org_admin(organization_id)) with check (is_org_admin(organization_id));

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_touch_updated_at before update on organizations for each row execute function touch_updated_at();
create trigger profiles_touch_updated_at before update on profiles for each row execute function touch_updated_at();
create trigger patients_touch_updated_at before update on patients for each row execute function touch_updated_at();
create trigger appointments_touch_updated_at before update on appointments for each row execute function touch_updated_at();
create trigger clinical_sessions_touch_updated_at before update on clinical_sessions for each row execute function touch_updated_at();
create trigger clinical_notes_touch_updated_at before update on clinical_notes for each row execute function touch_updated_at();
