-- Correção imediata para a versão enxuta da Nexopsi.
-- Rode este arquivo inteiro no SQL Editor se aparecer erro de appointments.user_id,
-- invoices.user_id ou falta de constraint em professional_profiles.user_id.

create extension if not exists pgcrypto;

alter table if exists public.profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.professional_profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.patients add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.appointments add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.invoices add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.service_prices add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.user_settings add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.documents add column if not exists user_id uuid references auth.users(id) on delete cascade;

do $$
declare
  target_table text;
  target_column text;
begin
  foreach target_table in array array[
    'professional_profiles',
    'patients',
    'appointments',
    'invoices',
    'service_prices',
    'user_settings',
    'documents'
  ]
  loop
    foreach target_column in array array['organization_id', 'profile_id', 'clinic_id', 'professional_id']
    loop
      if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = target_table
          and column_name = target_column
      ) then
        execute format('alter table public.%I alter column %I drop not null', target_table, target_column);
      end if;
    end loop;
  end loop;
end $$;

create unique index if not exists profiles_user_id_unique on public.profiles(user_id);
create unique index if not exists professional_profiles_user_id_unique on public.professional_profiles(user_id);
create unique index if not exists user_settings_user_id_unique on public.user_settings(user_id);
create index if not exists patients_user_status_idx on public.patients(user_id, status);
create index if not exists appointments_user_starts_idx on public.appointments(user_id, starts_at);
create index if not exists invoices_user_status_idx on public.invoices(user_id, status, due_date);

alter table if exists public.profiles enable row level security;
alter table if exists public.professional_profiles enable row level security;
alter table if exists public.patients enable row level security;
alter table if exists public.appointments enable row level security;
alter table if exists public.invoices enable row level security;
alter table if exists public.service_prices enable row level security;
alter table if exists public.user_settings enable row level security;
alter table if exists public.documents enable row level security;

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
    'invoices',
    'service_prices',
    'user_settings',
    'documents'
  ]
  loop
    for policy_record in
      select policyname from pg_policies where schemaname = 'public' and tablename = target_table
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
