/**
 * Minimal local override store backing the two currently-broken Author Mode
 * content fields (see docs/teacher-mode/MINIMAL-LOCAL-OVERRIDES.md).
 *
 * This is deliberately just a flat field-path-patch blob in localStorage —
 * the `TeacherOverride` *shape* from the platform architecture proposal,
 * none of the surrounding TeacherWorld/PublicationVersion/publish machinery.
 * Per docs/architecture/ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md §7 item 7.
 *
 * Stable-key convention: overrides are keyed by the content object's own
 * stable `id` (e.g. UNIT_01.id === "unit-01"), never a visible title, so an
 * override survives a copy edit to the title it's overriding. Field names
 * are restricted to a known allow-list, not free-form strings.
 */
import { z } from "zod";

const STORAGE_KEY = "republic-builder.chronicle.teacher-overrides.v1";

// Add a field name here only once a real Author Mode input edits it.
const SUPPORTED_FIELD_NAMES = ["title", "centralQuestion"];

const FieldValueSchema = z.string().max(4000);

function sanitizeStore(raw) {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};
  const clean = {};
  for (const [contentId, fields] of Object.entries(raw)) {
    if (typeof contentId !== "string" || !contentId) continue;
    if (typeof fields !== "object" || fields === null || Array.isArray(fields)) continue;
    const cleanFields = {};
    for (const [fieldName, value] of Object.entries(fields)) {
      if (!SUPPORTED_FIELD_NAMES.includes(fieldName)) continue;
      const parsed = FieldValueSchema.safeParse(value);
      if (parsed.success) cleanFields[fieldName] = parsed.data;
    }
    if (Object.keys(cleanFields).length > 0) clean[contentId] = cleanFields;
  }
  return clean;
}

function readStore() {
  try {
    return sanitizeStore(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
  } catch {
    return {};
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getOverride(contentId, fieldName) {
  return readStore()[contentId]?.[fieldName];
}

export function hasOverride(contentId, fieldName) {
  return getOverride(contentId, fieldName) !== undefined;
}

// Resolves the value Author Mode / student-facing screens should render:
// the teacher's override when one exists, otherwise the official content
// value. Never mutates officialValue or the content module it came from.
export function resolveField(contentId, fieldName, officialValue) {
  const override = getOverride(contentId, fieldName);
  return override !== undefined ? override : officialValue;
}

export function setOverride(contentId, fieldName, value) {
  if (!SUPPORTED_FIELD_NAMES.includes(fieldName)) return readStore();
  const parsed = FieldValueSchema.safeParse(value);
  if (!parsed.success) return readStore();
  const store = readStore();
  const next = {
    ...store,
    [contentId]: { ...store[contentId], [fieldName]: parsed.data },
  };
  writeStore(next);
  return next;
}

export function clearOverride(contentId, fieldName) {
  const store = readStore();
  if (!store[contentId] || !(fieldName in store[contentId])) return store;
  const restFields = { ...store[contentId] };
  delete restFields[fieldName];
  const next = { ...store };
  if (Object.keys(restFields).length === 0) {
    delete next[contentId];
  } else {
    next[contentId] = restFields;
  }
  writeStore(next);
  return next;
}

export function clearAllOverrides(contentId) {
  const store = readStore();
  if (!store[contentId]) return store;
  const next = { ...store };
  delete next[contentId];
  writeStore(next);
  return next;
}
