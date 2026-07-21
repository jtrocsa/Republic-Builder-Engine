-- Generalizes classroom_content_selections.slot_kind from {source, mcq-quest}
-- to {source, mcq, sequencing, evidence-organizing, hipp} — the Manage
-- Content editor now supports swapping any of the 4 quest-type slots
-- (apps/web/src/quest-types/index.js's QUEST_TYPES keys), not just MCQ.
-- 'mcq-quest' is renamed to 'mcq' to match those keys exactly, so slot_kind
-- can be passed straight into renderQuest/gradeQuest without translation.
--
-- This migration has not been applied to the live project yet (same status
-- as 0006_teacher_mode.sql when it shipped) — added as a new file rather
-- than editing 0006 in place, since 0006 may already have been run by hand
-- via the Supabase SQL editor.

update classroom_content_selections set slot_kind = 'mcq' where slot_kind = 'mcq-quest';

alter table classroom_content_selections
  drop constraint classroom_content_selections_slot_kind_check;

alter table classroom_content_selections
  add constraint classroom_content_selections_slot_kind_check
  check (slot_kind in ('source', 'mcq', 'sequencing', 'evidence-organizing', 'hipp'));
