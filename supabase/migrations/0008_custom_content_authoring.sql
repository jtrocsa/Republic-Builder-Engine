-- Real free-text content authoring for Manage Content — reverses Phase 24's
-- "from-scratch quest builder is out of scope" deferral (see
-- ARCHITECTURE-QUICKREF.md Phase 24 and the new Phase this migration ships
-- against). Two kinds of teacher-authored content, both stored as validated
-- JSON shaped exactly like an official source/quest object (validated
-- client-side against the same Zod schemas scripts/validate-content.js
-- uses), never as loose text fields:
--
--   mode = 'replacement': a teacher-written swap for an existing official
--   slot. Lives alongside the existing curated-alternate-pool mechanism —
--   classroom_content_selections.alt_content_id now may point at either a
--   curated pool id (a plain JS content-file id) or a custom_content_items.id,
--   disambiguated by the new alt_kind column. Publish/draft/revert lifecycle
--   is unchanged, still owned entirely by classroom_content_selections.
--
--   mode = 'addition': a brand-new question with no official counterpart —
--   e.g. a teacher adding a 4th MCQ about a source that only ever had 3.
--   Has no classroom_content_selections row (there's no official slot to
--   swap), so it owns its own draft/published status directly.
--
-- related_source_id is presentational only (which source card the Manage
-- Content editor groups a question under) — null means "General questions,"
-- not an error; it does not affect grading or student-facing resolution.
--
-- This migration has not been applied to the live project yet (same status
-- 0006/0007 shipped in) — 0007 IS now confirmed applied (verified live via a
-- real write against classroom_content_selections during this session), so
-- this migration's slot_kind check can safely reuse its generalized set.

create table custom_content_items (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references classrooms(id) on delete cascade,
  case_id text not null,
  slot_kind text not null check (slot_kind in ('source', 'mcq', 'sequencing', 'evidence-organizing', 'hipp')),
  mode text not null check (mode in ('replacement', 'addition')),
  replaces_official_id text,
  related_source_id text,
  content jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint custom_content_items_replaces_check check (
    (mode = 'replacement' and replaces_official_id is not null)
    or (mode = 'addition' and replaces_official_id is null)
  )
);

alter table classroom_content_selections
  add column alt_kind text not null default 'curated' check (alt_kind in ('curated', 'custom'));

-- ============================================================================
-- RLS
-- ============================================================================

alter table custom_content_items enable row level security;

-- Teacher has full CRUD on their own classroom's rows.
create policy "cci_teacher_all" on custom_content_items
  for all using (is_classroom_teacher(classroom_id)) with check (is_classroom_teacher(classroom_id));

-- A claimed student may read: any 'replacement' row (visibility for these is
-- still gated client-side by whether classroom_content_selections actually
-- has a published row pointing at it, same as curated alternates today), or
-- an 'addition' row only once it's published — an unpublished net-new
-- question must never leak to students the way an unpublished swap
-- couldn't, matching classroom_content_selections' own student policy.
create policy "cci_student_select" on custom_content_items
  for select using (
    exists (
      select 1 from roster_slots rs
      where rs.classroom_id = custom_content_items.classroom_id and rs.auth_user_id = auth.uid()
    )
    and (mode = 'replacement' or status = 'published')
  );
