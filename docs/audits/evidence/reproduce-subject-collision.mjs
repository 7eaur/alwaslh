// Baseline reproduction, not a regression test that should pass after repair.
// Run from repository root: node --experimental-strip-types docs/audits/evidence/reproduce-subject-collision.mjs
import assert from 'node:assert/strict';
import { findStudentSubject, studentSubjectHref } from '../../../apps/student-web/src/student-learning-model.ts';

const subject = (lessonId) => ({ id: 'shared-english', name: 'English', sections: [], unsectionedLessons: [{ id: lessonId }] });
const catalog = { classes: [
  { id: 'grade-9', subjects: [subject('g9-lesson')] },
  { id: 'grade-12', subjects: [subject('g12-lesson')] },
] };
const selected = catalog.classes[1];
const resolved = findStudentSubject(catalog, selected.subjects[0].id);
const result = {
  finding: 'FPA-001', selectedClass: selected.id, resolvedClass: resolved.classRecord.id,
  identicalHref: studentSubjectHref(catalog.classes[0].subjects[0].id) === studentSubjectHref(selected.subjects[0].id),
};
assert.equal(result.identicalHref, true);
assert.notEqual(result.selectedClass, result.resolvedClass);
console.log(JSON.stringify(result, null, 2));
