/**
 * Classroom-wide unit floor for Teacher Mode's "advance to next unit"
 * control. enabled_unit_index is an index into main.js's UNITS array; a
 * higher index is always an early-access floor, never a ceiling — main.js
 * additively unions the enabled units' first cases into a student's own
 * progress.unlocked, so a student who's already further ahead via normal
 * play is never demoted by this value.
 */
import { supabase } from "../lib/supabase-client.js";
import { getSession } from "./remote-auth-repository.js";

export async function getClassroomUnitFloor(classroomId) {
  const { data, error } = await supabase
    .from("classroom_unit_progress")
    .select("enabled_unit_index")
    .eq("classroom_id", classroomId)
    .maybeSingle();
  if (error) throw error;
  return data?.enabled_unit_index ?? 0;
}

export async function advanceClassroomUnit(classroomId, maxIndex) {
  const session = await getSession();
  if (!session) throw new Error("Sign in required.");

  const current = await getClassroomUnitFloor(classroomId);
  const next = Math.min(current + 1, maxIndex);
  const { data, error } = await supabase
    .from("classroom_unit_progress")
    .upsert(
      {
        classroom_id: classroomId,
        enabled_unit_index: next,
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "classroom_id" }
    )
    .select("enabled_unit_index")
    .single();
  if (error) throw error;
  return data.enabled_unit_index;
}
