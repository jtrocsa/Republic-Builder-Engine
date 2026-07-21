-- Extends the profiles-creation trigger from migration 0003 to also copy
-- school_name out of signup metadata, now that profiles has that column
-- (migration 0004). `create or replace function` on the existing trigger
-- function is sufficient — the trigger created in 0003 already dispatches to
-- this function by name and picks up the new definition automatically.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name, school_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'display_name', 'Chronicler'),
    new.raw_user_meta_data->>'school_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
