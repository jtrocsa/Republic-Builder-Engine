-- Phase 50D: a real Assignment/due-date model. A teacher picks an existing
-- assessed task (same (task_type, task_id) shape submissions already use —
-- see 0001_init.sql) and a due date; "class outcome reporting" is then just
-- joining this table against the classroom's existing submissions/
-- evaluations/manual_grades rows client-side (see
-- remote-assignment-repository.js), no new reporting tables needed.
--
-- This migration has not been applied to the live project yet (same status
-- 0006-0011 shipped in) — apply by hand via the Supabase SQL editor.

create table assignments (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references classrooms(id) on delete cascade,
  teacher_user_id uuid not null references profiles(id),
  title text not null check (char_length(title) between 1 and 200),
  task_type text not null check (task_type in ('hipp-sourcing', 'saq', 'leq', 'dbq')),
  task_id text not null,
  due_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table assignments enable row level security;

-- Teacher has full CRUD on their own classroom's assignments; a claimed
-- student can read (never write) their classroom's assignments, same
-- read-only shape as content_overrides_student_select.
create policy "assignments_teacher_all" on assignments
  for all using (is_classroom_teacher(classroom_id)) with check (is_classroom_teacher(classroom_id));

create policy "assignments_student_select" on assignments
  for select using (
    exists (
      select 1 from roster_slots rs
      where rs.classroom_id = assignments.classroom_id and rs.auth_user_id = auth.uid()
    )
  );
