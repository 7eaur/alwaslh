// Actual service execution with a deterministic query double. This is NOT PostgreSQL integration evidence.
// Run from apps/api: node --import tsx ../../docs/audits/evidence/reproduce-assessment-access.mjs
import assert from 'node:assert/strict';
import { StudentAssessmentService } from '../../../apps/api/src/student-assessment/service.ts';

let status = 'in_progress';
let accessChecks = 0;
const db = {
  async query(sql) {
    if (sql.includes('from practice_sessions ps')) return [{
      id: 'session', profile_id: 'student', mode: 'test', status,
      quiz_id: 'quiz', quiz_title: 'Owned assessment', quiz_description: null,
      class_id: 'class', subject_id: 'subject', quiz_version_id: 'version',
      version_number: 1, version_label: null, current_question_id: null,
      started_at: new Date(0), completed_at: null,
    }];
    if (sql.includes('student_entitlements')) { accessChecks++; return []; }
    if (sql.includes("set status = 'abandoned'")) { status = 'abandoned'; return []; }
    if (sql.includes('from practice_session_questions psq')) return [{
      id: 'question', position: 0, lesson_id: 'lesson', type: 'direct',
      prompt: 'Protected question', answer_text: 'Answer', explanation: null,
      source_page: null, question_bank_item_id: null, question_bank_revision_id: null,
      method: null, selected_option_id: null, direct_answer_text: null,
    }];
    if (sql.includes('from practice_session_options') || sql.includes('from quiz_attempts')) return [];
    throw new Error(`Unexpected query: ${sql}`);
  },
  transaction(work) { return work(this); },
};
const service = new StudentAssessmentService(db);
await assert.rejects(service.session('student', 'session'), (error) => error.statusCode === 404 || error.status === 404);
const checksBefore = accessChecks;
await service.abandon('student', 'session');
const view = await service.session('student', 'session');
assert.equal(view.questions[0].prompt, 'Protected question');
assert.equal(accessChecks, checksBefore);
console.log(JSON.stringify({ finding: 'FPA-002', evidence: 'SERVICE_WITH_QUERY_DOUBLE', inProgressDenied: true, abandonedReturnsQuestion: true, additionalAccessChecks: accessChecks - checksBefore }, null, 2));
