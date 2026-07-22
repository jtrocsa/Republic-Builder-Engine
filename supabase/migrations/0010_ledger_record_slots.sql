-- Generalizes classroom_content_selections.slot_kind and
-- custom_content_items.slot_kind from {source, mcq, sequencing,
-- evidence-organizing, hipp} to also include 'ledger-record' — Manage
-- Content now supports swapping Case 1.02's Exchange Ledger records
-- (apps/web/src/content/unit-01-campaign.js's EXCHANGE_RECORDS), the same
-- curated-alternate-pool mechanism already used for sources/quests,
-- following the exact widening pattern 0007_generalize_content_slots.sql
-- used for the original quest types.
--
-- Case 1.08's Founding Debate ledger (FOUNDING_RECORDS) is NOT included in
-- this pass — it stays on the old read-only preview path
-- (LEDGER_PREVIEW_RECORDS_BY_CASE in main.js) until a future pass extends
-- editing there too.
--
-- This migration has not been applied to the live project yet (same status
-- 0006-0009 shipped in) — apply by hand via the Supabase SQL editor.

alter table classroom_content_selections
  drop constraint classroom_content_selections_slot_kind_check;

alter table classroom_content_selections
  add constraint classroom_content_selections_slot_kind_check
  check (slot_kind in ('source', 'mcq', 'sequencing', 'evidence-organizing', 'hipp', 'ledger-record'));

alter table custom_content_items
  drop constraint custom_content_items_slot_kind_check;

alter table custom_content_items
  add constraint custom_content_items_slot_kind_check
  check (slot_kind in ('source', 'mcq', 'sequencing', 'evidence-organizing', 'hipp', 'ledger-record'));
