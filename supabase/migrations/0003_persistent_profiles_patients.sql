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
