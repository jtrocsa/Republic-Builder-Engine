import { describe, it, expect } from "vitest";
import { computeAssignmentReport } from "../../apps/web/src/main.js";

const assignment = { taskType: "saq", taskId: "unit-03-archive-common-cause-saq" };

const roster = [
  { status: "claimed" },
  { status: "claimed" },
  { status: "claimed" },
  { status: "unclaimed" },
  { status: "disabled" },
];

describe("computeAssignmentReport", () => {
  it("counts only claimed roster seats as the denominator (normal case)", () => {
    const report = computeAssignmentReport(assignment, roster, [], new Set());
    expect(report.claimedCount).toBe(3);
    expect(report.submittedCount).toBe(0);
    expect(report.gradedCount).toBe(0);
  });

  it("dedupes multiple submissions from the same student instead of double-counting (normal case)", () => {
    const submissions = [
      { taskType: "saq", taskId: assignment.taskId, studentUserId: "s1", evaluationId: "e1" },
      { taskType: "saq", taskId: assignment.taskId, studentUserId: "s1", evaluationId: "e2" },
      { taskType: "saq", taskId: assignment.taskId, studentUserId: "s2", evaluationId: "e3" },
    ];
    const report = computeAssignmentReport(assignment, roster, submissions, new Set());
    expect(report.submittedCount).toBe(2);
  });

  it("only counts a student as graded if one of their matching submissions has a graded evaluation (normal case)", () => {
    const submissions = [
      { taskType: "saq", taskId: assignment.taskId, studentUserId: "s1", evaluationId: "e1" },
      { taskType: "saq", taskId: assignment.taskId, studentUserId: "s2", evaluationId: "e2" },
    ];
    const gradedEvaluationIds = new Set(["e1"]);
    const report = computeAssignmentReport(assignment, roster, submissions, gradedEvaluationIds);
    expect(report.submittedCount).toBe(2);
    expect(report.gradedCount).toBe(1);
  });

  it("ignores submissions for a different task_type/task_id (boundary case)", () => {
    const submissions = [
      { taskType: "dbq", taskId: assignment.taskId, studentUserId: "s1", evaluationId: "e1" },
      { taskType: "saq", taskId: "some-other-quest", studentUserId: "s2", evaluationId: "e2" },
    ];
    const report = computeAssignmentReport(assignment, roster, submissions, new Set(["e1", "e2"]));
    expect(report.submittedCount).toBe(0);
    expect(report.gradedCount).toBe(0);
  });

  it("returns all zeros for an empty classroom (boundary case)", () => {
    const report = computeAssignmentReport(assignment, [], [], new Set());
    expect(report).toEqual({ claimedCount: 0, submittedCount: 0, gradedCount: 0 });
  });
});
