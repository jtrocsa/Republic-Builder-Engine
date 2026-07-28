/**
 * Assignments (Phase 50D): a teacher-created (task_type, task_id, due_at)
 * record layered on top of the existing submissions/evaluations/
 * manual_grades tables (0001_init.sql) — "class outcome reporting" is a
 * client-side join against data the teacher dashboard already loads (see
 * computeAssignmentReport in main.js), not a second reporting table.
 */
import { supabase } from "../lib/supabase-client.js";
import { getSession } from "./remote-auth-repository.js";

export async function listClassroomAssignments(classroomId) {
  const { data, error } = await supabase
    .from("assignments")
    .select("id, title, task_type, task_id, due_at, created_at")
    .eq("classroom_id", classroomId)
    .order("due_at", { ascending: true });
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    taskType: row.task_type,
    taskId: row.task_id,
    dueAt: row.due_at,
    createdAt: row.created_at,
  }));
}

export async function createAssignment(classroomId, { title, taskType, taskId, dueAt }) {
  const session = await getSession();
  if (!session) throw new Error("Sign in required.");

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      classroom_id: classroomId,
      teacher_user_id: session.user.id,
      title,
      task_type: taskType,
      task_id: taskId,
      due_at: dueAt,
    })
    .select("id, title, task_type, task_id, due_at, created_at")
    .single();
  if (error) throw error;
  return {
    id: data.id,
    title: data.title,
    taskType: data.task_type,
    taskId: data.task_id,
    dueAt: data.due_at,
    createdAt: data.created_at,
  };
}

export async function deleteAssignment(assignmentId) {
  const { error } = await supabase.from("assignments").delete().eq("id", assignmentId);
  if (error) throw error;
}
