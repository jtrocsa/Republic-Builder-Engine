-- Teacher Dashboard "Sources" tab: a classroom's curated pool of candidate
-- sources per unit, pulled from the syllabus-wide primary source research
-- library (apps/web/src/content/primary-source-library/) plus whatever is
-- already wired as a swappable "alternate" (classroom_content_selections).
--
-- This is deliberately NOT the same thing as classroom_content_selections:
-- that table swaps one specific case's source SLOT for a specific
-- alternate. This table just tracks which candidate sources a teacher has
-- flagged as available for a unit — a lighter-weight preference list, with
-- no case/slot association and no draft/publish lifecycle. Row presence =
-- selected; deleting the row = deselected (same convention as
-- classroom_content_selections' draft rows).
--
-- Teacher-only in this pass — nothing student-facing reads this table yet,
-- since pre-selected research-library sources aren't wired into any live
-- mission's swap dropdown (that needs per-case activityRoute/reconstruction
-- authoring, tracked as a followup). No student RLS policy needed yet,
-- unlike classroom_unit_progress/classroom_content_selections.
--
-- This migration has not been applied to the live project yet (same status
-- 0006-0008 shipped in) — apply by hand via the Supabase SQL editor.

create table classroom_unit_source_pool (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references classrooms(id) on delete cascade,
  unit_number int not null check (unit_number between 1 and 9),
  source_id text not null,
  source_kind text not null check (source_kind in ('text', 'visual')),
  updated_by uuid not null references profiles(id),
  updated_at timestamptz not null default now(),
  unique (classroom_id, unit_number, source_id)
);

alter table classroom_unit_source_pool enable row level security;

create policy "cusp_teacher_all" on classroom_unit_source_pool
  for all using (is_classroom_teacher(classroom_id)) with check (is_classroom_teacher(classroom_id));
