/**
 * student_world_profiles read/write. Scoped by (studentUserId, classroomId,
 * packId) per supabase/migrations/0001_init.sql's unique constraint —
 * "chronicle" is the only packId that exists today, generalizing later
 * doesn't require a schema change.
 */
import { supabase } from "../lib/supabase-client.js";

const PACK_ID = "chronicle";

export async function pullRemoteProgress(studentUserId, classroomId) {
  const { data, error } = await supabase
    .from("student_world_profiles")
    .select("progress, updated_at")
    .eq("student_user_id", studentUserId)
    .eq("classroom_id", classroomId)
    .eq("pack_id", PACK_ID)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { progress: data.progress, updatedAt: data.updated_at };
}

export async function pushRemoteProgress(studentUserId, classroomId, progress) {
  const { error } = await supabase.from("student_world_profiles").upsert(
    {
      student_user_id: studentUserId,
      classroom_id: classroomId,
      pack_id: PACK_ID,
      progress,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_user_id,classroom_id,pack_id" }
  );
  if (error) throw error;
}
