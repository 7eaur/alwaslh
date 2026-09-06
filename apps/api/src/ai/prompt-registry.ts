import type {
  AiGenerationMode,
  AiGenerationOutputKind,
  AiGenerationRequest,
  AiPromptEnvelope,
} from "./contracts.js";
import { aiGenerationRequestSchema } from "./contracts.js";

export interface AiPromptDefinition {
  key: string;
  version: string;
  mode: AiGenerationMode;
  outputKind: AiGenerationOutputKind;
  exactSource: boolean;
  requiresHumanReview: boolean;
  instructions: readonly string[];
}

const COMMON_ARABIC_RULES = [
  "اكتب المحتوى التعليمي باللغة العربية الفصحى الواضحة، ولا تستخدم لغة إنجليزية مرئية إلا داخل الرموز والصيغ العلمية التي تتطلب ذلك.",
  "استخدم الأرقام العربية ٠١٢٣٤٥٦٧٨٩ في النص العربي المرئي عندما لا يكون الوضع نسخاً حرفياً للمصدر.",
  "حافظ على الأرقام والحروف الغربية داخل الصيغ الكيميائية والعلمية مثل H2O وFe3O4 وCO2.",
  "لا تخترع معلومة أو إجابة غير مدعومة بالمصدر. إذا لم يثبت الدليل الإجابة فاستخدم answerStatus=unknown أو review_required ولا تضع correctOptionIndex تخمينياً.",
  "كل سؤال مولد أو مستخرج من كتاب يجب أن يحمل sourceEvidence يشير إلى mediaAssetId ورقم الصفحة الحقيقي.",
  "أرجع بنية البيانات المطلوبة فقط؛ لا تضف markdown أو شرحاً خارج العقد.",
] as const;

const DEFINITIONS: readonly AiPromptDefinition[] = [
  {
    key: "lesson.summary",
    version: "1.0.0",
    mode: "lesson_summary",
    outputKind: "summary",
    exactSource: false,
    requiresHumanReview: false,
    instructions: [
      "لخّص النصوص المعتمدة فقط، مع الحفاظ على التعريفات والقوانين والنقاط الأساسية دون إضافة معرفة خارجية.",
      "اربط الملخص بمراجع الصفحات التي استند إليها.",
    ],
  },
  {
    key: "questions.generate",
    version: "1.0.0",
    mode: "question_generation",
    outputKind: "question_set",
    exactSource: false,
    requiresHumanReview: false,
    instructions: [
      "ولّد العدد المطلوب بالضبط من أسئلة الاختيار من متعدد والصح/الخطأ والمباشر حسب target.",
      "الاختيار من متعدد يملك أربعة خيارات بالضبط، والصح/الخطأ يملك [صح، خطأ] بالترتيب.",
      "نوّع الصعوبة دون تكرار السؤال أو إعادة صياغة نفس الفكرة بشكل قريب داخل الدفعة.",
      "كل إجابة known يجب أن تطابق option المشار إليه أو answerText في السؤال المباشر.",
    ],
  },
  {
    key: "lesson.comprehensive",
    version: "1.0.0",
    mode: "comprehensive_lesson_content",
    outputKind: "lesson_content",
    exactSource: false,
    requiresHumanReview: false,
    instructions: [
      "أنشئ ملخصاً منظماً ثم الأسئلة المطلوبة بالضبط من نفس المصادر المعتمدة.",
      "لا تعتبر كثرة المخرجات بديلاً عن صحة الإجابة والمصدر والصفحة.",
    ],
  },
  {
    key: "quiz.multi_version",
    version: "1.0.0",
    mode: "multi_version_quiz",
    outputKind: "multi_version_quiz",
    exactSource: false,
    requiresHumanReview: false,
    instructions: [
      "أنشئ عدد النماذج المطلوب بالضبط، وكل نموذج يلتزم targetPerVersion حرفياً.",
      "لا تكرر السؤال نفسه أو سؤالاً شبه مطابق بين النماذج.",
      "كل نموذج يبقى ضمن نفس نطاق المصادر والصفحات المسموح بها.",
    ],
  },
  {
    key: "questions.extract_exact",
    version: "1.0.0",
    mode: "exact_question_extraction",
    outputKind: "question_set",
    exactSource: true,
    requiresHumanReview: true,
    instructions: [
      "انسخ نص السؤال والخيارات كما يثبتها المصدر؛ لا تصحح ولا تعيد الصياغة.",
      "يجب أن يتضمن sourceEvidence اقتباساً من النص المعتمد يثبت السؤال عندما يكون مسار OCR متاحاً.",
      "إذا لم تكن الإجابة ظاهرة أو مثبتة في المصدر فلا تستخدم المعرفة الخارجية؛ اجعل answerStatus=unknown أو review_required.",
    ],
  },
  {
    key: "exam.extract_exact",
    version: "1.0.0",
    mode: "exact_exam_extraction",
    outputKind: "question_set",
    exactSource: true,
    requiresHumanReview: true,
    instructions: [
      "حافظ على عدد الأسئلة وترتيبها وأنواعها وخياراتها كما في ورقة الامتحان الأصلية.",
      "الأسئلة المباشرة تستخدم type=direct وoptions=[] وcorrectOptionIndex=null.",
      "لا تخمّن إجابة غير ظاهرة أو غير مثبتة؛ answerStatus=unknown/review_required هو السلوك الصحيح.",
    ],
  },
  {
    key: "questions.replica_exact",
    version: "1.0.0",
    mode: "replica_question_extraction",
    outputKind: "question_set",
    exactSource: true,
    requiresHumanReview: true,
    instructions: [
      "حافظ على العدد والترتيب والنوع وعدد الخيارات والنص كما يظهر في المصدر؛ هذا وضع نسخ/استخراج وليس توليد سؤال جديد.",
      "أي جزء غير مقروء يبقى غير مؤكد ويحتاج مراجعة بدلاً من الاختراع.",
    ],
  },
  {
    key: "question.regenerate",
    version: "1.0.0",
    mode: "regenerate_question",
    outputKind: "question_set",
    exactSource: false,
    requiresHumanReview: false,
    instructions: [
      "أعد صياغة سؤال واحد فقط بأسلوب مختلف، مع الحفاظ على نوعه ومستوى صعوبته ونطاق مصدره.",
      "يجب أن يكون السؤال الجديد مختلفاً فعلياً عن prompt الأصلي وألا يخرج عن المصدر.",
    ],
  },
  {
    key: "page.detect",
    version: "1.0.0",
    mode: "page_detection",
    outputKind: "page_detection",
    exactSource: false,
    requiresHumanReview: true,
    instructions: [
      "استخرج رقم الصفحة والعنوان إن كانا ظاهرين. إذا لم يثبت رقم الصفحة فأرجع null ولا تخترع رقماً.",
      "contentPreview وصف قصير للمحتوى وليس بديلاً عن OCR المعتمد.",
    ],
  },
] as const;

const definitionByMode = new Map<AiGenerationMode, AiPromptDefinition>();
const identitySet = new Set<string>();
for (const definition of DEFINITIONS) {
  const identity = `${definition.key}@${definition.version}`;
  if (definitionByMode.has(definition.mode)) throw new Error(`duplicate_ai_prompt_mode:${definition.mode}`);
  if (identitySet.has(identity)) throw new Error(`duplicate_ai_prompt_identity:${identity}`);
  definitionByMode.set(definition.mode, definition);
  identitySet.add(identity);
}

export function listPromptDefinitions(): readonly AiPromptDefinition[] {
  return DEFINITIONS;
}

export function getPromptDefinition(mode: AiGenerationMode): AiPromptDefinition {
  const definition = definitionByMode.get(mode);
  if (!definition) throw new Error(`ai_prompt_not_registered:${mode}`);
  return definition;
}

export function buildPromptEnvelope(input: AiGenerationRequest): AiPromptEnvelope {
  const request = aiGenerationRequestSchema.parse(input);
  const definition = getPromptDefinition(request.mode);
  return {
    promptKey: definition.key,
    promptVersion: definition.version,
    mode: definition.mode,
    outputKind: definition.outputKind,
    systemInstructions: [...COMMON_ARABIC_RULES, ...definition.instructions],
    request,
  };
}
