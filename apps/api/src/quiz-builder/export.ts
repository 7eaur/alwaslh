import { AppError } from "../errors.js";
import type { QuizBuilderQuestionView, QuizBuilderService, QuizBuilderVersionView } from "./service.js";

export interface QuizVersionExportBundle {
  filenameBase: string;
  csv: string;
  printHtml: string;
}

function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function htmlEscape(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function typeLabel(type: QuizBuilderQuestionView["type"]): string {
  if (type === "multiple_choice") return "اختيار متعدد";
  if (type === "true_false") return "صح / خطأ";
  return "مباشر";
}

function correctAnswer(question: QuizBuilderQuestionView): string {
  if (question.type === "direct") return question.answerText ?? "";
  return question.options.find((option) => option.isCorrect)?.text ?? "";
}

function safeFilename(value: string): string {
  const normalized = value.trim().replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "-").replace(/\s+/g, " ");
  return normalized.slice(0, 120) || "quiz-version";
}

function buildCsv(quizTitle: string, version: QuizBuilderVersionView): string {
  const headers = [
    "الاختبار",
    "النموذج",
    "الترتيب",
    "النوع",
    "السؤال",
    "الخيار 1",
    "الخيار 2",
    "الخيار 3",
    "الخيار 4",
    "الإجابة الصحيحة",
    "الشرح",
    "صفحة المصدر",
    "مرجع المصدر",
    "Question Bank Item",
    "Question Bank Revision",
  ];
  const rows = version.questions.map((question) => [
    quizTitle,
    version.label,
    question.position + 1,
    typeLabel(question.type),
    question.prompt,
    question.options[0]?.text ?? "",
    question.options[1]?.text ?? "",
    question.options[2]?.text ?? "",
    question.options[3]?.text ?? "",
    correctAnswer(question),
    question.explanation ?? "",
    question.sourcePage ?? "",
    question.sourceReference ?? "",
    question.questionBankItemId ?? "",
    question.questionBankRevisionId ?? "",
  ]);
  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

function buildPrintHtml(quizTitle: string, version: QuizBuilderVersionView): string {
  const questions = version.questions
    .map((question, index) => {
      const options = question.options.length
        ? `<ol class="options">${question.options
            .map((option) => `<li>${htmlEscape(option.text)}</li>`)
            .join("")}</ol>`
        : "";
      const provenance = [
        question.sourcePage ? `صفحة ${question.sourcePage}` : "",
        question.questionBankRevisionId ? `Revision ${question.questionBankRevisionId}` : "",
      ]
        .filter(Boolean)
        .join(" · ");
      return `<article class="question">
        <h2>${index + 1}. ${htmlEscape(question.prompt)}</h2>
        <p class="meta">${htmlEscape(typeLabel(question.type))}${provenance ? ` · ${htmlEscape(provenance)}` : ""}</p>
        ${options}
        <section class="answer"><strong>الإجابة:</strong> ${htmlEscape(correctAnswer(question))}</section>
        ${question.explanation ? `<section class="explanation"><strong>الشرح:</strong> ${htmlEscape(question.explanation)}</section>` : ""}
      </article>`;
    })
    .join("");

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>${htmlEscape(quizTitle)} — ${htmlEscape(version.label)}</title>
<style>
  :root { font-family: "Noto Sans Arabic", Tahoma, Arial, sans-serif; color: #111827; }
  body { max-width: 900px; margin: 32px auto; padding: 0 24px; line-height: 1.7; }
  header { border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 24px; }
  header h1 { margin: 0; font-size: 1.7rem; }
  header p, .meta { color: #4b5563; }
  .question { break-inside: avoid; margin: 0 0 24px; padding: 0 0 20px; border-bottom: 1px solid #d1d5db; }
  .question h2 { margin: 0 0 6px; font-size: 1.15rem; }
  .options { padding-right: 24px; }
  .answer, .explanation { margin-top: 10px; padding: 10px 12px; background: #f3f4f6; border-radius: 6px; }
  @media print { body { max-width: none; margin: 0; padding: 0; } .question { page-break-inside: avoid; } }
</style>
</head>
<body>
<header>
  <h1>${htmlEscape(quizTitle)}</h1>
  <p>${htmlEscape(version.label)} · ${version.questions.length} سؤال</p>
</header>
${questions}
</body>
</html>`;
}

export class QuizVersionExportService {
  constructor(private readonly quizzes: QuizBuilderService) {}

  async bundle(quizId: string, versionId: string): Promise<QuizVersionExportBundle> {
    const detail = await this.quizzes.detail(quizId);
    if (detail.quiz.status !== "review" && detail.quiz.status !== "published") {
      throw new AppError("CONFLICT", "التصدير متاح فقط لاختبار قيد المراجعة أو منشور", 409);
    }
    const version = detail.versions.find((candidate) => candidate.id === versionId);
    if (!version) throw new AppError("NOT_FOUND", "نموذج الاختبار غير موجود", 404);
    const filenameBase = safeFilename(`${detail.quiz.title}-${version.label}`);
    return {
      filenameBase,
      csv: buildCsv(detail.quiz.title, version),
      printHtml: buildPrintHtml(detail.quiz.title, version),
    };
  }
}
