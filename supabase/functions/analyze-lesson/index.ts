import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Generate a unique 6-digit sequential question number
 */
function generateQuestionSerial(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return (timestamp.slice(-3) + random).padStart(6, '0');
}

/**
 * تعقيم نص JSON من الأحرف الضابطة (Control Characters) قبل التحليل.
 * هذا يمنع خطأ: "Bad control character in string literal in JSON"
 * الذي يحدث عندما يضع الذكاء الاصطناعي أسطراً حقيقية داخل قيم JSON.
 */
function sanitizeJsonString(jsonStr: string): string {
  // استبدال الأحرف الضابطة الحقيقية داخل قيم السلاسل النصية بنظيراتها المهربة
  // نمر على كل حرف: إذا كنا داخل سلسلة نصية واجهنا حرفاً ضابطاً نستبدله
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < jsonStr.length; i++) {
    const ch = jsonStr[i];
    const code = jsonStr.charCodeAt(i);

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === '\\' && inString) {
      result += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }

    if (inString && code < 0x20) {
      // حرف ضابط داخل سلسلة نصية - استبداله بنظيره المهرب
      switch (code) {
        case 0x09: result += '\\t'; break;  // tab
        case 0x0A: result += '\\n'; break;  // newline
        case 0x0D: result += '\\r'; break;  // carriage return
        case 0x0C: result += '\\f'; break;  // form feed
        case 0x08: result += '\\b'; break;  // backspace
        default:
          result += `\\u${code.toString(16).padStart(4, '0')}`;
      }
      continue;
    }

    result += ch;
  }

  return result;
}

/**
 * Robust JSON extraction from a string that might contain markdown or extra text.
 */
function extractJson(text: string) {
  const startIdx = Math.min(
    text.indexOf('{') === -1 ? Infinity : text.indexOf('{'),
    text.indexOf('[') === -1 ? Infinity : text.indexOf('[')
  );
  const endIdx = Math.max(
    text.lastIndexOf('}') === -1 ? -1 : text.lastIndexOf('}'),
    text.lastIndexOf(']') === -1 ? -1 : text.lastIndexOf(']')
  );

  if (startIdx === Infinity || endIdx === -1) return null;
  return text.substring(startIdx, endIdx + 1);
}

/**
 * Attempts to repair a truncated JSON array or object.
 */
function repairTruncatedJson(jsonStr: string) {
  try {
    JSON.parse(jsonStr);
    return jsonStr;
  } catch (e) {
    // Basic repair for truncated arrays of objects
    let repaired = jsonStr.trim();
    
    // If it ends with a comma, remove it
    if (repaired.endsWith(',')) repaired = repaired.slice(0, -1);
    
    // Count open/close braces
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    
    // If we are inside an object
    if (openBraces > closeBraces) {
      // If we likely cut off inside a string or key, we can't easily fix it perfectly,
      // but we can try to close the current object.
      repaired += '"}'; // Close potential string + object
      for (let i = 0; i < openBraces - closeBraces - 1; i++) repaired += '}';
    }
    
    // Close potential array
    if (openBrackets > closeBrackets) {
      for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']';
    }
    
    // Close final root object if needed
    if (!repaired.endsWith('}') && openBraces > closeBraces) repaired += '}';
    
    try {
      JSON.parse(repaired);
      return repaired;
    } catch (e2) {
      return jsonStr; // Return original if repair fails
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { imageUrls, text, task, question_count, version_count, lesson_title, page_range, subject_id, lesson_id, pageOffset } = body;

    const apiKey = Deno.env.get("INTEGRATIONS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // REMOVED: No need to fetch all subject lessons (causes slowness)
    // Questions will reference only the current lesson images
    const subjectLessonsContext = '';

    let prompt = "";
    let parts: any[] = [];

    if (task === "generate_summary" || task === "generate_questions" || task === "extract_text" || task === "extract_questions") {
      if (task === "generate_summary") {
        prompt = `أنت خبير في تلخيص المحتوى التعليمي. قم بتحليل صور الكتاب المدرسي المقدمة وتوليد ملخص شامل ومنظم باللغة العربية.
        
        متطلبات الملخص:
        1. اكتب الملخص بالعربية الفصحى الواضحة
        2. استخدم الأرقام العربية فقط: ٠، ١، ٢، ٣، ٤، ٥، ٦، ٧، ٨، ٩ (استثناء: أرقام وأحرف الصيغ الكيميائية مثل Fe3O4 وH2O وCO2 تبقى كما هي بالأرقام الغربية)
        3. **CRITICAL - أرقام الأس (القوى)**: استخدم الأرقام العربية للأس أيضاً:
           - صحيح: ع٢ (ع مربع)، ع٣ (ع تكعيب)، ٢٥ (٢ أس ٥)
           - خطأ: ع² أو ع³ أو ٢⁵ (لا تستخدم الأرقام الإنجليزية المرتفعة)
           - مثال: ع٢ + ٢ع + ١ = ٠ (وليس ع² + ٢ع + ١ = ٠)
        4. استخدم الرموز الرياضية العربية:
           - للجمع: +
           - للطرح: -
           - للضرب: × (وليس x أو *)
           - للقسمة: ÷ (وليس / أو :)
           - للمساواة: =
           - للتساوي: ≠
           - أكبر من: >
           - أصغر من: <
           - أكبر من أو يساوي: ≥
           - أصغر من أو يساوي: ≤
        5. **معالجة الرموز الخاصة**: 
           - إذا رأيت رمز خط فوق الرقم (مثل ̅)، اكتبه كـ "خط فوق" أو استخدم الرمز المناسب
           - مثال: ٢ ̅ع يمكن كتابته كـ "٢ع مع خط فوقه" أو استخدم الرمز ‾
        6. اكتب جميع القوانين والمعادلات بالرموز العربية
        7. اكتب جميع المصطلحات العلمية بالعربية
        6. ضمّن النقاط الرئيسية والتعريفات والمفاهيم الأساسية
        
        أرجع فقط JSON خام: {"summary": "..."}`;
      } else if (task === "generate_questions") {
        const mcqCount = (body as any).mcq_count || 0;
        const trueFalseCount = (body as any).true_false_count || 0;
        const requestedCount = (body as any).question_count;
        const questionType = (body as any).question_type || 'both'; // 'mcq', 'true_false', or 'both'
        
        let typeInstructions = '';
        let countInstructions = '';
        
        // If specific counts provided, use them
        if (mcqCount > 0 || trueFalseCount > 0) {
          const actualMcq = mcqCount || 0;
          const actualTf = trueFalseCount || 0;
          typeInstructions = `
        1. CRITICAL: Generate EXACTLY ${actualMcq} Multiple-Choice Questions (MCQ) with 4 options each.
        2. CRITICAL: Generate EXACTLY ${actualTf} True/False Questions with 2 options: ["صح", "خطأ"].
        3. Total questions generated MUST BE EXACTLY ${actualMcq + actualTf}.`;
        } else if (questionType === 'mcq') {
          // MCQ ONLY
          countInstructions = requestedCount && requestedCount > 0 
            ? `Generate EXACTLY ${requestedCount} Multiple-Choice Questions (MCQ).`
            : `Generate 10-15 high-quality Multiple-Choice Questions (MCQ) that cover the most important concepts.`;
          typeInstructions = `
        1. CRITICAL: Generate ONLY Multiple-Choice Questions (MCQ).
        2. CRITICAL: Each MCQ must have EXACTLY 4 options.
        3. CRITICAL: DO NOT generate any True/False questions.
        4. Each question must have 'type': "mcq".
        5. Focus on key concepts and important information.`;
        } else if (questionType === 'true_false') {
          // TRUE/FALSE ONLY
          countInstructions = requestedCount && requestedCount > 0 
            ? `Generate EXACTLY ${requestedCount} True/False Questions.`
            : `Generate 10-15 high-quality True/False Questions that cover the most important concepts.`;
          typeInstructions = `
        1. CRITICAL: Generate ONLY True/False Questions.
        2. CRITICAL: Each True/False question must have EXACTLY 2 options: ["صح", "خطأ"].
        3. CRITICAL: DO NOT generate any Multiple-Choice questions.
        4. Each question must have 'type': "true_false".
        5. Focus on key facts and important statements.`;
        } else if (requestedCount && requestedCount > 0) {
          // Both types with specific count
          countInstructions = `Generate EXACTLY ${requestedCount} questions total.`;
          typeInstructions = `
        1. Generate a mix of Multiple-Choice (MCQ) and True/False (T/F) questions.
        2. MCQ: 4 options, 1 correct index (0-3).
        3. T/F: 2 options ["صح", "خطأ"], 1 correct index (0 or 1).`;
        } else {
          // Both types, no count specified - generate reasonable number of questions
          countInstructions = `Generate 10-15 high-quality questions that cover the most important concepts in the content. Focus on key information, main ideas, and critical details.`;
          typeInstructions = `
        1. Generate a mix of Multiple-Choice (MCQ) and True/False (T/F) questions.
        2. MCQ: 4 options, 1 correct index (0-3).
        3. T/F: 2 options ["صح", "خطأ"], 1 correct index (0 or 1).
        4. Focus on the most important and relevant information.
        5. Generate questions at different difficulty levels (easy, medium, hard).
        6. Ensure questions are clear, accurate, and test understanding.`;
        }
        
        prompt = `أنت خبير في إنشاء الاختبارات التعليمية. قم بتحليل صور الكتاب المدرسي المقدمة وتوليد أسئلة عالية الجودة باللغة العربية تغطي جميع المحتوى بشكل شامل.
        
        المتطلبات:
        ${countInstructions}
        ${typeInstructions}
        
        معايير جودة الأسئلة:
        1. استخرج الأسئلة من محتوى وفقرات وشروحات الدروس - وليس من عناوين الدروس أو أرقام الصفحات.
        2. اكتشف مستوى صعوبة كل سؤال بناءً على تعقيد المعلومات في المحتوى:
           - سهل (easy): للمفاهيم الأساسية والتعريفات البسيطة
           - متوسط (medium): للشروحات والتطبيقات
           - صعب (hard): للتحليل والاستنتاجات والأسئلة الذكائية
        3. وزع مستويات الصعوبة بشكل طبيعي حسب محتوى الدروس.
        4. تأكد من أن كل سؤال يغطي معلومات حقيقية من المحتوى المقدم.
        5. لا تكرر الأسئلة.
        6. غطِ جميع المحتوى: المفاهيم، التعريفات، الأمثلة، الشروحات، التفاصيل.
        
        متطلبات اللغة والرموز (إلزامية):
        1. استخدم الأرقام العربية فقط: ٠، ١، ٢، ٣، ٤، ٥، ٦، ٧، ٨، ٩ (استثناء: أرقام وأحرف الصيغ الكيميائية مثل Fe3O4 وH2O وCO2 تبقى كما هي بالأرقام الغربية)
        2. استخدم الرموز الرياضية العربية: + - × ÷ = ≠ > < ≥ ≤
        3. استخدم الحروف العربية للمتغيرات: س، ص، ع، أ، ب، ج
        4. الدوال المثلثية بالعربي: sin → جا (جيب)، cos → جتا (جيب التمام)، tan → ظا (ظل)
           المتغيرات الفيزيائية بالعربي: R→ن (نصف القطر)، V→ف (السرعة)، g→ع (التسارع)، e→هـ (الشحنة)، L→ل (الحث)، I→ت (التيار)، t→ز (الزمن)
        5. في الشرح (explanation) والحل (method): اكتب المعادلة بالرموز العربية أولاً ثم بالإنجليزي بين قوسين.
           مثال: ن = (ف₀² × جا(٢θ)) ÷ ع ← ثم (R = (V₀² × sin(2θ))/g).
        6. اكتب جميع القوانين والمعادلات بالرموز العربية

        ═══════════════════════════════════════════════════
        ⛔ CRITICAL — التحقق الإلزامي من صحة الإجابة (لكل سؤال بدون استثناء):
        ═══════════════════════════════════════════════════
        قبل كتابة correct_option_index لأي سؤال، نفّذ هذه الخطوات بالترتيب:

        خطوة 1: حدّد الإجابة الصحيحة للسؤال بشكل قاطع.
          - للآيات القرآنية: الكلمة أو العبارة الحرفية من المصحف الشريف هي الإجابة الصحيحة 100%.
            مثال: "يا حسرة على العباد ما يأتيهم من ......" → الإجابة من القرآن = "رسول" ← هذه هي الإجابة الوحيدة الصحيحة.
          - للأحاديث النبوية: النص الحرفي من الحديث.
          - للمعلومات العلمية/التاريخية: ما ورد بالضبط في الصور المرفقة.

        خطوة 2: ابحث عن الإجابة الصحيحة في مصفوفة options وحدّد رقم موضعها:
          - الموضع الأول  → correct_option_index = 0
          - الموضع الثاني → correct_option_index = 1
          - الموضع الثالث → correct_option_index = 2
          - الموضع الرابع → correct_option_index = 3
          مثال: options = ["ذكر", "الرحمن", "نبي", "رسول"] والإجابة الصحيحة هي "رسول"
          → "رسول" في الموضع الرابع → correct_option_index = 3

        خطوة 3: تحقق من الاتساق — options[correct_option_index] يجب أن يساوي الإجابة الصحيحة:
          - إذا كتبتَ في explanation أن الإجابة هي "رسول" → يجب أن يكون options[correct_option_index] = "رسول"
          - إذا لم يتطابقا → أصلح correct_option_index حتى يتطابقا.

        ⛔ خطأ شائع يجب تجنّبه:
          - options = ["ذكر", "الرحمن", "نبي", "رسول"] والإجابة الصحيحة "رسول" → correct_option_index = 3 ✅
          - لا تكتب correct_option_index = 2 (نبي) بينما الشرح يقول "رسول" ← هذا خطأ فادح ❌

        المرفقات والتوضيحات (إلزامية لكل سؤال):
        1. type: نوع السؤال (mcq أو true_false)
        2. difficulty: مستوى الصعوبة (easy/medium/hard)
        3. explanation: شرح مفصل للإجابة الصحيحة باللغة العربية — يجب أن يذكر نفس الإجابة الموجودة في options[correct_option_index]
        4. method: طريقة الحل والمنطق المستخدم للوصول للإجابة
        5. source_reference: مرجع دقيق يحدد مكان المعلومة من الصور المرفقة (مثال: "الصفحة ١٥ - الفقرة الثانية")
        6. question_references: مصفوفة تحتوي على مراجع السؤال من الصور المرفقة فقط
           - كل مرجع يحتوي على: {"lesson_title": "عنوان الدرس", "page_number": "رقم الصفحة", "paragraph_location": "موقع الفقرة"}
           - اكتشف عنوان الدرس ورقم الصفحة من الصور المرفقة مباشرة (لا تبحث في دروس أخرى)
        
        أرجع فقط JSON خام: {"questions": [{"question": "...", "options": [...], "correct_option_index": 0, "type": "mcq", "difficulty": "easy", "explanation": "...", "method": "...", "source_reference": "...", "question_references": [{"lesson_title": "...", "page_number": "...", "paragraph_location": "..."}]}]}`;
      } else { // extract_text
        prompt = `Act as a high-quality OCR and text extraction tool. Extract ALL the text from the provided images in Arabic. 
        Maintain the structure and order of the content.
        Return ONLY a raw JSON object: {"text": "..."}`;
      }
      
      parts = [{ text: prompt }];
      const maxImages = 8; // Reduced from 12 for faster processing (same as summary)
      const imagesToProcess = (imageUrls || []).slice(0, maxImages);
      let totalSizeKb = 0;
      const MAX_TOTAL_SIZE_KB = 10000; // Reduced from 12MB to 10MB for faster upload

      for (const url of imagesToProcess) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status} fetching image`);
          
          const blob = await response.blob();
          const buffer = await blob.arrayBuffer();
          const encodedData = encode(new Uint8Array(buffer));
          
          const sizeKb = encodedData.length / 1024;
          if (totalSizeKb + sizeKb > MAX_TOTAL_SIZE_KB) {
             console.log(`Reached total size limit (${totalSizeKb.toFixed(1)}KB), skipping remaining images`);
             break;
          }
          
          parts.push({ 
            inlineData: { 
              mimeType: blob.type || "image/jpeg", 
              data: encodedData 
            } 
          });
          totalSizeKb += sizeKb;
        } catch (e) {
          console.error(`Failed to fetch image: ${url}`, e);
        }
      }
    } else if (task === "generate_multi_version_quiz" && text) {
      const mcqCount = body.mcq_count || 0;
      const trueFalseCount = body.true_false_count || 0;
      const totalQuestionsPerVersion = (mcqCount + trueFalseCount) || (body as any).question_count || 5;
      
      let questionTypeInstructions = '';
      if (mcqCount > 0 && trueFalseCount > 0) {
        questionTypeInstructions = `
        7. CRITICAL: Generate EXACTLY ${mcqCount} multiple-choice questions (MCQ) PER VERSION, each with 4 options.
        8. CRITICAL: Generate EXACTLY ${trueFalseCount} true/false questions PER VERSION, with 2 options: ["صح", "خطأ"].
        9. Total questions PER VERSION must be ${totalQuestionsPerVersion}.
        10. Mix both types naturally in each version, but the counts must be exact.`;
      } else if (mcqCount > 0) {
        questionTypeInstructions = `
        7. All questions must be multiple-choice (MCQ) per version, each with 4 options. Total questions per version: ${mcqCount}.`;
      } else if (trueFalseCount > 0) {
        questionTypeInstructions = `
        7. All questions must be true/false per version, with 2 options: ["صح", "خطأ"]. Total questions per version: ${trueFalseCount}.`;
      }
      
      prompt = `أنت خبير في إنشاء الاختبارات التعليمية. قم بتوليد نماذج اختبارات متعددة باللغة العربية من المحتوى المقدم.
      
      المتطلبات الأساسية:
      1. عدد النماذج: ${version_count || 1} نموذج بالضبط.
      2. عدد الأسئلة لكل نموذج: ${totalQuestionsPerVersion} سؤال بالضبط.
      3. حرج جداً: يجب أن تكون جميع الأسئلة فريدة عبر جميع النماذج. إجمالي الأسئلة الفريدة المطلوبة: ${(version_count || 1) * totalQuestionsPerVersion}.
      4. لا تكرر أي سؤال في أي نموذج.${questionTypeInstructions}
      
      معايير جودة الأسئلة:
      1. استخرج الأسئلة من محتوى وفقرات وشروحات الدروس المقدمة - وليس من عناوين الدروس أو أرقام الصفحات.
      2. اكتشف مستوى صعوبة كل سؤال بناءً على تعقيد المعلومات في المحتوى:
         - سهل (easy): للمفاهيم الأساسية والتعريفات البسيطة
         - متوسط (medium): للشروحات والتطبيقات
         - صعب (hard): للتحليل والاستنتاجات والأسئلة الذكائية
      3. وزع مستويات الصعوبة بشكل طبيعي حسب محتوى الدروس.
      4. تأكد من أن كل سؤال يغطي معلومات حقيقية من المحتوى المقدم.
      
      متطلبات اللغة والرموز (إلزامية):
      1. استخدم الأرقام العربية فقط: ٠، ١، ٢، ٣، ٤، ٥، ٦، ٧، ٨، ٩ (استثناء: أرقام وأحرف الصيغ الكيميائية مثل Fe3O4 وH2O وCO2 تبقى كما هي بالأرقام الغربية)
      2. استخدم الرموز الرياضية العربية: + - × ÷ = ≠ > < ≥ ≤
      3. اكتب جميع القوانين والمعادلات بالرموز العربية
      4. استخدم الحروف العربية للمتغيرات: س، ص، ع، أ، ب، ج

      ═══════════════════════════════════════════════════
      ⛔ CRITICAL — التحقق الإلزامي من صحة الإجابة (لكل سؤال بدون استثناء):
      ═══════════════════════════════════════════════════
      قبل كتابة correct_option_index لأي سؤال، نفّذ هذه الخطوات:
      خطوة 1: حدّد الإجابة الصحيحة بشكل قاطع (للآيات القرآنية: الكلمة الحرفية من المصحف).
      خطوة 2: ابحث عن هذه الإجابة في مصفوفة options وحدّد موضعها (0=أول، 1=ثانٍ، 2=ثالث، 3=رابع).
      خطوة 3: تأكد أن options[correct_option_index] = الإجابة الصحيحة بالضبط.
        مثال: options=["ذكر","الرحمن","نبي","رسول"] والإجابة "رسول" → correct_option_index=3 ✅
        خطأ فادح: correct_option_index=2 (نبي) بينما الشرح يذكر "رسول" ← ممنوع تماماً ❌

      المرفقات والتوضيحات (إلزامية لكل سؤال):
      1. explanation: شرح مفصل للإجابة الصحيحة باللغة العربية - يجب أن يذكر نفس options[correct_option_index]
      2. method: طريقة الحل بخطوات مرقمة بالعربية
      3. source_reference: مرجع دقيق يحدد مكان المعلومة في الدرس (مثال: "الدرس الثالث - الفقرة الثانية")
      4. difficulty: مستوى الصعوبة (easy/medium/hard)
      
      المحتوى المقدم:
      ${text.substring(0, 50000)}

      أرجع فقط كائن JSON خام بهذا التنسيق:
      {
        "versions": [
          {
            "name": "النموذج (1)",
            "questions": [
              { 
                "question": "السؤال هنا (من محتوى الدرس وليس عن رقم الصفحة)", 
                "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"], 
                "correct_option_index": 0,
                "type": "mcq",
                "difficulty": "medium",
                "explanation": "شرح مفصل للإجابة الصحيحة",
                "method": "طريقة الحل والمنطق المستخدم",
                "source_reference": "الدرس الأول - الفقرة الثالثة"
              },
              { 
                "question": "عبارة للتحقق من صحتها", 
                "options": ["صح", "خطأ"], 
                "correct_option_index": 0,
                "type": "true_false",
                "difficulty": "easy",
                "explanation": "شرح مفصل",
                "method": "طريقة التحقق",
                "source_reference": "الدرس الثاني - المقدمة"
              }
            ]
          }
        ]
      }`;
      parts = [{ text: prompt }];
    } else if (task === "extract_questions") {
      // استخراج الأسئلة من صور ورقة الاختبار حرفياً كما هي
      prompt = `أنت ماسح ضوئي رقمي متخصص في نسخ أسئلة الاختبارات من صور أوراق الامتحانات بدقة 100%. مهمتك نسخ ما في الصورة حرفياً.

═══════════════════════════════════════════════════════════════
🔴 القانون الأعلى — لا استثناء ولا تجاوز أبداً:
═══════════════════════════════════════════════════════════════
أنتَ ناسخ آلي وليس مصحِّحاً. لا تستخدم معرفتك الخارجية لتغيير أي شيء في الصورة.
الصورة هي المصدر الوحيد للحقيقة. كل كلمة تكتبها يجب أن تكون موجودة في الصورة.

═══════════════════════════════════════════════════════════════
⛔ المحظورات المطلقة:
═══════════════════════════════════════════════════════════════
❌ لا تغيّر كلمة قرآنية حتى لو "تعتقد" أن الصحيح غيرها
❌ لا تستبدل خياراً بخيار آخر من معرفتك
❌ لا تضف خياراً غير موجود في الصورة
❌ لا تحذف خياراً موجوداً في الصورة
❌ لا تغيّر الإجابة الصحيحة المحددة في الصورة بناءً على رأيك
❌ لا تكتب أي نص بالإنجليزية

═══════════════════════════════════════════════════════════════
✅ بروتوكول العمل — 5 خطوات لكل سؤال:
═══════════════════════════════════════════════════════════════

الخطوة 1 — نسخ نص السؤال:
  • انظر إلى كل حرف في نص السؤال واكتبه كما تراه بالضبط
  • احتفظ بعلامات التشكيل والأقواس والترقيم كما هي في الصورة

الخطوة 2 — نسخ الخيارات:
  • اقرأ كل خيار حرفاً بحرف واكتبه بالضبط كما في الصورة
  • رتّب الخيارات بنفس ترتيبها في الصورة (الأول → options[0]، الثاني → options[1]، ...)
  • اكتب فقط نص الخيار بدون حروف التصنيف (أ، ب، ج، د، 1، 2، 3، 4)

الخطوة 3 — تحديد الإجابة الصحيحة (3 مراحل):
  ▶ المرحلة أ — ابحث عن العلامة في الصورة:
    - هل يوجد ✓ أو دائرة أو تظليل على أحد الخيارات؟
    - إذا نعم: (أ/1/A) → 0، (ب/2/B) → 1، (ج/3/C) → 2، (د/4/D) → 3
    - للصح/خطأ: ✓ على "صح" → 0، ✓ على "خطأ" → 1
    - إذا وجدتَ العلامة → انتقل مباشرة للخطوة 4

  ▶ المرحلة ب — إذا لم توجد علامة (استخدام المعرفة كملاذ أخير):
    - للآيات القرآنية الجزئية (قاعدة حرجة):
      * السؤال يقدم جزءاً من الآية ويسأل عن ما يكملها
      * ابحث عن كلمة/عبارة في options تكمل الآية كما نزلت في المصحف
      * مثال: "وَاصْبِرْ إِنَّ ذَلِكَ مِنْ عَزْمِ الْأُمُورِ"
        الآية الكاملة (لقمان:17): "وَاصْبِرْ عَلَى مَا أَصَابَكَ إِنَّ ذَلِكَ..."
        الكلمة الناقصة: "عَلَى مَا أَصَابَكَ" → ابحث عنها في options
    - حدّد الإجابة الصحيحة بشكل قاطع ثم انتقل للمرحلة ج

  ▶ المرحلة ج — التحقق الإلزامي (MATCH CHECK):
    - هل options[correct_option_index] = الإجابة الصحيحة بالضبط؟
    - مثال: options=["عَلَى مَا يَقُولُونَ","لِحَكُم رَبَّك","عَلَى مَا أَصَابَك","حَتَّى يَحْكُمَ اللَّهُ"]
      الإجابة: "عَلَى مَا أَصَابَك" موجودة في options[2] → correct_option_index = 2 ✅
      ❌ خطأ فادح: correct_option_index=1 بينما الصحيح "عَلَى مَا أَصَابَك"
    - إذا options[correct_option_index] ≠ الإجابة → ابحث مرة أخرى في options حتى تجدها

الخطوة 4 — الشرح:
  • اكتب شرحاً مفصلاً بالعربية يوضح سبب صحة options[correct_option_index]
  • يذكر نفس نص options[correct_option_index] بالضبط كإجابة

الخطوة 5 — طريقة الحل:
  • خطوات مرقمة: ١- ، ٢- ، ٣- ... بالعربية فقط

═══════════════════════════════════════════════════════════════
✅ قواعد الاستخراج:
═══════════════════════════════════════════════════════════════
1. عُدّ كل الأسئلة أولاً ثم استخرجها بالترتيب حتى آخرها
2. لا تدمج ولا تقسّم الأسئلة
3. احتفظ بنفس عدد الخيارات
4. نوع السؤال: 4 خيارات → "mcq" | 2 خيارات → "true_false" | بلا خيارات → "direct"

🔴 قائمة التحقق النهائية لكل سؤال:
□ نص السؤال منسوخ حرفياً بدون تغيير
□ الخيارات منسوخة حرفياً بدون إضافة أو حذف
□ options[correct_option_index] = نفس الإجابة في explanation بالضبط
□ كل النص بالعربية فقط

أرجع فقط كائن JSON خام بدون \`\`\`json:
[{"question": "نص السؤال حرفياً", "options": ["خيار أ", "خيار ب", "خيار ج", "خيار د"], "correct_option_index": 2, "type": "mcq", "difficulty": "medium", "explanation": "الإجابة الصحيحة هي [نفس options[2]] لأن...", "method": "١- ...\n٢- ...\n٣- ...", "source_reference": "السؤال رقم ١"}]`;
      parts = [{ text: prompt }];
      
      // Add images for extraction
      for (const url of imageUrls) {
        const response = await fetch(url);
        const blob = await response.blob();
        parts.push({
          inlineData: {
            mimeType: blob.type || "image/jpeg",
            data: encode(new Uint8Array(await blob.arrayBuffer()))
          }
        });
      }
    } else if (task === "generate_version" && text) {
      const avoid = body.avoid_questions ? `حرج جداً: لا تكرر هذه الأسئلة أو مفاهيم مشابهة: ${body.avoid_questions.join(', ')}` : '';
      prompt = `أنت خبير في إنشاء الاختبارات التعليمية. بناءً على محتوى الدرس التالي، قم بتوليد نموذج واحد من الاختبار باللغة العربية.
      
      المتطلبات:
      1. ولّد بالضبط ${question_count || 5} أسئلة اختيار من متعدد فريدة وعالية الجودة.
      2. كل سؤال: بالضبط 4 خيارات وإجابة صحيحة واحدة (index 0-3).
      3. ${avoid}
      4. تغطية شاملة لجميع المحتوى المقدم.
      
      معايير جودة الأسئلة:
      1. استخرج الأسئلة من محتوى وفقرات وشروحات الدروس - وليس من عناوين الدروس أو أرقام الصفحات.
      2. اكتشف مستوى صعوبة كل سؤال بناءً على تعقيد المعلومات:
         - سهل (easy): للمفاهيم الأساسية
         - متوسط (medium): للشروحات والتطبيقات
         - صعب (hard): للتحليل والأسئلة الذكائية
      
      متطلبات اللغة والرموز (إلزامية):
      1. استخدم الأرقام العربية فقط: ٠، ١، ٢، ٣، ٤، ٥، ٦، ٧، ٨، ٩ (استثناء: أرقام وأحرف الصيغ الكيميائية مثل Fe3O4 وH2O وCO2 تبقى كما هي بالأرقام الغربية)
      2. استخدم الرموز الرياضية العربية: + - × ÷ = ≠ > < ≥ ≤
      3. اكتب جميع القوانين والمعادلات بالرموز العربية
      4. استخدم الحروف العربية للمتغيرات: س، ص، ع، أ، ب، ج

      ═══════════════════════════════════════════════════
      ⛔ CRITICAL — التحقق الإلزامي من صحة الإجابة (لكل سؤال بدون استثناء):
      ═══════════════════════════════════════════════════
      قبل كتابة correct_option_index لأي سؤال، نفّذ هذه الخطوات:
      خطوة 1: حدّد الإجابة الصحيحة بشكل قاطع (للآيات القرآنية: الكلمة الحرفية من المصحف).
      خطوة 2: ابحث عن هذه الإجابة في مصفوفة options وحدّد موضعها (0=أول، 1=ثانٍ، 2=ثالث، 3=رابع).
      خطوة 3: تأكد أن options[correct_option_index] = الإجابة الصحيحة بالضبط.
        مثال: options=["ذكر","الرحمن","نبي","رسول"] والإجابة "رسول" → correct_option_index=3 ✅
        خطأ فادح: correct_option_index=2 (نبي) بينما الشرح يذكر "رسول" ← ممنوع تماماً ❌

      المرفقات والتوضيحات (إلزامية لكل سؤال):
      1. difficulty: مستوى الصعوبة (easy/medium/hard)
      2. explanation: شرح مفصل للإجابة الصحيحة - يجب أن يذكر نفس options[correct_option_index]
      3. method: طريقة الحل والمنطق المستخدم - خطوات مرقمة بالعربية
      4. source_reference: مرجع دقيق (مثال: "الدرس الثالث - الفقرة الأولى")
      
      المحتوى: ${text.substring(0, 40000)}

      أرجع فقط كائن JSON خام بدون تنسيق markdown:
      {
        "questions": [
          {
            "question": "السؤال؟",
            "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
            "correct_option_index": 0,
            "difficulty": "medium",
            "explanation": "شرح مفصل",
            "method": "طريقة الحل",
            "source_reference": "مرجع المعلومة"
          }
        ]
      }`;
      parts = [{ text: prompt }];
    } else if (task === "extract_questions_from_images") {
      // New task: Extract questions from lesson images
      const lessons = body.lessons || [];
      if (lessons.length === 0) {
        return new Response(JSON.stringify({ error: "No lessons provided" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Prepare image parts for the API
      const imageParts: any[] = [];
      for (const lesson of lessons) {
        if (lesson.image_urls && lesson.image_urls.length > 0) {
          for (const imageUrl of lesson.image_urls) {
            // Fetch image and convert to base64
            try {
              const imageResponse = await fetch(imageUrl);
              const imageBuffer = await imageResponse.arrayBuffer();
              const base64Image = encode(new Uint8Array(imageBuffer));
              
              imageParts.push({
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Image
                }
              });
            } catch (err) {
              console.error(`Failed to fetch image: ${imageUrl}`, err);
            }
          }
        }
      }

      if (imageParts.length === 0) {
        return new Response(JSON.stringify({ error: "No valid images found in lessons" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      prompt = `أنت ماسح ضوئي رقمي متخصص في نسخ أسئلة الاختبارات من صور أوراق الامتحانات بدقة 100%. مهمتك نسخ ما في الصورة حرفياً.

═══════════════════════════════════════════════════════════════
🔴 القانون الأعلى — لا استثناء ولا تجاوز أبداً:
═══════════════════════════════════════════════════════════════
أنتَ ناسخ آلي وليس مصحِّحاً. لا تستخدم معرفتك الخارجية لتغيير أي شيء في الصورة.
الصورة هي المصدر الوحيد للحقيقة. كل كلمة تكتبها يجب أن تكون موجودة في الصورة.

═══════════════════════════════════════════════════════════════
⛔ المحظورات المطلقة:
═══════════════════════════════════════════════════════════════
❌ لا تغيّر كلمة قرآنية حتى لو "تعتقد" أن الصحيح غيرها
❌ لا تستبدل خياراً بخيار آخر من معرفتك
❌ لا تضف خياراً غير موجود في الصورة
❌ لا تحذف خياراً موجوداً في الصورة
❌ لا تغيّر الإجابة الصحيحة المحددة في الصورة بناءً على رأيك
❌ لا تكتب أي نص بالإنجليزية
❌ لا تستخدم أرقاماً غربية (0-9) في النصوص العربية — استخدم الأرقام العربية فقط: ٠١٢٣٤٥٦٧٨٩
❌ استثناء مهم: أرقام وأحرف الصيغ والعناصر الكيميائية (مثل Fe3O4 وH2O وCO2 وN2) تبقى بالأحرف والأرقام الغربية — لا تحوّلها أبداً

═══════════════════════════════════════════════════════════════
✅ بروتوكول العمل — 5 خطوات لكل سؤال:
═══════════════════════════════════════════════════════════════

الخطوة 1 — نسخ نص السؤال:
  • انظر إلى كل حرف في نص السؤال واكتبه كما تراه بالضبط
  • احتفظ بعلامات التشكيل والأقواس والترقيم كما هي في الصورة
  • مثال: "قال تعالى: (وَاصْبِرْ إِنَّ ذَلِكَ مِنْ عَزْمِ الْأُمُورِ)" → اكتبها بالضبط هكذا

الخطوة 2 — نسخ الخيارات:
  • اقرأ كل خيار حرفاً بحرف واكتبه بالضبط كما في الصورة
  • لا تضف ولا تحذف ولا تعدّل أي كلمة
  • رتّب الخيارات بنفس ترتيبها في الصورة (الأول → options[0]، الثاني → options[1]، ...)
  • إذا رأيتَ: "أ- لِحَكُم رَبَّك" → options[0] = "لِحَكُم رَبَّك" (فقط نص الخيار بدون الحرف)
  • اكتب الأرقام في الخيارات بالعربية: ٢ بدلاً من 2، ١٠ بدلاً من 10

الخطوة 3 — تحديد الإجابة الصحيحة (3 مراحل):
  ▶ المرحلة أ — ابحث عن العلامة في الصورة:
    - هل يوجد ✓ أو دائرة أو تظليل على أحد الخيارات؟
    - إذا نعم: حوّل موقع الخيار المُحدَّد إلى index:
      * الخيار الأول (أ أو 1 أو A) → correct_option_index = 0
      * الخيار الثاني (ب أو 2 أو B) → correct_option_index = 1
      * الخيار الثالث (ج أو 3 أو C) → correct_option_index = 2
      * الخيار الرابع (د أو 4 أو D) → correct_option_index = 3
      * للصح/خطأ: ✓ على "صح" → 0، ✓ على "خطأ" → 1
    - إذا وجدتَ العلامة → انتقل مباشرة للخطوة 4

  ▶ المرحلة ب — إذا لم توجد علامة (استخدام المعرفة كملاذ أخير):
    - للآيات القرآنية الجزئية: هذه قاعدة حرجة:
      * السؤال يقدم جزءاً من الآية ويسأل عن ما يكملها
      * ابحث عن كلمة/عبارة في options تكمل الآية كما نزلت في المصحف
      * مثال: "قال تعالى: (وَاصْبِرْ إِنَّ ذَلِكَ مِنْ عَزْمِ الْأُمُورِ)"
        - الآية الكاملة من القرآن: "وَاصْبِرْ عَلَى مَا أَصَابَكَ إِنَّ ذَلِكَ مِنْ عَزْمِ الْأُمُورِ" (لقمان:17)
        - الكلمة الناقصة: "عَلَى مَا أَصَابَكَ" → ابحث عنها في options
    - لغير القرآن: استخدم المعلومات الصحيحة المعروفة
    - حدّد الإجابة الصحيحة بشكل قاطع ثم انتقل للمرحلة ج

  ▶ المرحلة ج — التحقق الإلزامي من صحة correct_option_index:
    - MATCH CHECK: هل options[correct_option_index] = الإجابة الصحيحة بالضبط؟
    - مثال صحيح: options=["عَلَى مَا يَقُولُونَ","لِحَكُم رَبَّك","عَلَى مَا أَصَابَك","حَتَّى يَحْكُمَ اللَّهُ"]
      الإجابة الصحيحة: "عَلَى مَا أَصَابَك" → موجودة في options[2] → correct_option_index = 2 ✅
      خطأ فادح: correct_option_index = 1 (لِحَكُم رَبَّك) بينما الصحيح "عَلَى مَا أَصَابَك" ← ❌ ممنوع
    - إذا كان options[correct_option_index] ≠ الإجابة الصحيحة → ابحث مرة أخرى في options حتى تجدها

الخطوة 4 — كتابة الشرح (explanation):
  • اكتب شرحاً مفصلاً باللغة العربية الفصحى يوضح سبب صحة الإجابة
  • يجب أن يذكر الشرح نفس نص options[correct_option_index] بالضبط
  • لا تذكر خيارات أخرى كإجابة صحيحة في الشرح
  • لا تكتب بالإنجليزية

الخطوة 5 — كتابة طريقة الحل (method):
  • اكتب خطوات مرقمة بالعربية: ١- ، ٢- ، ٣- ...
  • توضح كيف يفكر الطالب للوصول للإجابة
  • لا تكتب بالإنجليزية

═══════════════════════════════════════════════════════════════
✅ قواعد الاستخراج الشاملة:
═══════════════════════════════════════════════════════════════
1. عُدّ كل الأسئلة في الصورة أولاً، ثم استخرجها بالترتيب من الأول للآخر
2. لا تتوقف حتى تستخرج آخر سؤال
3. لا تدمج سؤالين في سؤال واحد، ولا تقسّم سؤالاً واحداً
4. احتفظ بنفس عدد الخيارات (لا تضف ولا تحذف)
5. نوع السؤال: 4 خيارات → "mcq" | 2 خيارات → "true_false" | بلا خيارات → "direct"
6. difficulty: سهل → "easy" | متوسط → "medium" | صعب → "hard"

عدد النماذج: ${version_count || 1}

═══════════════════════════════════════════════════════════════
🔴 قائمة التحقق النهائية قبل إرسال JSON (لكل سؤال):
═══════════════════════════════════════════════════════════════
□ نص السؤال منسوخ حرفياً من الصورة بدون أي تغيير
□ الخيارات منسوخة حرفياً بدون إضافة أو حذف
□ options[correct_option_index] = نفس الإجابة المذكورة في explanation بالضبط
□ الشرح وطريقة الحل بالعربية فقط

أرجع فقط كائن JSON خام (بدون \`\`\`json):
{
  "versions": [
    {
      "name": "النموذج (1)",
      "questions": [
        {
          "question": "نص السؤال حرفياً",
          "options": ["خيار أ حرفياً", "خيار ب حرفياً", "خيار ج حرفياً", "خيار د حرفياً"],
          "correct_option_index": 2,
          "type": "mcq",
          "difficulty": "medium",
          "explanation": "الإجابة الصحيحة هي [نفس options[correct_option_index]] لأن...",
          "method": "١- ...\n٢- ...\n٣- ...",
          "source_reference": "السؤال رقم ١"
        }
      ]
    }
  ]
}`;

      parts = [{ text: prompt }, ...imageParts];
    } else if (task === "regenerate_question") {
      // إعادة توليد سؤال واحد فقط مع الحفاظ على النوع والصعوبة
      const existingQuestion = body.question || '';
      const lessonContent = body.text || '';
      const qType = body.question_type || 'mcq';
      const qDifficulty = body.difficulty || 'medium';
      const optionCount = body.option_count || 4;

      prompt = `أنت خبير في إنشاء الاختبارات التعليمية. مهمتك إعادة صياغة سؤال واحد فقط بطريقة جديدة ومختلفة تماماً عن السؤال الأصلي.

السؤال الأصلي الذي تريد إعادة صياغته:
"${existingQuestion}"

نوع السؤال: ${qType === 'mcq' ? 'اختيار من متعدد' : qType === 'true_false' ? 'صح/خطأ' : 'مباشر'}
مستوى الصعوبة: ${qDifficulty === 'easy' ? 'سهل' : qDifficulty === 'medium' ? 'متوسط' : 'صعب'}
عدد الخيارات المطلوبة: ${optionCount}

محتوى الدرس للاستعانة به:
${lessonContent ? lessonContent.substring(0, 3000) : 'لا يوجد محتوى إضافي'}

القواعد الإلزامية:
1. أعِد صياغة السؤال بأسلوب مختلف تماماً عن الأصل
2. احتفظ بنفس النوع (${qType === 'mcq' ? 'اختيار من متعدد بـ' + optionCount + ' خيارات' : 'صح/خطأ'})
3. احتفظ بنفس مستوى الصعوبة
4. اكتب السؤال والخيارات والشرح باللغة العربية الفصحى
5. استخدم الأرقام العربية فقط: ٠١٢٣٤٥٦٧٨٩ — لا تستخدم 0123456789 في النصوص العربية المرئية
   ⚠️ استثناء: أرقام الصيغ والعناصر الكيميائية (Fe3O4, H2O, CO2, N2...) تبقى بالأرقام الغربية — لا تحوّلها
6. تأكد أن correct_option_index صحيح بالضبط: options[correct_option_index] يجب أن يساوي الإجابة الصحيحة التي ذكرتها في explanation
7. اكتب طريقة الحل كخطوات مرقمة: ١- ... ٢- ... ٣- ...

⚠️ تحقق قبل الإرسال:
- هل options[correct_option_index] يطابق الإجابة الصحيحة في explanation؟ إذا لا → أصلحه.

أرجع فقط كائن JSON خام (بدون \`\`\`json أو أي نص آخر):
{
  "question": "نص السؤال الجديد",
  "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
  "correct_option_index": 0,
  "type": "${qType}",
  "difficulty": "${qDifficulty}",
  "explanation": "شرح مفصل باللغة العربية يذكر نفس options[correct_option_index]...",
  "method": "١- الخطوة الأولى.\\n٢- الخطوة الثانية.\\n٣- الخطوة الثالثة."
}`;
      parts = [{ text: prompt }];
    } else if (task === "detect_pages") {
      prompt = `أنت خبير في تحليل صفحات الكتب المدرسية العربية. قم بتحليل الصورة المرفقة بدقة عالية.
      
      المطلوب:
      1. 'page_number': ابحث عن رقم الصفحة المطبوع على الصفحة (في الزوايا، أعلى، أسفل، يمين، يسار).
         - **CRITICAL**: أرجع الرقم بالأرقام الإنجليزية فقط (مثال: 65 وليس ٦٥)
         - إذا لم تجد رقم الصفحة، أرجع null
         - تأكد من البحث في جميع أجزاء الصفحة
         - حتى لو كان رقم الصفحة مكتوب بالأرقام العربية في الصورة، حوّله إلى أرقام إنجليزية
      
      2. 'title': عنوان الدرس أو الموضوع
         - ابحث عن العنوان الرئيسي للدرس (عادة في أعلى الصفحة بخط كبير)
         - إذا لم تجد عنوان واضح، ولّد عنوان مناسب بناءً على محتوى الصفحة
         - إذا كان المحتوى قليل جداً، استخدم "صفحة " + رقم الصفحة
         - التنسيق: أضف رقم الصفحة في نهاية العنوان بالأرقام العربية
           مثال: "الدرس الحادي عشر (صفحة ٧٣)"
           مثال: "صفحة ٦٥"
      
      3. 'content_preview': ملخص قصير جداً (جملة واحدة) عن محتوى الصفحة
      
      **تعليمات مهمة**:
      - اقرأ النص بدقة عالية (OCR)
      - ابحث في جميع أجزاء الصفحة عن رقم الصفحة والعنوان
      - إذا كانت الصورة غير واضحة، حاول قراءة ما تستطيع
      - **page_number يجب أن يكون رقم إنجليزي (integer)**: 1, 2, 3, 41, 57, 79
      - **title يمكن أن يحتوي على أرقام عربية**: "الدرس الأول (صفحة ٤١)"
      
      أرجع فقط JSON خام بدون markdown:
      {"title": "...", "page_number": 12, "content_preview": "..."}`;
      const response = await fetch(imageUrls[0]);
      const blob = await response.blob();
      parts = [
        { text: prompt },
        { inlineData: { mimeType: blob.type || "image/jpeg", data: encode(new Uint8Array(await blob.arrayBuffer())) } }
      ];
    } else if (task === "generate_lesson_content") {
      const requestedCount = (body as any).question_count;
      let countInstruction = '';
      
      if (requestedCount && requestedCount > 0) {
        countInstruction = `Generate exactly ${requestedCount} high-quality questions (mix of MCQ and True/False).`;
      } else {
        countInstruction = `Generate as many high-quality questions as needed to comprehensively cover ALL the content in the images. Do NOT limit yourself - create enough questions to test every important concept, definition, fact, detail, example, and explanation. Aim for thorough coverage rather than a specific number. Match question difficulty to content complexity.`;
      }
      
      prompt = `Generate a comprehensive summary and multiple-choice questions for the lesson "${lesson_title}" (Pages: ${page_range}) based on the attached images.
      
      Requirements:
      1. Arabic language throughout.
      2. Summary should be detailed and structured.
      3. ${countInstruction}
      4. EACH question: include 'type' (mcq or true_false), 'difficulty' (easy, medium, hard) - MATCH difficulty to the complexity of the information being tested, 'explanation' (detailed explanation in Arabic), 'method' (step-by-step logic in Arabic), and 'source_reference' (e.g., "عنوان الدرس - ص 15").
      5. Include ALL information from images, ensuring coverage at ALL difficulty levels present in the content.
      6. CRITICAL: Generate questions for EVERY significant piece of information, concept, definition, example, explanation, and detail in the content.
      7. Do not artificially limit the number of questions - prioritize comprehensive coverage.
      8. CRITICAL: Match question difficulty to content complexity:
         - Simple facts and definitions → Easy (سهل)
         - Concepts requiring understanding → Medium (متوسط)
         - Complex analysis and synthesis → Hard/Intellectual (ذكائي/صعب)

      ═══════════════════════════════════════════════════
      ⛔ CRITICAL — Mandatory Answer Verification (for EVERY question):
      ═══════════════════════════════════════════════════
      Before writing correct_option_index for any question, follow these steps:

      Step 1: Determine the correct answer definitively.
        - For Quranic verses: The exact word/phrase from the Holy Quran is the 100% correct answer.
          Example: "يا حسرة على العباد ما يأتيهم من ......" → Quranic answer = "رسول" ← this is the ONLY correct answer.
        - For Hadith: Exact text from the hadith.
        - For scientific/historical facts: Exactly what appears in the provided images.

      Step 2: Find the correct answer in the options array and identify its position:
        - First position  → correct_option_index = 0
        - Second position → correct_option_index = 1
        - Third position  → correct_option_index = 2
        - Fourth position → correct_option_index = 3
        Example: options = ["ذكر", "الرحمن", "نبي", "رسول"] and correct answer is "رسول"
        → "رسول" is at fourth position → correct_option_index = 3

      Step 3: Consistency check — options[correct_option_index] MUST equal the correct answer:
        - If your explanation says the answer is "رسول" → options[correct_option_index] MUST be "رسول"
        - If they don't match → fix correct_option_index until they match.

      ⛔ Common mistake to AVOID:
        - options = ["ذكر", "الرحمن", "نبي", "رسول"] with correct answer "رسول" → correct_option_index = 3 ✅
        - Do NOT write correct_option_index = 2 (نبي) while explanation says "رسول" ← CRITICAL ERROR ❌

      ARABIC NUMERALS (MANDATORY):
        - Use Eastern Arabic numerals exclusively: ٠١٢٣٤٥٦٧٨٩
        - FORBIDDEN in visible Arabic text: 0 1 2 3 4 5 6 7 8 9 (Western digits)
        - EXCEPTION: Chemical formulas and element symbols MUST keep Western chars: Fe3O4, H2O, CO2, N2, NaCl — do NOT convert these
        - This applies to: question text, options, explanation, method, source_reference
        - Examples: write ٢ not 2, write ١٠ not 10, write ٣٫١٤ not 3.14

      Return ONLY raw JSON: {"summary": "...", "questions": [{"question": "...", "options": [...], "correct_option_index": 0, "type": "...", "difficulty": "...", "explanation": "...", "method": "...", "source_reference": "..."}]}`;
      const imageParts = [];
      for (const url of (imageUrls || []).slice(0, 10)) {
        try {
          const res = await fetch(url);
          const b = await res.blob();
          imageParts.push({ inlineData: { mimeType: b.type || "image/jpeg", data: encode(new Uint8Array(await b.arrayBuffer())) } });
        } catch (e) {}
      }
      parts = [{ text: prompt }, ...imageParts];
    } else if (task === "replica") {
      // ===================================================================
      // مهمة جديدة: توليد أسئلة "طبق الأصل" من صور الدرس
      // يحلل صور الدرس → يحدد عدد الأسئلة ونوعها → يُعيد توليدها
      // بنفس العدد والنوع والصيغة والأسلوب، مع شرح + طريقة حل مرقمة
      // ===================================================================
      const pageOffsetNum = (typeof pageOffset === 'number' && pageOffset > 0) ? pageOffset : 0;
      const pageHint = pageOffsetNum > 0 ? `\n⚠️ ملاحظة مهمة: هذه الدفعة من الصور تبدأ من الصفحة ${pageOffsetNum + 1}.\n• أول صورة = الصفحة ${pageOffsetNum + 1}\n• ثاني صورة = الصفحة ${pageOffsetNum + 2}\n• وهكذا...\n• في source_reference اكتب رقم الصفحة الحقيقي (مثلاً "صفحة ${pageOffsetNum + 1} - السؤال رقم ١").` : '';

      prompt = `أنت آلة توليد أسئلة متخصصة. مهمتك في خطوتين متسلسلتين لا يمكن تجاوزهما:

══════════════════════════════════════════════════════
⚠️ الخطوة الصفرية الإلزامية — العدّ الدقيق:
══════════════════════════════════════════════════════
قبل أي شيء: اعدَّ كل سؤال في الصور واحداً واحداً واحفظ العدد الإجمالي.
• صح/خطأ: كل جملة مُرقَّمة أو مسبوقة بفراغ للإجابة = سؤال مستقل.
• اختيار من متعدد: كل صف في الجدول = سؤال مستقل بـ ٤ خيارات.
• مباشر/تكملة: كل فقرة بها فراغ للإجابة = سؤال مستقل.
← إذا عددت ٢٧ سؤالاً فيجب أن تولّد ٢٧ سؤالاً بالضبط.
← إذا عددت ٤٠ سؤالاً فيجب أن تولّد ٤٠ سؤالاً بالضبط.
← لا يوجد حد أقصى: ولّد الجميع مهما بلغ العدد.
${pageHint}

══════════════════════════════════════════════════════
🔹 الخطوة الأولى — التحليل:
══════════════════════════════════════════════════════
اقرأ كل الصور بعناية، رتّب الأسئلة بالتسلسل الرقمي كما تظهر فيها،
واستخرج لكل سؤال: نصه، نوعه، خياراته، مستواه.

══════════════════════════════════════════════════════
🔹 الخطوة الثانية — النسخ "طبق الأصل الحرفي":
══════════════════════════════════════════════════════
ولّد مقابل كل سؤال أصلي سؤالاً مطابقاً تماماً في:
• نفس النوع (mcq / true_false / direct).
• نفس عدد الخيارات (MCQ = ٤ دائماً).
• نفس مستوى الصعوبة.
• نفس أسلوب الصياغة وأسلوب اللغة.
⛔ يجب إعادة نص السؤال والخيارات كما هي حرفياً من الأصل — لا تغيير في أي كلمة أو رقم أو صياغة.

══════════════════════════════════════════════════════
⛔ محظورات مطلقة:
══════════════════════════════════════════════════════
1. ⛔ لا تتوقف قبل توليد جميع الأسئلة — لا يوجد حد ١٠ أو ١٥ أو أي عدد آخر.
2. ⛔ لا تُضِف سؤالاً من عندك ولا تحذف سؤالاً من الأصل.
3. ⛔ لا تُغيِّر نوع السؤال (mcq → mcq فقط، true_false → true_false فقط).
4. ⛔ لا تُغيِّر عدد الخيارات في MCQ.
5. ⛔ استخدم الأرقام العربية: ٠١٢٣٤٥٦٧٨٩ — إلا في الصيغ الكيميائية (H2O, CO2...).
6. ⛔ لا تضع triple backticks أو كلمة json في ردك.

══════════════════════════════════════════════════════
📐 الرموز الرياضية والفيزيائية — إلزامي بالعربي:
══════════════════════════════════════════════════════
• الدوال المثلثية: sin → جا، cos → جتا، tan → ظا
  مثال: sin(θ) = جا(θ) = جيب(θ) ← اكتب العربي بجانب الإنجليزي أو العربي فقط.
• المتغيرات الفيزيائية:
  R → ن (نصف القطر)، V → ف (السرعة)، g → ع (التسارع)
  e → هـ (الشحنة)، L → ل (الحث)، I → ت (التيار)، t → ز (الزمن)
  ΔI/Δt → Δت/Δز، d/dt → د/دز
• الرموز الرياضية: + - × ÷ = ≠ > < ≥ ≤
• الأس (القوى): استخدم الأرقام العربية المرتفعة: ² ³ ⁴ ⁵
• في الشرح (explanation) والحل (method): اكتب المعادلة بالرموز العربية أولاً ثم بالإنجليزي بين قوسين.
  مثال: ن = (ف₀² × جا(٢θ)) ÷ ع ← ثم الإنجليزي بين قوسين (R = (V₀² × sin(2θ))/g).

══════════════════════════════════════════════════════
📋 هيكل كل سؤال (إلزامي تماماً):
══════════════════════════════════════════════════════
- question: نص السؤال بأسلوب مطابق للأصل
- options: مصفوفة الخيارات (MCQ = ٤ عناصر، T/F = ["صح","خطأ"]، direct = [])
- correct_option_index: رقم الخيار الصحيح (0,1,2,3) — مؤكد ١٠٠٪
- type: "mcq" | "true_false" | "direct"
- difficulty: "easy" | "medium" | "hard"
- explanation: "الإجابة الصحيحة هي [نص الخيار بالضبط] لأن ..."
- method: "١- ...\n٢- ...\n٣- ..."
- source_reference: مثال "صفحة ${pageOffsetNum + 1} - السؤال رقم ١"

══════════════════════════════════════════════════════
🎯 التحقق الإلزامي قبل الإرسال:
══════════════════════════════════════════════════════
تأكد أن: عدد السؤال في questions == العدد الذي عددته في الخطوة الصفرية.
إن كان الفرق > 0 فأكمل الأسئلة الناقصة الآن.

أرجع فقط JSON خام (بدون أي نص قبله أو بعده):
{"questions":[{"question":"...","options":["...","...","...","..."],"correct_option_index":0,"type":"mcq","difficulty":"medium","explanation":"...","method":"...","source_reference":"..."}]}`;

      // تحميل الصور بالتوازي لتسريع المعالجة
      const replicaImageParts: any[] = [];
      const imageLoadResults = await Promise.all(
        (imageUrls || []).map(async (url: string) => {
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            const encodedData = encode(new Uint8Array(await blob.arrayBuffer()));
            return {
              inlineData: {
                mimeType: blob.type || "image/jpeg",
                data: encodedData
              }
            };
          } catch (e) {
            console.error(`Failed to fetch replica image: ${url}`, e);
            return null;
          }
        })
      );
      replicaImageParts.push(...imageLoadResults.filter(p => p !== null));

      if (replicaImageParts.length === 0) {
        return new Response(JSON.stringify({ error: "لم يتم العثور على صور الدرس" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      parts = [{ text: prompt }, ...replicaImageParts];
    } else if (task === "exam_paper_exact") {
      // ===================================================================
      // مهمة جديدة: استخراج الأسئلة طبق الأصل من ورقة امتحان رسمية
      // يدعم: صح/خطأ، اختيار من متعدد (4 خيارات)، أسئلة مباشرة
      // ===================================================================
      prompt = `أنت آلة مسح ضوئي متخصصة في قراءة أوراق الامتحانات العربية الرسمية. مهمتك الوحيدة هي نسخ ما تراه في الصورة نسخاً حرفياً مطلقاً، ثم تحديد الإجابة الصحيحة لكل سؤال من علمك.

══════════════════════════════════════════════════════
⛔ محظورات مطلقة — مخالفة أي منها تُبطل المهمة:
══════════════════════════════════════════════════════
1. ⛔ لا تُغيِّر ولو حرفاً واحداً في نص السؤال أو الخيارات
2. ⛔ لا تُصحِّح "أخطاء" تظنها في النص — انسخ ما في الصورة حتى لو بدا خاطئاً
3. ⛔ لا تستبدل كلمة بأخرى رادفة — انسخ الكلمة بعينها من الصورة
4. ⛔ لا تضع سؤالاً من معرفتك إن لم تستطع قراءة السؤال من الصورة — ضعه فارغاً
5. ⛔ لا تغير ترتيب الخيارات أو تُعيد صياغتها
6. ⛔ لا تُدمج سؤالين أو تُقسِّم سؤالاً واحداً
7. ⛔ correct_option_index يجب أن يشير بالضبط إلى options[index] = الإجابة الصحيحة
8. ⛔ الشرح يجب أن يُكرِّر نص options[correct_option_index] بالضبط في أول جملة
9. ⛔ استخدم الأرقام العربية فقط: ٠١٢٣٤٥٦٧٨٩ — يُحظر استخدام 0123456789 في النصوص العربية المرئية
   ⚠️ استثناء لازم: أرقام وأحرف الصيغ الكيميائية (مثل Fe3O4 وH2O وCO2 وN2) تُنسخ كما هي بالأرقام الغربية — لا تحوّلها أبداً

══════════════════════════════════════════════════════
مثال على الخطأ الذي يجب تجنبه:
══════════════════════════════════════════════════════
❌ في الصورة: "(أرأيت إن سحقت هذا العظم وذريته في الريح)"
❌ استخراج خاطئ: "(أرأيت إن تبحث هذا العظم وذريته في الريح)"
← هذا خطأ فادح — كلمة "سحقت" غُيِّرت إلى "تبحث"

✅ استخراج صحيح: "(أرأيت إن سحقت هذا العظم وذريته في الريح)" — بالضبط

══════════════════════════════════════════════════════
📌 أنواع الأسئلة في الامتحانات العربية الرسمية:
══════════════════════════════════════════════════════

النوع الأول — صح وخطأ:
  • علامة: جملة مسبوقة بقوسين ( ) في بداية السطر
  • مثال: "( ) المهندسون هم من بنوا الأهرامات"
  • استخرج الجملة فقط بدون الرقم والقوسين
  • الخيارات: دائماً ["صح", "خطأ"] — لا تغيير
  • type: "true_false"
  • correct_option_index: 0 إن كانت الجملة صحيحة، 1 إن كانت خاطئة

النوع الثاني — اختيار من متعدد:
  • الشكل: جدول بأعمدة — السؤال/الجملة الناقصة في الصف + خانات الخيارات
  • ترتيب الأعمدة من اليمين لليسار: رقم | خانة1 | خانة2 | خانة3 | خانة4
  • الخيارات الأربعة من اليمين: options[0], options[1], options[2], options[3]
  • type: "mcq"
  • انسخ كل خانة حرفياً بالتشكيل

النوع الثالث — مباشر/تكملة:
  • سؤال مكتوب بدون خيارات أو فراغ للإجابة
  • type: "direct"
  • options: []
  • correct_option_index: 0

══════════════════════════════════════════════════════
🎯 كيفية تحديد correct_option_index:
══════════════════════════════════════════════════════
1. أولاً: ابحث عن علامة في الصورة (✓ أو دائرة أو تظليل) على خيار — إن وجدت فاستخدمها مباشرة
2. ثانياً: إن لم توجد علامة → استخدم معرفتك العلمية لتحديد الإجابة الصحيحة
3. إلزامياً: تحقق أن options[correct_option_index] = الإجابة الصحيحة التي حددتها
4. إلزامياً: ابدأ شرح explanation بـ "الإجابة الصحيحة هي [options[correct_option_index] بالضبط] لأن..."

══════════════════════════════════════════════════════
📝 بروتوكول القراءة:
══════════════════════════════════════════════════════
• اقرأ كل حرف في الصورة بعناية قبل الكتابة
• إذا لم تتمكن من قراءة كلمة بوضوح → اكتب "..." بدلاً من الاختراع
• احتفظ بالتشكيل الكامل والأقواس والترقيم كما في الصورة
• اقرأ الصفوف من اليمين لليسار (النص العربي)
• استخرج جميع الأسئلة بالترتيب دون حذف أي منها

أرجع فقط JSON خام بدون \`\`\`json:
{
  "questions": [
    {
      "question": "نص السؤال أو الجملة منسوخاً حرفياً",
      "options": ["خيار1 حرفياً", "خيار2 حرفياً", "خيار3 حرفياً", "خيار4 حرفياً"],
      "correct_option_index": 2,
      "type": "mcq",
      "difficulty": "medium",
      "explanation": "الإجابة الصحيحة هي [options[2] بالضبط] لأن...",
      "method": "١- ...\n٢- ...\n٣- ...",
      "source_reference": "السؤال رقم ١"
    }
  ]
}`;

      // تحميل صور أوراق الامتحان
      const examImageParts: any[] = [];
      for (const url of (imageUrls || [])) {
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          examImageParts.push({
            inlineData: {
              mimeType: blob.type || "image/jpeg",
              data: encode(new Uint8Array(await blob.arrayBuffer()))
            }
          });
        } catch (e) {
          console.error(`Failed to fetch exam paper image: ${url}`, e);
        }
      }

      if (examImageParts.length === 0) {
        return new Response(JSON.stringify({ error: "لم يتم العثور على صور ورقة الامتحان" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      parts = [{ text: prompt }, ...examImageParts];
    } else {
       // Default fallback task
       prompt = `Analyze content and return JSON. Task: ${task || 'generic'}. Content: ${text || ''}`;
       parts = [{ text: prompt }];
    }

    let response;
    let retries = 0;
    const maxRetries = 4; // زيادة المحاولات لتحمّل حالات الـ rate limit
    let lastError;

    while (retries <= maxRetries) {
      try {
        const fetchOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Gateway-Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts }],
            generationConfig: { 
              // أقل temperature للمهام التي تتطلب نسخاً حرفياً أو تحديد إجابات صحيحة
              temperature: (task === "extract_questions" || task === "extract_questions_from_images" || task === "exam_paper_exact" || task === "replica") ? 0 
                         : (task === "generate_questions" || task === "generate_multi_version_quiz" || task === "generate_lesson_content" || task === "generate_version" || task === "regenerate_question") ? 0.3
                         : 0.7,
              maxOutputTokens: 65536,
              topP: 0.95,
              response_mime_type: "application/json",
            },
          }),
        };

        response = await fetch(
          "https://app-a8tauoehdn9d-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta/models/gemini-2.5-flash:generateContent",
          fetchOptions
        );

        if (response.ok) break;

        const errorText = await response.text();
        lastError = new Error(`Gemini API Error (HTTP ${response.status}): ${errorText}`);
        
        // لا إعادة محاولة عند أخطاء العميل (غير rate limit)
        if (response.status === 400 || response.status === 401 || response.status === 403) break;
        
      } catch (e) {
        lastError = e;
      }

      retries++;
      if (retries <= maxRetries) {
        // تأخير أطول بكثير عند rate limit (429) لتجنب التكرار الفاشل
        const is429 = (lastError as any)?.message?.includes('HTTP 429');
        const delayMs = is429
          ? 15000 + (retries * 10000) // 25s, 35s, 45s, 55s عند 429
          : 3000 * retries;           // 3s, 6s, 9s, 12s للأخطاء الأخرى
        console.log(`Retrying Gemini API (Attempt ${retries + 1}/${maxRetries + 1}) in ${delayMs}ms. Error: ${lastError?.message}`);
        await new Promise(r => setTimeout(r, delayMs));
      }
    }

    if (!response || !response.ok) throw lastError || new Error("Failed to get response from Gemini API");

    // Non-streaming: Read response directly - مع حماية من JSON غير صالح
    let responseData: any;
    try {
      responseData = await response.json();
    } catch (jsonErr) {
      const rawText = await response.text().catch(() => '(empty)');
      throw new Error(`Gemini returned invalid JSON. Status: ${response.status}. Preview: ${rawText.substring(0, 200)}`);
    }
    let fullText = "";
    
    // Extract text from response
    if (responseData.candidates?.[0]?.content?.parts?.[0]?.text) {
      fullText = responseData.candidates[0].content.parts[0].text;
    } else {
      throw new Error("No text content in Gemini API response");
    }

    const jsonStr = extractJson(fullText);
    if (!jsonStr) {
      throw new Error(`AI generated no valid JSON. Raw output starts with: ${fullText.substring(0, 100)}`);
    }

    // ⚠️ تعقيم الأحرف الضابطة قبل أي معالجة - يمنع خطأ "Bad control character"
    const sanitizedJson = sanitizeJsonString(jsonStr);
    const finalJson = repairTruncatedJson(sanitizedJson);
    
    // Add sequential numbers to questions and validate correct_option_index
    try {
      const parsedData = JSON.parse(finalJson);

      // ====================================================
      // دالة مساعدة: التحقق من صحة correct_option_index
      // لمهمة exam_paper_exact: تحقق من النطاق فقط — لا تعديل بناءً على الشرح
      // لبقية المهام: إصلاح إضافي بمطابقة الشرح
      // ====================================================
      const validateQuestion = (q: any, skipExplanationMatch = false): any => {
        if (!Array.isArray(q.options) || q.options.length === 0) return q;

        const idx = typeof q.correct_option_index === 'number' ? q.correct_option_index : 0;
        
        // 1. تأكد أن الرقم ضمن النطاق المسموح
        if (idx < 0 || idx >= q.options.length) {
          return { ...q, correct_option_index: 0 };
        }

        // 2. مطابقة الشرح — مُعطَّلة لـ exam_paper_exact لأن الذكاء الاصطناعي
        //    يضع correct_option_index الصحيح من علمه، وهذه المطابقة تُفسده
        if (!skipExplanationMatch && q.explanation && typeof q.explanation === 'string') {
          const expLower = q.explanation.replace(/\s+/g, ' ').toLowerCase();
          let bestMatch = idx;
          let bestScore = 0;

          q.options.forEach((opt: string, i: number) => {
            if (!opt || typeof opt !== 'string') return;
            const optClean = opt.trim().toLowerCase();
            // احسب عدد الأحرف المتطابقة كنسبة مئوية
            if (optClean.length > 2 && expLower.includes(optClean)) {
              const score = optClean.length;
              if (score > bestScore) {
                bestScore = score;
                bestMatch = i;
              }
            }
          });

          // استخدم الأفضل مطابقةً فقط إذا كان غير الفهرس الحالي وطوله معقول
          if (bestMatch !== idx && bestScore > 3) {
            console.log(`[validate] Fixed correct_option_index: ${idx} → ${bestMatch} (matched "${q.options[bestMatch]}" in explanation)`);
            return { ...q, correct_option_index: bestMatch };
          }
        }

        return q;
      };

      // تحديد ما إذا كانت المهمة الحالية تتطلب تعطيل مطابقة الشرح
      const isExactExtractionTask = (task === "exam_paper_exact" || task === "extract_questions_from_images" || task === "extract_questions" || task === "replica");

      // ====================================================
      // دالة تحويل الأرقام الغربية إلى أرقام عربية (٠١٢٣٤٥٦٧٨٩)
      // تُطبَّق على جميع النصوص المرئية للطالب
      // استثناء: أرقام وأحرف الصيغ الكيميائية والعلمية المجاورة لحروف لاتينية
      //   مثل Fe3O4 أو H2O أو CO2 أو N2 → تبقى كما هي بدون تحويل
      // ====================================================
      const toArabicNumerals = (text: string): string => {
        if (!text || typeof text !== 'string') return text;
        // نحوّل سلسلة الأرقام فقط إذا لم تكن مجاورة لحرف لاتيني (صيغة كيميائية)
        return text.replace(/[0-9]+/g, (match, offset) => {
          const charBefore = text[offset - 1] ?? '';
          const charAfter  = text[offset + match.length] ?? '';
          // إذا كانت الأرقام مجاورة لحرف لاتيني → صيغة كيميائية → لا تحويل
          if (/[A-Za-z]/.test(charBefore) || /[A-Za-z]/.test(charAfter)) return match;
          return match.replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
        });
      };

      // تحويل جميع حقول السؤال النصية المرئية إلى أرقام عربية
      const arabizeQuestion = (q: any): any => {
        if (!q || typeof q !== 'object') return q;
        return {
          ...q,
          question:          toArabicNumerals(q.question),
          options:           Array.isArray(q.options) ? q.options.map((o: string) => toArabicNumerals(o)) : q.options,
          explanation:       toArabicNumerals(q.explanation),
          method:            toArabicNumerals(q.method),
          source_reference:  toArabicNumerals(q.source_reference),
        };
      };

      // تطبيق التحقق وتحويل الأرقام على كل الأسئلة
      if (parsedData.questions && Array.isArray(parsedData.questions)) {
        parsedData.questions = parsedData.questions.map((q: any) => arabizeQuestion({
          ...validateQuestion(q, isExactExtractionTask),
          serial_number: generateQuestionSerial()
        }));
      }
      
      if (parsedData.versions && Array.isArray(parsedData.versions)) {
        parsedData.versions = parsedData.versions.map((v: any) => ({
          ...v,
          questions: v.questions?.map((q: any) => arabizeQuestion({
            ...validateQuestion(q, isExactExtractionTask),
            serial_number: generateQuestionSerial()
          })) || []
        }));
      }

      // إذا كان الرد سؤالاً واحداً (من regenerate_question)
      if (parsedData.question && !parsedData.questions && !parsedData.versions) {
        return new Response(JSON.stringify(arabizeQuestion(validateQuestion(parsedData, false))), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify(parsedData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      // If parsing fails, return original
      return new Response(finalJson, {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err: any) {
    console.error("Function Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
