/**
 * Submissions/evaluations/manual-grades — all RLS-scoped, no service-role
 * calls here. submissions/evaluations are written once and never updated
 * (immutability is enforced at the RLS layer too, see
 * supabase/migrations/0001_init.sql); a re-grade is always a new
 * manual_grades row, never an update to an old one.
 */
import { supabase } from "../lib/supabase-client.js";
import { getSession } from "./remote-auth-repository.js";

// No-ops (rather than throwing) when signed out, so the AI-feedback UX in
// main.js keeps working locally-only for an unauthenticated/offline player —
// see evaluator-requests.js/evaluator-client.js, which call this after a
// successful /api/evaluate response.
export async function recordSubmission({
  classroomId,
  taskType,
  taskId,
  prompt,
  stimulus,
  sourceMetadata,
  elementsAsked,
  studentResponse,
  isRevision,
  feedback,
  model,
}) {
  const session = await getSession();
  if (!session || !classroomId) return null;

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .insert({
      student_user_id: session.user.id,
      classroom_id: classroomId,
      task_type: taskType,
      task_id: taskId,
      prompt,
      stimulus: stimulus ?? null,
      source_metadata: sourceMetadata ?? null,
      elements_asked: elementsAsked ?? null,
      student_response: studentResponse,
      is_revision: Boolean(isRevision),
    })
    .select("id")
    .single();
  if (submissionError) {
    console.error("recordSubmission: submission insert failed", submissionError);
    return null;
  }

  const { error: evaluationError } = await supabase.from("evaluations").insert({
    submission_id: submission.id,
    feedback,
    model,
  });
  if (evaluationError) {
    console.error("recordSubmission: evaluation insert failed", evaluationError);
  }

  return submission.id;
}

export async function listForClassroom(classroomId) {
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, task_type, task_id, prompt, stimulus, student_response, created_at, student_user_id, profiles!inner(display_name), evaluations(id, feedback, model, created_at)"
    )
    .eq("classroom_id", classroomId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return data.map((row) => {
    const evaluation = Array.isArray(row.evaluations) ? row.evaluations[0] : row.evaluations;
    return {
      id: row.id,
      taskType: row.task_type,
      taskId: row.task_id,
      prompt: row.prompt,
      stimulus: row.stimulus,
      studentResponse: row.student_response,
      studentDisplayName: row.profiles?.display_name ?? "Unknown student",
      createdAt: row.created_at,
      evaluationId: evaluation?.id ?? null,
      feedback: evaluation?.feedback ?? null,
      readiness: evaluation?.feedback?.readiness ?? null,
    };
  });
}

export async function getSubmissionWithGrades(submissionId) {
  const { data: submission, error } = await supabase
    .from("submissions")
    .select(
      "id, task_type, task_id, prompt, stimulus, student_response, created_at, profiles!inner(display_name), evaluations(id, feedback, model, created_at)"
    )
    .eq("id", submissionId)
    .single();
  if (error) throw error;

  const evaluation = Array.isArray(submission.evaluations)
    ? submission.evaluations[0]
    : submission.evaluations;

  let grades = [];
  if (evaluation) {
    const { data: gradeRows, error: gradesError } = await supabase
      .from("manual_grades")
      .select("id, grade_label, teacher_feedback, created_at")
      .eq("evaluation_id", evaluation.id)
      .order("created_at", { ascending: false });
    if (gradesError) throw gradesError;
    grades = gradeRows;
  }

  return {
    id: submission.id,
    taskType: submission.task_type,
    taskId: submission.task_id,
    prompt: submission.prompt,
    stimulus: submission.stimulus,
    studentResponse: submission.student_response,
    studentDisplayName: submission.profiles?.display_name ?? "Unknown student",
    evaluationId: evaluation?.id ?? null,
    feedback: evaluation?.feedback ?? null,
    grades,
  };
}

export async function recordManualGrade(evaluationId, gradeLabel, teacherFeedback) {
  const session = await getSession();
  if (!session) throw new Error("Sign in required.");

  const { error } = await supabase.from("manual_grades").insert({
    evaluation_id: evaluationId,
    teacher_user_id: session.user.id,
    grade_label: gradeLabel,
    teacher_feedback: teacherFeedback || null,
  });
  if (error) throw error;
}
