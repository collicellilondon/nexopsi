alter table profiles
  add column if not exists email text,
  add column if not exists specialty text,
  add column if not exists bio text;

do $$
begin
  if not exists (
    select 1
    from pg_policies
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
