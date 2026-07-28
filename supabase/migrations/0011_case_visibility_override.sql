-- Widens content_overrides.field_name to also allow 'navTableVisible' — the
-- per-classroom Navigation Table visibility toggle (Phase 48C), stored as
-- the string "true"/"false" through the same generic (contentId, fieldName,
-- value) override system title/centralQuestion already use, rather than a
-- new table. Following the exact widening pattern
-- 0007_generalize_content_slots.sql/0010_ledger_record_slots.sql used for
-- classroom_content_selections/custom_content_items.slot_kind.
--
-- This migration has not been applied to the live project yet (same status
-- 0006-0010 shipped in) — apply by hand via the Supabase SQL editor.

alter table content_overrides
  drop constraint content_overrides_field_name_check;

alter table content_overrides
  add constraint content_overrides_field_name_check
  check (field_name in ('title', 'centralQuestion', 'navTableVisible'));
