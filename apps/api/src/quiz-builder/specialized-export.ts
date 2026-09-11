import type { Database } from "../db.js";
import { AppError } from "../errors.js";
import type { MediaStorage } from "../media/storage.js";
import type {
  QuizBuilderDetail,
  QuizBuilderQuestionView,
  QuizBuilderService,
  QuizBuilderVersionView,
} from "./service.js";

export type QuizPrintVariant =
  | "questions_options"
  | "questions_only"
  | "questions_answers"
  | "answers_explanations"
  | "answer_key"
  | "lesson_names"
  | "lesson_images";

export interface QuizSpecializedExportBundle {
  filenameBase: string;
  csv: string;
  printHtml: string;
}

function spreadsheetSafe(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${spreadsheetSafe(text).replaceAll('"', '""')}"`;
}

function htmlEscape(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeFilename(value: string): string {
  return (
    Array.from(value)
      .filter((character) => character.charCodeAt(0) >= 32)
      .join("")
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .slice(0, 120) || "quiz-export"
  );
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

function selectedVersions(
  detail: QuizBuilderDetail,
  versionIds: readonly string[],
): QuizBuilderVersionView[] {
  if (detail.quiz.status !== "review" && detail.quiz.status !== "published") {
    throw new AppError("CONFLICT", "التصدير متاح فقط لاختبار قيد المراجعة أو منشور", 409);
  }
  const ids = [...new Set(versionIds)];
  if (ids.length === 0 || ids.length > 20) {
    throw new AppError("BAD_REQUEST", "اختر من نموذج واحد إلى 20 نموذجًا", 400);
  }
  const versionMap = new Map(detail.versions.map((version) => [version.id, version]));
  const versions = ids.map((id) => versionMap.get(id));
  if (versions.some((version) => !version)) {
    throw new AppError("NOT_FOUND", "أحد النماذج المحددة غير موجود", 404);
  }
  return versions as QuizBuilderVersionView[];
}

function buildCsv(quizTitle: string, versions: readonly QuizBuilderVersionView[]): string {
  const header = [
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
  const rows = versions.flatMap((version) =>
    version.questions.map((question) => [
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
    ]),
  );
  const lines = [header, ...rows].map((row) => row.map(csvCell).join(","));
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

function baseHtml(title: string, body: string): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>${htmlEscape(title)}</title>
<style>
:root{font-family:"Noto Sans Arabic",Tahoma,Arial,sans-serif;color:#111827}body{max-width:900px;margin:28px auto;padding:0 24px;line-height:1.75}header{border-bottom:2px solid #111827;padding-bottom:14px;margin-bottom:22px}h1,h2,p{margin-top:0}.version{break-before:page;margin-bottom:30px}.version:first-of-type{break-before:auto}.question{break-inside:avoid;border-bottom:1px solid #d1d5db;padding:0 0 18px;margin:0 0 20px}.meta{color:#4b5563}.options{padding-right:24px}.answer,.explanation{margin-top:8px;padding:8px 10px;background:#f3f4f6;border-radius:6px}.lesson-image{break-inside:avoid;margin:0 0 24px}.lesson-image img{display:block;max-width:100%;height:auto;margin:8px auto}.lesson-list{font-size:1.1rem}@media print{body{max-width:none;margin:0;padding:0}.version{page-break-before:always}.version:first-of-type{page-break-before:auto}}
</style>
</head>
<body><header><h1>${htmlEscape(title)}</h1></header>${body}</body></html>`;
}

function questionHtml(question: QuizBuilderQuestionView, index: number, variant: QuizPrintVariant): string {
  const options = question.options.length
    ? `<ol class="options">${question.options
        .map((option) => `<li>${htmlEscape(option.text)}</li>`)
        .join("")}</ol>`
    : "";
  const answer = `<section class="answer"><strong>الإجابة:</strong> ${htmlEscape(
    correctAnswer(question),
  )}</section>`;
  const explanation = question.explanation
    ? `<section class="explanation"><strong>الشرح:</strong> ${htmlEscape(question.explanation)}</section>`
    : "";
  if (variant === "answer_key") {
    return `<p>${index + 1}. ${htmlEscape(correctAnswer(question))}</p>`;
  }
  if (variant === "answers_explanations") {
    return `<article class="question"><h2>${index + 1}. ${htmlEscape(
      question.prompt,
    )}</h2>${answer}${explanation}</article>`;
  }
  const includeOptions = variant === "questions_options" || variant === "questions_answers";
  const includeAnswer = variant === "questions_answers";
  return `<article class="question"><h2>${index + 1}. ${htmlEscape(
    question.prompt,
  )}</h2><p class="meta">${htmlEscape(typeLabel(question.type))}</p>${
    includeOptions ? options : ""
  }${includeAnswer ? answer : ""}</article>`;
}

export class QuizSpecializedExportService {
  constructor(
    private readonly quizzes: QuizBuilderService,
    private readonly database: Database,
    private readonly storage: MediaStorage,
  ) {}

  async bundle(
    quizId: string,
    versionIds: readonly string[],
    variant: QuizPrintVariant,
  ): Promise<QuizSpecializedExportBundle> {
    const detail = await this.quizzes.detail(quizId);
    const versions = selectedVersions(detail, versionIds);
    const filenameBase = safeFilename(
      `${detail.quiz.title}-${versions.map((version) => version.label).join("-")}`,
    );
    let body = "";
    if (variant === "lesson_names") {
      body = `<section><h2>دروس الاختبار</h2><ol class="lesson-list">${detail.lessons
        .map((lesson) => `<li>${htmlEscape(lesson.title)}</li>`)
        .join("")}</ol></section>`;
    } else if (variant === "lesson_images") {
      const assets = await this.lessonImageAssets(quizId);
      body = assets
        .map(
          (asset) =>
            `<figure class="lesson-image"><figcaption>${htmlEscape(
              asset.lesson_title,
            )} · صفحة ${asset.position + 1}</figcaption><img src="/v1/admin/quizzes/${encodeURIComponent(
              quizId,
            )}/export-assets/${encodeURIComponent(asset.asset_id)}" alt="${htmlEscape(
              asset.lesson_title,
            )}" /></figure>`,
        )
        .join("");
      if (!body) {
        throw new AppError("CONFLICT", "لا توجد صور دروس منشورة قابلة للتصدير", 409);
      }
    } else {
      body = versions
        .map(
          (version) =>
            `<section class="version"><h2>${htmlEscape(version.label)}</h2>${version.questions
              .map((question, index) => questionHtml(question, index, variant))
              .join("")}</section>`,
        )
        .join("");
    }
    return {
      filenameBase,
      csv: buildCsv(detail.quiz.title, versions),
      printHtml: baseHtml(detail.quiz.title, body),
    };
  }

  async asset(quizId: string, assetId: string): Promise<{ mimeType: string; bytes: Buffer }> {
    const rows = await this.database.query<{
      storage_key: string;
      mime_type: string;
    }>(
      `select v.storage_key, v.mime_type
       from lesson_assets la
       join quiz_lessons ql on ql.lesson_id = la.lesson_id and ql.quiz_id = $1
       join media_variants v on v.media_asset_id = la.media_asset_id and v.kind = 'display'
       where la.id = $2 and la.publication_status = 'published'
       order by v.created_at desc
       limit 1`,
      [quizId, assetId],
    );
    const asset = rows[0];
    if (!asset) {
      throw new AppError("NOT_FOUND", "صورة الدرس غير متاحة لهذا الاختبار", 404);
    }
    return {
      mimeType: asset.mime_type,
      bytes: await this.storage.read(asset.storage_key),
    };
  }

  private lessonImageAssets(quizId: string) {
    return this.database.query<{
      asset_id: string;
      lesson_title: string;
      position: number;
    }>(
      `select la.id as asset_id, l.title as lesson_title, la.position
       from quiz_lessons ql
       join lessons l on l.id = ql.lesson_id
       join lesson_assets la
         on la.lesson_id = l.id and la.publication_status = 'published'
       where ql.quiz_id = $1
         and la.media_asset_id is not null
         and exists (
           select 1 from media_variants v
           where v.media_asset_id = la.media_asset_id and v.kind = 'display'
         )
       order by ql.position, la.position, la.id`,
      [quizId],
    );
  }
}
