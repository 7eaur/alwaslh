import { useState } from "react";
import type {
  AiGenerationOutputApi,
  AiQuestionApi,
  AiSourceEvidenceApi,
} from "./ai-operations-api";
import type {
  AiGenerationOutputView,
  AiQuestionType,
  AiQuestionView,
  AiSourceEvidenceView,
} from "./ai-operations-view-model";
import {
  answerStatusLabel,
  difficultyLabel,
  questionTypeLabel,
} from "./ai-operations-view-model";
import "./ai-structured-output-editor.css";

interface Props {
  initialOutput: AiGenerationOutputView;
  disabled: boolean;
  onSubmit: (output: AiGenerationOutputApi, note: string) => Promise<boolean>;
  onCancel: () => void;
}

function sourceEvidence(source: AiSourceEvidenceView): AiSourceEvidenceApi {
  return {
    mediaAssetId: source.mediaAssetId,
    pageNumber: source.pageNumber,
    ...(source.ocrExtractionId ? { ocrExtractionId: source.ocrExtractionId } : {}),
    ...(source.quote ? { quote: source.quote } : {}),
  };
}

function question(questionValue: AiQuestionView): AiQuestionApi {
  return {
    prompt: questionValue.prompt,
    type: questionValue.type,
    options: [...questionValue.options],
    correctOptionIndex: questionValue.correctOptionIndex,
    answerText: questionValue.answerText,
    answerStatus: questionValue.answerStatus,
    difficulty: questionValue.difficulty,
    explanation: questionValue.explanation,
    method: questionValue.method,
    sourceEvidence: questionValue.sourceEvidence.map(sourceEvidence),
  };
}

function toEditableOutput(output: AiGenerationOutputView): AiGenerationOutputApi {
  if (output.kind === "summary") {
    return {
      kind: "summary",
      summary: output.summary,
      sourceEvidence: output.sourceEvidence.map(sourceEvidence),
    };
  }
  if (output.kind === "question_set") {
    return { kind: "question_set", questions: output.questions.map(question) };
  }
  if (output.kind === "lesson_content") {
    return {
      kind: "lesson_content",
      summary: output.summary,
      summaryEvidence: output.summaryEvidence.map(sourceEvidence),
      questions: output.questions.map(question),
    };
  }
  if (output.kind === "multi_version_quiz") {
    return {
      kind: "multi_version_quiz",
      versions: output.versions.map((version) => ({
        label: version.label,
        questions: version.questions.map(question),
      })),
    };
  }
  return {
    kind: "page_detection",
    title: output.title,
    pageNumber: output.pageNumber,
    contentPreview: output.contentPreview,
    sourceEvidence: output.sourceEvidence.map(sourceEvidence),
  };
}

function normalizeQuestionType(questionValue: AiQuestionApi, type: AiQuestionType): AiQuestionApi {
  if (type === "multiple_choice") {
    const options = Array.from({ length: 4 }, (_, index) => questionValue.options[index] ?? "");
    const correctOptionIndex = questionValue.answerStatus === "known"
      ? Math.min(questionValue.correctOptionIndex ?? 0, 3)
      : null;
    return {
      ...questionValue,
      type,
      options,
      correctOptionIndex,
      answerText: correctOptionIndex === null ? null : options[correctOptionIndex] || null,
    };
  }
  if (type === "true_false") {
    const options = ["صح", "خطأ"];
    const correctOptionIndex = questionValue.answerStatus === "known"
      ? Math.min(questionValue.correctOptionIndex ?? 0, 1)
      : null;
    return {
      ...questionValue,
      type,
      options,
      correctOptionIndex,
      answerText: correctOptionIndex === null ? null : options[correctOptionIndex],
    };
  }
  return {
    ...questionValue,
    type,
    options: [],
    correctOptionIndex: null,
    answerText: questionValue.answerStatus === "known" ? questionValue.answerText : null,
  };
}

function questionError(questionValue: AiQuestionApi, index: number): string | null {
  if (!questionValue.prompt.trim()) return `السؤال ${index + 1}: نص السؤال مطلوب.`;
  if (questionValue.type === "multiple_choice") {
    if (questionValue.options.length !== 4 || questionValue.options.some((option) => !option.trim())) {
      return `السؤال ${index + 1}: الاختيار المتعدد يحتاج أربعة خيارات مكتملة.`;
    }
  }
  if (questionValue.answerStatus === "known") {
    if (questionValue.type === "direct" && !questionValue.answerText?.trim()) {
      return `السؤال ${index + 1}: الإجابة المباشرة مطلوبة عندما تكون الإجابة مثبتة.`;
    }
    if (
      questionValue.type !== "direct" &&
      (questionValue.correctOptionIndex === null || !questionValue.options[questionValue.correctOptionIndex]?.trim())
    ) {
      return `السؤال ${index + 1}: اختر الإجابة الصحيحة.`;
    }
  }
  return null;
}

function validate(output: AiGenerationOutputApi): string | null {
  if (output.kind === "summary" && !output.summary.trim()) return "نص الملخص مطلوب.";
  if (output.kind === "page_detection") {
    if (!output.title.trim()) return "عنوان الصفحة مطلوب.";
    if (!output.contentPreview.trim()) return "معاينة المحتوى مطلوبة.";
  }
  if (output.kind === "lesson_content" && !output.summary.trim()) return "ملخص الدرس مطلوب.";

  const questionGroups = output.kind === "question_set"
    ? [output.questions]
    : output.kind === "lesson_content"
      ? [output.questions]
      : output.kind === "multi_version_quiz"
        ? output.versions.map((version) => version.questions)
        : [];
  let offset = 0;
  for (const group of questionGroups) {
    for (const [index, questionValue] of group.entries()) {
      const error = questionError(questionValue, offset + index);
      if (error) return error;
    }
    offset += group.length;
  }
  if (output.kind === "multi_version_quiz" && output.versions.some((version) => !version.label.trim())) {
    return "اسم كل نموذج اختبار مطلوب.";
  }
  return null;
}

export function AiStructuredOutputEditor({ initialOutput, disabled, onSubmit, onCancel }: Props) {
  const [draft, setDraft] = useState<AiGenerationOutputApi>(() => toEditableOutput(initialOutput));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    const validationError = validate(draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    if (await onSubmit(draft, note.trim())) onCancel();
  }

  return (
    <section className="ai-structured-editor" aria-label="تحرير النتيجة">
      <div className="ai-structured-editor-heading">
        <div>
          <h5>تحرير المحتوى</h5>
          <p>عدّل المحتوى التعليمي فقط. المصادر والإحالات محفوظة كما هي، والخادم يعيد التحقق قبل الحفظ.</p>
        </div>
      </div>

      {draft.kind === "summary" ? (
        <label>
          <span>الملخص</span>
          <textarea rows={8} value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} />
        </label>
      ) : null}

      {draft.kind === "page_detection" ? (
        <div className="ai-structured-fields">
          <label><span>العنوان</span><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
          <label><span>رقم الصفحة</span><input type="number" min={1} value={draft.pageNumber ?? ""} onChange={(event) => setDraft({ ...draft, pageNumber: event.target.value ? Math.max(1, Number(event.target.value)) : null })} /></label>
          <label className="is-wide"><span>معاينة المحتوى</span><textarea rows={8} value={draft.contentPreview} onChange={(event) => setDraft({ ...draft, contentPreview: event.target.value })} /></label>
        </div>
      ) : null}

      {draft.kind === "lesson_content" ? (
        <label>
          <span>ملخص الدرس</span>
          <textarea rows={8} value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} />
        </label>
      ) : null}

      {draft.kind === "question_set" ? (
        <QuestionEditors questions={draft.questions} onChange={(questions) => setDraft({ ...draft, questions })} />
      ) : null}

      {draft.kind === "lesson_content" ? (
        <QuestionEditors questions={draft.questions} onChange={(questions) => setDraft({ ...draft, questions })} />
      ) : null}

      {draft.kind === "multi_version_quiz" ? (
        <div className="ai-structured-versions">
          {draft.versions.map((version, versionIndex) => (
            <section className="ai-structured-version" key={`${versionIndex}-${version.label}`}>
              <label>
                <span>اسم النموذج {versionIndex + 1}</span>
                <input
                  value={version.label}
                  onChange={(event) => setDraft({
                    ...draft,
                    versions: draft.versions.map((item, index) => index === versionIndex ? { ...item, label: event.target.value } : item),
                  })}
                />
              </label>
              <QuestionEditors
                questions={version.questions}
                onChange={(questions) => setDraft({
                  ...draft,
                  versions: draft.versions.map((item, index) => index === versionIndex ? { ...item, questions } : item),
                })}
              />
            </section>
          ))}
        </div>
      ) : null}

      <label>
        <span>ملاحظة المراجعة (اختيارية)</span>
        <textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
      </label>
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      <div className="ai-review-editor-actions">
        <button className="primary-button" type="button" disabled={disabled} onClick={() => void submit()}>حفظ التعديل والتحقق</button>
        <button className="secondary-button" type="button" disabled={disabled} onClick={onCancel}>إلغاء</button>
      </div>
    </section>
  );
}

function QuestionEditors({ questions, onChange }: { questions: AiQuestionApi[]; onChange: (questions: AiQuestionApi[]) => void }) {
  return (
    <div className="ai-structured-questions">
      {questions.length === 0 ? <p className="empty-inline">لا توجد أسئلة في هذه النتيجة.</p> : null}
      {questions.map((questionValue, index) => (
        <QuestionEditor
          key={index}
          index={index}
          question={questionValue}
          onChange={(next) => onChange(questions.map((item, itemIndex) => itemIndex === index ? next : item))}
        />
      ))}
    </div>
  );
}

function QuestionEditor({ index, question: questionValue, onChange }: { index: number; question: AiQuestionApi; onChange: (question: AiQuestionApi) => void }) {
  function patch(patchValue: Partial<AiQuestionApi>) {
    onChange({ ...questionValue, ...patchValue });
  }

  function setAnswerStatus(answerStatus: AiQuestionApi["answerStatus"]) {
    if (answerStatus !== "known") {
      patch({ answerStatus, correctOptionIndex: null, answerText: null });
      return;
    }
    if (questionValue.type === "direct") {
      patch({ answerStatus, correctOptionIndex: null, answerText: questionValue.answerText ?? "" });
      return;
    }
    const correctOptionIndex = questionValue.correctOptionIndex ?? 0;
    patch({
      answerStatus,
      correctOptionIndex,
      answerText: questionValue.options[correctOptionIndex] ?? null,
    });
  }

  return (
    <fieldset className="ai-structured-question">
      <legend>السؤال {index + 1}</legend>
      <label className="is-wide"><span>نص السؤال</span><textarea rows={3} value={questionValue.prompt} onChange={(event) => patch({ prompt: event.target.value })} /></label>
      <div className="ai-structured-fields">
        <label>
          <span>النوع</span>
          <select value={questionValue.type} onChange={(event) => onChange(normalizeQuestionType(questionValue, event.target.value as AiQuestionType))}>
            {(["multiple_choice", "true_false", "direct"] as const).map((type) => <option value={type} key={type}>{questionTypeLabel(type)}</option>)}
          </select>
        </label>
        <label>
          <span>الصعوبة</span>
          <select value={questionValue.difficulty} onChange={(event) => patch({ difficulty: event.target.value as AiQuestionApi["difficulty"] })}>
            {(["easy", "medium", "hard"] as const).map((difficulty) => <option value={difficulty} key={difficulty}>{difficultyLabel(difficulty)}</option>)}
          </select>
        </label>
        <label>
          <span>حالة الإجابة</span>
          <select value={questionValue.answerStatus} onChange={(event) => setAnswerStatus(event.target.value as AiQuestionApi["answerStatus"])}>
            {(["known", "unknown", "review_required"] as const).map((status) => <option value={status} key={status}>{answerStatusLabel(status)}</option>)}
          </select>
        </label>
      </div>

      {questionValue.type !== "direct" ? (
        <div className="ai-structured-options">
          {questionValue.options.map((option, optionIndex) => (
            <label key={optionIndex}>
              <span>الخيار {optionIndex + 1}</span>
              <input
                value={option}
                disabled={questionValue.type === "true_false"}
                onChange={(event) => {
                  const options = questionValue.options.map((item, indexValue) => indexValue === optionIndex ? event.target.value : item);
                  const answerText = questionValue.answerStatus === "known" && questionValue.correctOptionIndex !== null
                    ? options[questionValue.correctOptionIndex] ?? null
                    : questionValue.answerText;
                  patch({ options, answerText });
                }}
              />
            </label>
          ))}
        </div>
      ) : null}

      {questionValue.answerStatus === "known" && questionValue.type !== "direct" ? (
        <label>
          <span>الإجابة الصحيحة</span>
          <select
            value={questionValue.correctOptionIndex ?? 0}
            onChange={(event) => {
              const correctOptionIndex = Number(event.target.value);
              patch({ correctOptionIndex, answerText: questionValue.options[correctOptionIndex] ?? null });
            }}
          >
            {questionValue.options.map((option, optionIndex) => <option value={optionIndex} key={optionIndex}>{option || `الخيار ${optionIndex + 1}`}</option>)}
          </select>
        </label>
      ) : null}

      {questionValue.answerStatus === "known" && questionValue.type === "direct" ? (
        <label><span>الإجابة</span><textarea rows={2} value={questionValue.answerText ?? ""} onChange={(event) => patch({ answerText: event.target.value })} /></label>
      ) : null}

      <div className="ai-structured-fields">
        <label><span>الشرح (اختياري)</span><textarea rows={3} value={questionValue.explanation ?? ""} onChange={(event) => patch({ explanation: event.target.value.trim() ? event.target.value : null })} /></label>
        <label><span>الطريقة (اختيارية)</span><textarea rows={3} value={questionValue.method ?? ""} onChange={(event) => patch({ method: event.target.value.trim() ? event.target.value : null })} /></label>
      </div>

      {questionValue.sourceEvidence.length > 0 ? (
        <p className="ai-structured-source-note">المصادر محفوظة: {questionValue.sourceEvidence.map((source) => `ص${source.pageNumber}`).join("، ")}</p>
      ) : null}
    </fieldset>
  );
}
