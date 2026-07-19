-- Chronicle real teacher-mode schema: Identity/Classroom/Submission/Evaluation
-- slice only. See docs/architecture/PLATFORM-ARCHITECTURE-PROPOSAL.md §8 for
-- the long-term data model this implements the "Now" rows of; see the plan
-- this migration was written against for full rationale.

-- ============================================================================
-- Tables
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('teacher', 'student')),
  display_name text not null,
  created_at timestamptz not null default now()
);

create table classrooms (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  join_code text not null unique,
  created_at timestamptz not null default now()
);

create table roster_slots (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references classrooms(id) on delete cascade,
  student_id_code text not null,
  display_name text,
  status text not null default 'unclaimed' check (status in ('unclaimed', 'claimed', 'disabled')),
  auth_user_id uuid references auth.users(id),
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (classroom_id, student_id_code)
);

create table student_world_profiles (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  classroom_id uuid not null references classrooms(id) on delete cascade,
  pack_id text not null default 'chronicle',
  progress jsonb not null,
  updated_at timestamptz not null default now(),
  unique (student_user_id, classroom_id, pack_id)
);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  classroom_id uuid not null references classrooms(id) on delete cascade,
  task_type text not null check (task_type in ('hipp-sourcing', 'saq', 'leq', 'dbq')),
  task_id text not null,
  prompt text not null,
  stimulus text,
  source_metadata jsonb,
  elements_asked jsonb,
  student_response text not null,
  is_revision boolean not null default false,
  created_at timestamptz not null default now()
);

create table evaluations (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references submissions(id) on delete cascade,
  feedback jsonb not null,
  model text not null,
  created_at timestamptz not null default now()
);

create table manual_grades (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references evaluations(id) on delete cascade,
  teacher_user_id uuid not null references profiles(id),
  grade_label text not null,
  teacher_feedback text,
  created_at timestamptz not null default now()
);

create table content_overrides (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references classrooms(id) on delete cascade,
  content_id text not null,
  field_name text not null check (field_name in ('title', 'centralQuestion')),
  value text not null check (char_length(value) <= 4000),
  updated_by uuid not null references profiles(id),
  updated_at timestamptz not null default now(),
  unique (classroom_id, content_id, field_name)
);

-- ============================================================================
-- Helper: is the current user the teacher who owns this classroom?
-- ============================================================================

create or replace function is_classroom_teacher(target_classroom_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from classrooms
    where id = target_classroom_id and teacher_id = auth.uid()
  );
$$;

-- ============================================================================
-- RLS
-- ============================================================================

alter table profiles enable row level security;
alter table classrooms enable row level security;
alter table roster_slots enable row level security;
alter table student_world_profiles enable row level security;
alter table submissions enable row level security;
alter table evaluations enable row level security;
alter table manual_grades enable row level security;
alter table content_overrides enable row level security;

-- profiles: a user always sees/edits their own row; a teacher can additionally
-- see the display name/role of any student whose roster slot is in one of
-- their classrooms (for roster display).
create policy "profiles_self_select" on profiles
  for select using (id = auth.uid());

create policy "profiles_self_update" on profiles
  for update using (id = auth.uid());

create policy "profiles_teacher_reads_roster_students" on profiles
  for select using (
    exists (
      select 1 from roster_slots rs
      where rs.auth_user_id = profiles.id
        and is_classroom_teacher(rs.classroom_id)
    )
  );

-- classrooms: teacher has full CRUD on their own; a claimed student can read
-- the one classroom their roster slot belongs to.
create policy "classrooms_teacher_all" on classrooms
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

create policy "classrooms_student_select" on classrooms
  for select using (
    exists (
      select 1 from roster_slots rs
      where rs.classroom_id = classrooms.id and rs.auth_user_id = auth.uid()
    )
  );

-- roster_slots: teacher-only. Students never query this table directly —
-- claiming/reissuing goes through service-role api/roster/*.js functions.
create policy "roster_slots_teacher_all" on roster_slots
  for all using (is_classroom_teacher(classroom_id)) with check (is_classroom_teacher(classroom_id));

-- student_world_profiles: a student owns read/write on their own row; a
-- teacher gets read-only visibility into their classroom's rows and must
-- never be able to overwrite a student's save.
create policy "swp_student_select" on student_world_profiles
  for select using (student_user_id = auth.uid());

create policy "swp_student_insert" on student_world_profiles
  for insert with check (student_user_id = auth.uid());

create policy "swp_student_update" on student_world_profiles
  for update using (student_user_id = auth.uid());

create policy "swp_teacher_select" on student_world_profiles
  for select using (is_classroom_teacher(classroom_id));

-- submissions: immutable once created (no update/delete policy at all). A
-- student inserts/reads their own; a teacher reads their classroom's.
create policy "submissions_student_select" on submissions
  for select using (student_user_id = auth.uid());

create policy "submissions_student_insert" on submissions
  for insert with check (student_user_id = auth.uid());

create policy "submissions_teacher_select" on submissions
  for select using (is_classroom_teacher(classroom_id));

-- evaluations: written by the student's own client immediately after calling
-- /api/evaluate. Immutable once created. A teacher reads via the submission's
-- classroom.
create policy "evaluations_student_select" on evaluations
  for select using (
    exists (
      select 1 from submissions s
      where s.id = evaluations.submission_id and s.student_user_id = auth.uid()
    )
  );

create policy "evaluations_student_insert" on evaluations
  for insert with check (
    exists (
      select 1 from submissions s
      where s.id = evaluations.submission_id and s.student_user_id = auth.uid()
    )
  );

create policy "evaluations_teacher_select" on evaluations
  for select using (
    exists (
      select 1 from submissions s
      where s.id = evaluations.submission_id and is_classroom_teacher(s.classroom_id)
    )
  );

-- manual_grades: teacher-insert-only (a re-grade is a new row, never an
-- update); a student may read grades on their own evaluations.
create policy "manual_grades_teacher_insert" on manual_grades
  for insert with check (
    exists (
      select 1 from evaluations e
      join submissions s on s.id = e.submission_id
      where e.id = manual_grades.evaluation_id and is_classroom_teacher(s.classroom_id)
    )
  );

create policy "manual_grades_teacher_select" on manual_grades
  for select using (
    exists (
      select 1 from evaluations e
      join submissions s on s.id = e.submission_id
      where e.id = manual_grades.evaluation_id and is_classroom_teacher(s.classroom_id)
    )
  );

create policy "manual_grades_student_select" on manual_grades
  for select using (
    exists (
      select 1 from evaluations e
      join submissions s on s.id = e.submission_id
      where e.id = manual_grades.evaluation_id and s.student_user_id = auth.uid()
    )
  );

-- content_overrides: teacher full CRUD on their own classroom; a claimed
-- student can read their classroom's overrides (so resolveField works).
create policy "content_overrides_teacher_all" on content_overrides
  for all using (is_classroom_teacher(classroom_id)) with check (is_classroom_teacher(classroom_id));

create policy "content_overrides_student_select" on content_overrides
  for select using (
    exists (
      select 1 from roster_slots rs
      where rs.classroom_id = content_overrides.classroom_id and rs.auth_user_id = auth.uid()
    )
  );
