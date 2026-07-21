/**
 * Teacher Dashboard "Sources" tab: a classroom's curated pool of candidate
 * sources per unit (table classroom_unit_source_pool,
 * supabase/migrations/0009_classroom_unit_source_pool.sql). Row presence =
 * selected for that unit; deleting the row = deselected. Unlike
 * classroom_content_selections (remote-content-selection-repository.js),
 * this has no case/slot association and no draft/publish lifecycle — it's a
 * lighter-weight preference list a teacher builds before a source ever
 * becomes a real mission swap choice.
 */
import { supabase } from "../lib/supabase-client.js";
import { getSession } from "./remote-auth-repository.js";

export async function getUnitSourcePool(classroomId, unitNumber) {
  const { data, error } = await supabase
    .from("classroom_unit_source_pool")
    .select("source_id")
    .eq("classroom_id", classroomId)
    .eq("unit_number", unitNumber);
  if (error) throw error;
  return new Set(data.map((row) => row.source_id));
}

export async function setSourceInPool(classroomId, unitNumber, sourceId, sourceKind, selected) {
  if (!selected) {
    const { error } = await supabase
      .from("classroom_unit_source_pool")
      .delete()
      .eq("classroom_id", classroomId)
      .eq("unit_number", unitNumber)
      .eq("source_id", sourceId);
    if (error) throw error;
    return;
  }
  const session = await getSession();
  if (!session) throw new Error("Sign in required.");

  const { error } = await supabase.from("classroom_unit_source_pool").upsert(
    {
      classroom_id: classroomId,
      unit_number: unitNumber,
      source_id: sourceId,
      source_kind: sourceKind,
      updated_by: session.user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "classroom_id,unit_number,source_id" }
  );
  if (error) throw error;
}
