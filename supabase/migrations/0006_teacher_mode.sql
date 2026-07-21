-- Real Teacher Mode: classroom-wide unit floor + curated source/MCQ-quest
-- swaps with a draft/publish step. See the plan this migration was written
-- against for full rationale; short version:
--
-- classroom_unit_progress: one row per classroom, an index into the
-- existing UNITS = [UNIT_01, UNIT_02, UNIT_03] array in main.js. "Advance to
-- next unit" increments it. This is a floor, not a ceiling — main.js
-- additively unions the enabled units' first cases into a student's own
-- progress.unlocked; it never removes a case a student already unlocked via
-- normal play.
--
-- classroom_content_selections: draft + published source/MCQ-quest swaps,
-- one row per (classroom, slot, status). slot_content_id is always an
-- OFFICIAL content id (a case's source id, or a Practice Check mcq quest
-- id) — never the alternate's own id. alt_content_id points into the
-- curated alternate-pool content files under apps/web/src/content/ (not a
-- foreign key — that pool lives in code, same precedent as
-- content_overrides.content_id). Publishing copies a draft row into a
-- matching published row (or deletes the published row if the draft was
-- cleared back to official).

-- ============================================================================
-- Tables
-- ============================================================================

create table classroom_unit_progress (
  classroom_id uuid primary key references classrooms(id) on delete cascade,
  enabled_unit_index int not null default 0 check (enabled_unit_index >= 0),
  updated_by uuid not null references profiles(id),
  updated_at timestamptz not null default now()
);

create table classroom_content_selections (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references classrooms(id) on delete cascade,
  case_id text not null,
  slot_kind text not null check (slot_kind in ('source', 'mcq-quest')),
  slot_content_id text not null,
  status text not null check (status in ('draft', 'published')),
  alt_content_id text not null,
  updated_by uuid not null references profiles(id),
  updated_at timestamptz not null default now(),
  unique (classroom_id, slot_kind, slot_content_id, status)
);

-- ============================================================================
-- RLS
-- ============================================================================

alter table classroom_unit_progress enable row level security;
alter table classroom_content_selections enable row level security;

-- classroom_unit_progress: teacher has full CRUD on their own classroom's
-- row; a claimed student can read their classroom's row (so the client can
-- compute the unlock floor on boot).
create policy "cup_teacher_all" on classroom_unit_progress
  for all using (is_classroom_teacher(classroom_id)) with check (is_classroom_teacher(classroom_id));

create policy "cup_student_select" on classroom_unit_progress
  for select using (
    exists (
      select 1 from roster_slots rs
      where rs.classroom_id = classroom_unit_progress.classroom_id and rs.auth_user_id = auth.uid()
    )
  );

-- classroom_content_selections: teacher has full CRUD (draft editing +
-- publish) on their own classroom's rows. A claimed student may only ever
-- read published rows — draft is teacher-preview-only and must never leak
-- to the live student-facing resolution cache.
create policy "ccs_teacher_all" on classroom_content_selections
  for all using (is_classroom_teacher(classroom_id)) with check (is_classroom_teacher(classroom_id));

create policy "ccs_student_select_published" on classroom_content_selections
  for select using (
    status = 'published'
    and exists (
      select 1 from roster_slots rs
      where rs.classroom_id = classroom_content_selections.classroom_id and rs.auth_user_id = auth.uid()
    )
  );
