-- Fixes two gaps found during real end-to-end testing of self-serve teacher
-- signup against a live project: tables created via a raw SQL migration
-- (rather than Supabase's Table Editor UI) don't automatically get the usual
-- grants to the `authenticated` role, and `profiles` had no INSERT policy at
-- all — both silently blocked signUpTeacher()'s own-profile insert.

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;

create policy "profiles_self_insert" on profiles
  for insert with check (id = auth.uid());
