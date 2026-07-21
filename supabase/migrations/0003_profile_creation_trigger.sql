-- Replaces client-side profile-row inserts with a database trigger. Found
-- necessary during real end-to-end testing: this project has "Confirm email"
-- enabled, so supabase.auth.signUp() returns no session until the user
-- confirms — meaning a client insert into `profiles` right after signUp()
-- has no auth.uid() to satisfy RLS with. A security-definer trigger on
-- auth.users bypasses that timing problem entirely (and works the same way
-- regardless of the confirm-email setting). Both signUpTeacher() and
-- api/roster/claim.js now pass role/display_name via user metadata instead
-- of inserting the profiles row themselves.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'display_name', 'Chronicler')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
