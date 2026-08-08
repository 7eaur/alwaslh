import * as XLSX from 'xlsx';
import { QuizQuestion, Lesson } from '@/types';
import html2pdf from 'html2pdf.js';

export const exportQuestionsToExcel = (questions: QuizQuestion[], title: string, lessonName: string, subjectName: string = '') => {
  const data = questions.map((q, index) => {
    const wrongOptions = q.options.filter((_, idx) => idx !== q.correct_option_index);
    return {
      'رقم السؤال': index + 1,
      'المادة': subjectName,
      'السؤال': q.question,
      'الإجابة الصحيحة': q.options[q.correct_option_index] || '',
      'خيار خاطئ 1': wrongOptions[0] || '',
      'خيار خاطئ 2': wrongOptions[1] || '',
      'خيار خاطئ 3': wrongOptions[2] || '',
      'الدرس': lessonName,
      'مصدر السؤال': q.source_reference || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الأسئلة');
  
  // Set column widths
  const wscols = [
    { wch: 10 }, // رقم السؤال
    { wch: 20 }, // المادة
    { wch: 60 }, // السؤال
    { wch: 30 }, // الإجابة الصحيحة
    { wch: 25 }, // خيار خاطئ 1
    { wch: 25 }, // خيار خاطئ 2
    { wch: 25 }, // خيار خاطئ 3
    { wch: 25 }, // الدرس
    { wch: 20 }  // مصدر السؤال
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `${title}.xlsx`);
};

export const exportQuizToExcel = (quiz: any) => {
  const subjectName = quiz.subjects?.name || '';
  const quizTitle = quiz.title;
  
  // Collect all questions from the quiz itself and all its versions
  let allData: any[] = [];

  const mapQuestion = (q: QuizQuestion, index: number, modelName: string) => {
    const wrongOptions = q.options.filter((_, idx) => idx !== q.correct_option_index);
    return {
      'النموذج': modelName,
      'رقم السؤال': index + 1,
      'رقم السؤال التسلسلي': q.serial_number || '',
      'رقم الصفحة الداخلي': q.page_number || '',
      'المادة': subjectName,
      'السؤال': q.question,
      'الإجابة الصحيحة': q.options[q.correct_option_index] || '',
      'خيار خاطئ 1': wrongOptions[0] || '',
      'خيار خاطئ 2': wrongOptions[1] || '',
      'خيار خاطئ 3': wrongOptions[2] || '',
      'الشرح والتوضيحات': q.explanation || '',
      'طريقة الحل': q.solution_method || '',
      'الاختبار': quizTitle,
      'مصدر السؤال': q.source_reference || ''
    };
  };

  // Skip base questions (النموذج الأصلي) as it's duplicate of first version
  // Add questions from versions
  if (quiz.versions && Array.isArray(quiz.versions)) {
    quiz.versions.forEach((version: any) => {
      if (version.questions && Array.isArray(version.questions)) {
        version.questions.forEach((q: QuizQuestion, index: number) => {
          allData.push(mapQuestion(q, index, version.name));
        });
      }
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(allData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الأسئلة');
  
  // Set column widths
  const wscols = [
    { wch: 15 }, // النموذج
    { wch: 10 }, // رقم السؤال
    { wch: 20 }, // المادة
    { wch: 60 }, // السؤال
    { wch: 30 }, // الإجابة الصحيحة
    { wch: 25 }, // خيار خاطئ 1
    { wch: 25 }, // خيار خاطئ 2
    { wch: 25 }, // خيار خاطئ 3
    { wch: 40 }, // الشرح والتوضيحات
    { wch: 40 }, // طريقة الحل
    { wch: 25 }, // الاختبار
    { wch: 20 }  // مصدر السؤال
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `أسئلة_اختبار_${quizTitle}.xlsx`);
};

/**
 * تصدير اختبار إلى PDF بأنواع مختلفة
 */
export type QuizPdfExportType = 
  | 'questions_with_all_options' // الأسئلة مع جميع الخيارات بدون تحديد الإجابة
  | 'questions_only' // الأسئلة فقط دون إجابات
  | 'questions_with_correct_answers' // الأسئلة مع الإجابات الصحيحة فقط
  | 'answers_with_explanations' // رقم السؤال + رقم المرجع + الإجابات والتوضيحات
  | 'answer_key_only' // رقم السؤال + رقم الإجابة الصحيحة فقط
  | 'lesson_images_only' // صور الدرس أو الدروس المختارة فقط
  | 'lesson_names_only'; // اسم الدرس أو الدروس المختارة فقط مع اسم النموذج

export const exportQuizToPdf = async (
  quiz: any,
  exportTypes: QuizPdfExportType[],
  selectedLessons?: Lesson[]
) => {
  const quizTitle = quiz.title || 'اختبار';
  const subjectName = quiz.subjects?.name || '';
  
  console.log('=== PDF Export Debug ===');
  console.log('Quiz Title:', quizTitle);
  console.log('Subject:', subjectName);
  console.log('Export Types:', exportTypes);
  console.log('Quiz Data:', {
    hasQuestions: !!quiz.questions,
    questionsCount: quiz.questions?.length || 0,
    hasVersions: !!quiz.versions,
    versionsCount: quiz.versions?.length || 0,
    versions: quiz.versions
  });
  
  // التحقق من وجود بيانات
  if (!quiz.questions || quiz.questions.length === 0) {
    if (!quiz.versions || quiz.versions.length === 0 || !quiz.versions.some((v: any) => v.questions && v.questions.length > 0)) {
      throw new Error('الاختبار لا يحتوي على أسئلة. يرجى التأكد من إنشاء الأسئلة أولاً.');
    }
  }
  
  // جمع النماذج بشكل منفصل
  const versions: { version: any; modelName: string; questions: { question: QuizQuestion; index: number }[] }[] = [];
  
  // Skip base questions (النموذج الأصلي) as it's duplicate of first version
  
  // إضافة أسئلة النماذج البديلة
  if (quiz.versions && Array.isArray(quiz.versions) && quiz.versions.length > 0) {
    console.log('Adding version questions from', quiz.versions.length, 'versions');
    quiz.versions.forEach((version: any, vIdx: number) => {
      if (version.questions && Array.isArray(version.questions) && version.questions.length > 0) {
        console.log(`Version ${vIdx + 1} (${version.name}):`, version.questions.length, 'questions');
        const versionQuestions = version.questions.map((q: QuizQuestion, idx: number) => ({
          question: q,
          index: idx + 1
        }));
        versions.push({
          version,
          modelName: version.name || `النموذج (${vIdx + 1})`,
          questions: versionQuestions
        });
      }
    });
  }
  
  console.log('Total versions collected:', versions.length);
  
  if (versions.length === 0) {
    throw new Error('لا توجد نماذج للتصدير');
  }
  
  // إنشاء HTML للطباعة (نفس آلية تصدير الدروس)
  let printHTML = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${quizTitle} - الوسيلة الذكية</title>
      <style>
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
        
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        body {
          font-family: Arial, sans-serif;
          direction: rtl;
          background: white;
          color: #000;
          padding: 20px;
          line-height: 1.6;
          position: relative;
        }
        
        /* علامة مائية متكررة في جميع الصفحات - أمام المحتوى */
        body::after {
          content: 'تطبيق الوسيله الذكيه • للاستفسار 772772732 • جميع الحقوق محفوظة ';
          position: fixed;
          top: -50%;
          left: -50%;
          width: 300%;
          height: 300%;
          transform: rotate(-45deg);
          font-size: 16px;
          font-weight: bold;
          color: rgba(102, 126, 234, 0.18);
          white-space: normal;
          word-wrap: break-word;
          line-height: 3.5;
          z-index: 9999;
          pointer-events: none;
          overflow: hidden;
        }
        
        /* جعل المحتوى خلف العلامة المائية */
        .content-wrapper {
          position: relative;
          z-index: 1;
        }
        
        .header {
          background-color: #667eea;
          padding: 20px 30px;
          margin-bottom: 25px;
          text-align: center;
          border: 3px solid #5568d3;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }
        
        .header-logo {
          width: 80px;
          height: 80px;
          object-fit: contain;
        }
        
        .header-text {
          flex: 1;
        }
        
        .header h1 {
          color: #ffffff;
          font-size: 28px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        
        .header p {
          color: #ffffff;
          font-size: 14px;
          margin: 0;
        }
        
        .info-table {
          width: 100%;
          margin-bottom: 25px;
          border-collapse: collapse;
        }
        
        .info-table td {
          width: 50%;
          padding: 20px;
          text-align: center;
          border: 3px solid;
        }
        
        .info-table td:first-child {
          background-color: #f093fb;
          border-color: #e082ea;
        }
        
        .info-table td:last-child {
          background-color: #f5576c;
          border-color: #e04658;
        }
        
        .info-table .label {
          color: #ffffff;
          font-size: 14px;
          margin: 0 0 8px 0;
        }
        
        .info-table .value {
          color: #ffffff;
          font-size: 20px;
          font-weight: bold;
          margin: 0;
        }
        
        .section-title {
          background-color: #667eea;
          color: white;
          padding: 15px 20px;
          margin: 30px 0 20px 0;
          font-size: 20px;
          font-weight: bold;
          border: 3px solid #5568d3;
          text-align: center;
        }
        
        .question-box {
          background-color: #ffffff;
          padding: 20px;
          margin-bottom: 20px;
          border: 3px solid #667eea;
          page-break-inside: avoid;
        }
        
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .question-number {
          background-color: #dc2626;
          color: white;
          padding: 8px 16px;
          font-weight: bold;
          font-size: 16px;
          border: 2px solid #991b1b;
        }
        
        .model-name {
          color: #6b7280;
          font-size: 12px;
        }
        
        .question-text {
          color: #1f2937;
          font-size: 17px;
          font-weight: bold;
          margin-bottom: 15px;
          line-height: 1.8;
        }
        
        .options {
          margin-right: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .option {
          padding: 10px;
          border: 2px solid #d1d5db;
          background-color: #f9fafb;
          display: flex;
          align-items: center;
        }
        
        .option.correct {
          background-color: #dbeafe;
          border-color: #1e40af;
          font-weight: bold;
        }
        
        .option-label {
          background-color: #9ca3af;
          color: white;
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          margin-left: 10px;
          flex-shrink: 0;
        }
        
        .option.correct .option-label {
          background-color: #1e40af;
        }
        
        .option-text {
          color: #1f2937;
          font-size: 15px;
          flex: 1;
        }
        
        .explanation-box {
          background-color: #fef3c7;
          padding: 15px;
          margin-top: 15px;
          border: 2px solid #f59e0b;
        }
        
        .explanation-label {
          color: #92400e;
          font-weight: bold;
          font-size: 14px;
          margin: 0 0 5px 0;
        }
        
        .explanation-text {
          color: #1f2937;
          font-size: 14px;
          margin: 0 0 10px 0;
          line-height: 1.6;
        }
        
        .answer-key-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .answer-key-table th,
        .answer-key-table td {
          border: 2px solid #667eea;
          padding: 12px;
          text-align: center;
        }
        
        .answer-key-table th {
          background-color: #667eea;
          color: white;
          font-weight: bold;
        }
        
        .answer-key-table td {
          background-color: #f9fafb;
        }
        
        .footer {
          margin-top: 40px;
          padding: 20px;
          background-color: #667eea;
          text-align: center;
          border: 3px solid #5568d3;
          page-break-inside: avoid;
        }
        
        .footer p {
          color: #ffffff;
          font-size: 13px;
          margin: 0;
          line-height: 1.8;
        }
        
        .page-break {
          page-break-after: always;
        }
      </style>
    </head>
    <body>
      <div class="content-wrapper">
        <div class="header">
          <img src="https://miaoda-conversation-file.s3cdn.medo.dev/user-9wofituwhou8/conv-a8tauoehdn9c/20260315/file-a9l4g2jirr40.jpg" alt="شعار التطبيق" class="header-logo" />
          <div class="header-text">
            <h1>تطبيق الوسيلة الذكية</h1>
            <p>سلسلة وسائل أجيالنا</p>
          </div>
        </div>
      
      <table class="info-table">
        <tr>
          <td>
            <p class="label">عنوان الاختبار</p>
            <p class="value">${quizTitle}</p>
          </td>
          <td>
            <p class="label">المادة</p>
            <p class="value">${subjectName}</p>
          </td>
        </tr>
      </table>
  `;
  
  // دالة لتوليد محتوى PDF لنوع واحد
  const generateTypeContent = (
    type: QuizPdfExportType,
    versionQuestions: { question: QuizQuestion; index: number }[],
    modelName: string,
    versionData?: any
  ) => {
    let htmlContent = '';
    
    const sectionTitle = `
      <div class="section-title">
        ${type === 'questions_with_all_options' ? '📝 الأسئلة مع جميع الخيارات' : ''}
        ${type === 'questions_only' ? '❓ الأسئلة فقط' : ''}
        ${type === 'questions_with_correct_answers' ? '✅ الأسئلة مع الإجابات الصحيحة' : ''}
        ${type === 'answers_with_explanations' ? '💡 الإجابات مع التوضيحات' : ''}
        ${type === 'answer_key_only' ? '🔑 مفتاح الإجابات' : ''}
        ${type === 'lesson_images_only' ? '🖼️ صور الدروس' : ''}
        ${type === 'lesson_names_only' ? '📚 أسماء الدروس' : ''}
        <span style="margin-right: 10px; color: #00acc1; font-weight: bold;">(${modelName})</span>
      </div>
    `;

    switch (type) {
      case 'questions_with_all_options':
        htmlContent = sectionTitle;
        versionQuestions.forEach(({ question, index }) => {
          const refNumber = question.source_reference ? ` (${question.source_reference})` : '';
          const serialNumber = question.serial_number ? ` - ${question.serial_number}` : '';
          const pageNumber = question.page_number ? ` - ص${question.page_number}` : '';
          htmlContent += `
            <div class="question-box">
              <div class="question-header">
                <span class="question-number">س ${index}${serialNumber}${pageNumber}${refNumber}</span>
                <span class="model-name">${modelName}</span>
              </div>
              <p class="question-text">${question.question}</p>
              <div class="options">
                ${question.options.map((opt, idx) => `
                  <div class="option">
                    <span class="option-label">${String.fromCharCode(65 + idx)}</span>
                    <span class="option-text">${opt}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        });
        break;

      case 'questions_only':
        htmlContent = sectionTitle;
        versionQuestions.forEach(({ question, index }) => {
          const refNumber = question.source_reference ? ` (${question.source_reference})` : '';
          htmlContent += `
            <div class="question-box">
              <div class="question-header">
                <span class="question-number">س ${index}${question.serial_number ? ` - ${question.serial_number}` : ""}${question.page_number ? ` - ص${question.page_number}` : ""}${refNumber}</span>
                <span class="model-name">${modelName}</span>
              </div>
              <p class="question-text">${question.question}</p>
            </div>
          `;
        });
        break;

      case 'questions_with_correct_answers':
        htmlContent = sectionTitle;
        versionQuestions.forEach(({ question, index }) => {
          const refNumber = question.source_reference ? ` (${question.source_reference})` : '';
          htmlContent += `
            <div class="question-box">
              <div class="question-header">
                <span class="question-number">س ${index}${question.serial_number ? ` - ${question.serial_number}` : ""}${question.page_number ? ` - ص${question.page_number}` : ""}${refNumber}</span>
                <span class="model-name">${modelName}</span>
              </div>
              <p class="question-text">${question.question}</p>
              <div class="options">
                ${question.options.map((opt, idx) => `
                  <div class="option ${idx === question.correct_option_index ? 'correct' : ''}">
                    <span class="option-label">${String.fromCharCode(65 + idx)}</span>
                    <span class="option-text">${opt} ${idx === question.correct_option_index ? '✓' : ''}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        });
        break;

      case 'answers_with_explanations':
        htmlContent = sectionTitle;
        versionQuestions.forEach(({ question, index }) => {
          const refNumber = question.source_reference ? ` (${question.source_reference})` : '';
          htmlContent += `
            <div class="question-box">
              <div class="question-header">
                <span class="question-number">س ${index}${question.serial_number ? ` - ${question.serial_number}` : ""}${question.page_number ? ` - ص${question.page_number}` : ""}${refNumber}</span>
                <span class="model-name">${modelName}</span>
              </div>
              <p class="question-text">${question.question}</p>
              <div class="options">
                ${question.options.map((opt, idx) => `
                  <div class="option ${idx === question.correct_option_index ? 'correct' : ''}">
                    <span class="option-label">${String.fromCharCode(65 + idx)}</span>
                    <span class="option-text">${opt} ${idx === question.correct_option_index ? '✓' : ''}</span>
                  </div>
                `).join('')}
              </div>
              ${question.explanation || question.method ? `
                <div class="explanation-box">
                  ${question.explanation ? `
                    <p class="explanation-label">💡 الشرح:</p>
                    <p class="explanation-text">${question.explanation}</p>
                  ` : ''}
                  ${question.method ? `
                    <p class="explanation-label">🔍 طريقة الحل:</p>
                    <p class="explanation-text">${question.method}</p>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          `;
        });
        break;

      case 'answer_key_only':
        htmlContent = sectionTitle;
        htmlContent += `
          <table class="answer-key-table">
            <thead>
              <tr>
                <th>رقم السؤال</th>
                <th>النموذج</th>
                <th>الإجابة الصحيحة</th>
              </tr>
            </thead>
            <tbody>
              ${versionQuestions.map(({ question, index }) => {
                const refNumber = question.source_reference ? ` (${question.source_reference})` : '';
                return `
                <tr>
                  <td>${index}${refNumber}</td>
                  <td>${modelName}</td>
                  <td>${String.fromCharCode(65 + question.correct_option_index)}</td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>
        `;
        break;

      case 'lesson_names_only':
        if (selectedLessons && selectedLessons.length > 0) {
          htmlContent = sectionTitle;
          htmlContent += `
            <table class="answer-key-table">
              <thead>
                <tr>
                  <th>الرقم</th>
                  <th>اسم الدرس</th>
                  <th>رقم الصفحة</th>
                </tr>
              </thead>
              <tbody>
                ${selectedLessons.map((lesson, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${lesson.title}</td>
                    <td>${lesson.page_number || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }
        break;

      case 'lesson_images_only':
        if (selectedLessons && selectedLessons.length > 0) {
          htmlContent = sectionTitle;
          selectedLessons.forEach((lesson, idx) => {
            if (lesson.image_urls && lesson.image_urls.length > 0) {
              // تحديد عدد الصور لتسريع التصدير (أول 2 صور فقط)
              const imagesToExport = lesson.image_urls.slice(0, 2);
              htmlContent += `
                <div class="question-box">
                  <h3 style="margin: 0 0 15px 0; color: #667eea;">${lesson.title}</h3>
                  ${imagesToExport.map((imgUrl: string) => `
                    <img src="${imgUrl}" alt="${lesson.title}" style="width: 100%; max-width: 600px; margin-bottom: 15px; border: 2px solid #e5e7eb;" loading="lazy" />
                  `).join('')}
                </div>
              `;
            }
          });
        }
        break;

      default:
        htmlContent = sectionTitle + '<p style="text-align: center; padding: 20px;">نوع تصدير غير معروف</p>';
    }
    
    return htmlContent;
  };
  
  // فصل أنواع التصدير إلى نوعين: محتوى الدروس (يطبع مرة واحدة) ومحتوى الأسئلة (يطبع لكل نموذج)
  const lessonContentTypes = exportTypes.filter(t => t === 'lesson_images_only' || t === 'lesson_names_only');
  const questionContentTypes = exportTypes.filter(t => t !== 'lesson_images_only' && t !== 'lesson_names_only');
  
  // طباعة محتوى الدروس مرة واحدة في البداية (إن وجد)
  if (lessonContentTypes.length > 0) {
    lessonContentTypes.forEach((type, idx) => {
      printHTML += generateTypeContent(type, [], '', selectedLessons); // إصلاح: تمرير selectedLessons بدلاً من undefined
      if (idx < lessonContentTypes.length - 1 || questionContentTypes.length > 0) {
        printHTML += '<div class="page-break"></div>';
      }
    });
  }
  
  // إضافة محتوى جميع النماذج مع أنواع التصدير المختارة (الأسئلة فقط)
  versions.forEach((versionData, vIdx) => {
    // إضافة عنوان النموذج
    printHTML += `
      <div class="section-title" style="background: linear-gradient(135deg, #00acc1, #00838f); color: white; padding: 15px; margin: 20px 0; border-radius: 8px; font-size: 20px; text-align: center;">
        ${versionData.modelName}
      </div>
    `;
    
    // إضافة صور الدروس المرتبطة بهذا النموذج (إذا كان محدداً)
    if (exportTypes.includes('lesson_images_only') && selectedLessons && selectedLessons.length > 0) {
      // استخراج معرفات الدروس المرتبطة بأسئلة هذا النموذج
      const versionLessonIds = new Set<string>();
      versionData.questions.forEach((q: any) => {
        if (q.question.lesson_id) {
          versionLessonIds.add(q.question.lesson_id);
        }
      });
      
      // تصفية الدروس المرتبطة بهذا النموذج
      const versionLessons = selectedLessons.filter(lesson => versionLessonIds.has(lesson.id));
      
      if (versionLessons.length > 0) {
        printHTML += `
          <div class="section-title" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px; margin: 15px 0; border-radius: 8px; font-size: 16px; text-align: center;">
            🖼️ صور الدروس المرتبطة بهذا النموذج
          </div>
        `;
        
        versionLessons.forEach((lesson) => {
          if (lesson.image_urls && lesson.image_urls.length > 0) {
            // تحديد عدد الصور لتسريع التصدير (أول 2 صور فقط)
            const imagesToExport = lesson.image_urls.slice(0, 2);
            printHTML += `
              <div class="question-box">
                <h3 style="margin: 0 0 15px 0; color: #667eea;">${lesson.title}</h3>
                ${imagesToExport.map((imgUrl: string) => `
                  <img src="${imgUrl}" alt="${lesson.title}" style="width: 100%; max-width: 600px; margin-bottom: 15px; border: 2px solid #e5e7eb;" loading="lazy" />
                `).join('')}
              </div>
            `;
          }
        });
        
        printHTML += '<div class="page-break"></div>';
      }
    }
    
    // ترتيب أنواع التصدير الخاصة بالأسئلة
    const sortedQuestionTypes = [...questionContentTypes].sort((a, b) => {
      const order: Partial<Record<QuizPdfExportType, number>> = {
        'questions_with_all_options': 1,
        'questions_only': 2,
        'questions_with_correct_answers': 3,
        'answers_with_explanations': 4,
        'answer_key_only': 5
      };
      return (order[a] || 99) - (order[b] || 99);
    });
    
    // إضافة جميع أنواع التصدير لهذا النموذج بالترتيب المحدد
    sortedQuestionTypes.forEach((type, typeIdx) => {
      printHTML += generateTypeContent(type, versionData.questions, versionData.modelName, versionData.version);
      
      // فاصل صفحات بين الأنواع (إلا بعد آخر نوع في آخر نموذج)
      if (!(vIdx === versions.length - 1 && typeIdx === sortedQuestionTypes.length - 1)) {
        printHTML += '<div class="page-break"></div>';
      }
    });
  });
  
  // إضافة التذييل
  printHTML += `
        <div class="footer">
          <p>للإستفسار 772772732</p>
          <p>جميع الحقوق محفوظة السندس للتجهيزات التعليمية - نهتم من أجلكم</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  console.log('Print HTML generated, length:', printHTML.length);
  
  // فتح نافذة الطباعة (نفس آلية تصدير الدروس)
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('تعذر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.');
  }
  
  printWindow.document.write(printHTML);
  printWindow.document.close();
  
  // انتظار تحميل المحتوى
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // تشغيل نافذة الطباعة
  printWindow.focus();
  printWindow.print();
  
  console.log('Print dialog opened successfully');
  
  return `${quizTitle}.pdf`;
};

export const exportLessonToExcel = (lesson: any) => {
  const subjectName = lesson.subjects?.name || '';
  const className = lesson.classes?.name || '';
  const lessonTitle = lesson.title || 'درس';
  const questions = lesson.ai_questions || [];
  
  const data = questions.map((q: QuizQuestion, index: number) => {
    const wrongOptions = q.options.filter((_, idx) => idx !== q.correct_option_index);
    return {
      'رقم السؤال': index + 1,
      'الصف': className,
      'المادة': subjectName,
      'الدرس': lessonTitle,
      'السؤال': q.question,
      'الإجابة الصحيحة': q.options[q.correct_option_index] || '',
      'خيار خاطئ 1': wrongOptions[0] || '',
      'خيار خاطئ 2': wrongOptions[1] || '',
      'خيار خاطئ 3': wrongOptions[2] || '',
      'الشرح': q.explanation || '',
      'طريقة الحل': q.method || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الأسئلة');
  
  // Set column widths
  const wscols = [
    { wch: 10 }, // رقم السؤال
    { wch: 15 }, // الصف
    { wch: 20 }, // المادة
    { wch: 30 }, // الدرس
    { wch: 60 }, // السؤال
    { wch: 30 }, // الإجابة الصحيحة
    { wch: 25 }, // خيار خاطئ 1
    { wch: 25 }, // خيار خاطئ 2
    { wch: 25 }, // خيار خاطئ 3
    { wch: 40 }, // الشرح
    { wch: 40 }  // طريقة الحل
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `${lessonTitle}_أسئلة.xlsx`);
};

export const exportMultipleLessonsToExcel = (lessons: any[]) => {
  let allData: any[] = [];
  
  lessons.forEach((lesson) => {
    const subjectName = lesson.subjects?.name || '';
    const className = lesson.classes?.name || '';
    const lessonTitle = lesson.title || 'درس';
    const questions = lesson.ai_questions || [];
    
    questions.forEach((q: QuizQuestion, index: number) => {
      const wrongOptions = q.options.filter((_, idx) => idx !== q.correct_option_index);
      allData.push({
        'رقم السؤال': index + 1,
        'الصف': className,
        'المادة': subjectName,
        'الدرس': lessonTitle,
        'السؤال': q.question,
        'الإجابة الصحيحة': q.options[q.correct_option_index] || '',
        'خيار خاطئ 1': wrongOptions[0] || '',
        'خيار خاطئ 2': wrongOptions[1] || '',
        'خيار خاطئ 3': wrongOptions[2] || '',
        'الشرح': q.explanation || '',
        'طريقة الحل': q.method || ''
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(allData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'جميع الأسئلة');
  
  // Set column widths
  const wscols = [
    { wch: 10 }, // رقم السؤال
    { wch: 15 }, // الصف
    { wch: 20 }, // المادة
    { wch: 30 }, // الدرس
    { wch: 60 }, // السؤال
    { wch: 30 }, // الإجابة الصحيحة
    { wch: 25 }, // خيار خاطئ 1
    { wch: 25 }, // خيار خاطئ 2
    { wch: 25 }, // خيار خاطئ 3
    { wch: 40 }, // الشرح
    { wch: 40 }  // طريقة الحل
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `دروس_متعددة_أسئلة.xlsx`);
};

export const exportLessonToPDF = async (
  lesson: any, 
  onProgress?: (progress: number, status: string) => void
) => {
  try {
    const subjectName = lesson.subjects?.name || 'غير محدد';
    const className = lesson.classes?.name || 'غير محدد';
    const lessonTitle = lesson.title || 'درس بدون عنوان';
    const pageNumber = lesson.page_number || '';
    const summary = lesson.summary || 'لا يوجد ملخص متاح';
    const questions = lesson.ai_questions || [];
    const images = lesson.image_urls || [];
    
    onProgress?.(10, 'جاري تجهيز المحتوى...');
    
    // Create print-friendly HTML
    let printHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${lessonTitle} - الوسيلة الذكية</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          body {
            font-family: Arial, sans-serif;
            direction: rtl;
            background: white;
            color: #000;
            padding: 20px;
            line-height: 1.6;
            position: relative;
          }
          
          /* علامة مائية متكررة في جميع الصفحات - أمام المحتوى */
          body::after {
            content: 'جميع الحقوق محفوظه سندس للتجهيزات التعليميه - نهتم من اجلكم - للاستفسار 772772732';
            position: fixed;
            top: -50%;
            left: -50%;
            width: 300%;
            height: 300%;
            transform: rotate(-45deg);
            font-size: 16px;
            font-weight: bold;
            color: rgba(102, 126, 234, 0.18);
            white-space: normal;
            word-wrap: break-word;
            line-height: 3.5;
            z-index: 9999;
            pointer-events: none;
            overflow: hidden;
          }
          
          /* جعل المحتوى خلف العلامة المائية */
          .content-wrapper {
            position: relative;
            z-index: 1;
          }
          
          .header {
            background-color: #667eea;
            padding: 20px 30px;
            margin-bottom: 25px;
            text-align: center;
            border: 3px solid #5568d3;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
          }
          
          .header-logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
          }
          
          .header-text {
            flex: 1;
          }
          
          .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: bold;
            margin: 0 0 5px 0;
          }
          
          .header p {
            color: #ffffff;
            font-size: 14px;
            margin: 0;
          }
          
          .info-table {
            width: 100%;
            margin-bottom: 25px;
            border-collapse: collapse;
          }
          
          .info-table td {
            width: 50%;
            padding: 20px;
            text-align: center;
            border: 3px solid;
          }
          
          .info-table td:first-child {
            background-color: #f093fb;
            border-color: #e082ea;
          }
          
          .info-table td:last-child {
            background-color: #f5576c;
            border-color: #e04658;
          }
          
          .info-table .label {
            color: #ffffff;
            font-size: 14px;
            margin: 0 0 8px 0;
          }
          
          .info-table .value {
            color: #ffffff;
            font-size: 20px;
            font-weight: bold;
            margin: 0;
          }
          
          .title-box {
            background-color: #4facfe;
            padding: 25px;
            margin-bottom: 25px;
            text-align: center;
            border: 3px solid #3d9be5;
          }
          
          .title-box h2 {
            color: #ffffff;
            font-size: 26px;
            font-weight: bold;
            margin: 0;
          }
          
          .title-box .page-num {
            color: #ffffff;
            font-size: 16px;
            margin: 8px 0 0 0;
          }
          
          .images-section {
            background-color: #f8f9fa;
            padding: 20px;
            margin-bottom: 25px;
            border: 2px solid #e5e7eb;
            page-break-inside: avoid;
          }
          
          .images-section h3 {
            color: #667eea;
            font-size: 20px;
            font-weight: bold;
            margin: 0 0 15px 0;
          }
          
          .lesson-image {
            margin-bottom: 15px;
            text-align: center;
            page-break-inside: avoid;
          }
          
          .lesson-image img {
            max-width: 100%;
            height: auto;
            border: 2px solid #e5e7eb;
          }
          
          .summary-box {
            background-color: #f8f9fa;
            padding: 25px;
            margin-bottom: 25px;
            border-right: 5px solid #667eea;
            border: 2px solid #e5e7eb;
            page-break-inside: avoid;
          }
          
          .summary-box h3 {
            color: #667eea;
            font-size: 22px;
            font-weight: bold;
            margin: 0 0 15px 0;
          }
          
          .summary-box p {
            color: #333333;
            font-size: 15px;
            line-height: 1.8;
            margin: 0;
          }
          
          .questions-header {
            background-color: #fa709a;
            padding: 20px;
            margin-bottom: 25px;
            text-align: center;
            border: 3px solid #e95f89;
          }
          
          .questions-header h3 {
            color: #ffffff;
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }
          
          .question-box {
            background-color: #ffffff;
            padding: 20px;
            margin-bottom: 20px;
            border: 3px solid;
            border-right-width: 5px;
            page-break-inside: avoid;
          }
          
          .question-box.easy {
            border-color: #10b981;
          }
          
          .question-box.medium {
            border-color: #f59e0b;
          }
          
          .question-box.hard {
            border-color: #ef4444;
          }
          
          .question-header {
            display: table;
            width: 100%;
            margin-bottom: 15px;
          }
          
          .question-number {
            display: table-cell;
            width: auto;
            min-width: 50px;
            vertical-align: top;
          }
          
          .question-number-badge {
            background-color: #dc2626;
            color: #ffffff;
            min-width: 40px;
            width: auto;
            height: 40px;
            padding: 0 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 16px;
            border: 2px solid #991b1b;
            white-space: nowrap;
          }
          
          .question-text {
            display: table-cell;
            vertical-align: top;
            padding-right: 10px;
          }
          
          .question-text p {
            color: #1f2937;
            font-size: 17px;
            font-weight: bold;
            margin: 0;
            line-height: 1.6;
          }
          
          .options {
            margin-right: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          
          .option {
            padding: 10px;
            border: 2px solid;
            display: table;
            width: 100%;
          }
          
          .option.correct {
            background-color: #d4fc79;
            border-color: #10b981;
          }
          
          .option.incorrect {
            background-color: #f3f4f6;
            border-color: #d1d5db;
          }
          
          .option-label {
            display: table-cell;
            width: 35px;
          }
          
          .option-label-badge {
            background-color: #9ca3af;
            color: #ffffff;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
          }
          
          .option.correct .option-label-badge {
            background-color: #10b981;
          }
          
          .option-text {
            display: table-cell;
            vertical-align: middle;
            padding-right: 10px;
            color: #1f2937;
            font-size: 15px;
          }
          
          .option-check {
            display: table-cell;
            width: 30px;
            text-align: left;
            vertical-align: middle;
          }
          
          .option-check span {
            color: #10b981;
            font-weight: bold;
            font-size: 20px;
          }
          
          .explanation-box {
            background-color: #fef3c7;
            padding: 15px;
            margin: 15px 0 0 50px;
            border: 2px solid #f59e0b;
            border-right-width: 4px;
          }
          
          .explanation-box p {
            margin: 0 0 12px 0;
          }
          
          .explanation-box p:last-child {
            margin-bottom: 0;
          }
          
          .explanation-label {
            color: #92400e;
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 5px;
          }
          
          .explanation-text {
            color: #78350f;
            font-size: 13px;
            line-height: 1.6;
          }
          
          .badges {
            margin: 10px 0 0 50px;
          }
          
          .badge {
            display: inline-block;
            padding: 5px 12px;
            font-size: 12px;
            font-weight: bold;
            border: 1px solid;
            margin-left: 8px;
          }
          
          .badge.difficulty-easy {
            background-color: #d1fae5;
            color: #065f46;
            border-color: #065f46;
          }
          
          .badge.difficulty-medium {
            background-color: #fef3c7;
            color: #92400e;
            border-color: #92400e;
          }
          
          .badge.difficulty-hard {
            background-color: #fee2e2;
            color: #991b1b;
            border-color: #991b1b;
          }
          
          .badge.type {
            background-color: #dbeafe;
            color: #1e40af;
            border-color: #1e40af;
          }
          
          .footer {
            margin-top: 40px;
            padding: 20px;
            background-color: #667eea;
            text-align: center;
            border: 3px solid #5568d3;
          }
          
          .footer p {
            color: #ffffff;
            font-size: 13px;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="content-wrapper">
          <div class="header">
            <img src="https://miaoda-conversation-file.s3cdn.medo.dev/user-9wofituwhou8/conv-a8tauoehdn9c/20260315/file-a9l4g2jirr40.jpg" alt="شعار التطبيق" class="header-logo" />
            <div class="header-text">
              <h1>تطبيق الوسيلة الذكية</h1>
              <p>سلسلة وسائل أجيالنا</p>
            </div>
          </div>
        
        <table class="info-table">
          <tr>
            <td>
              <p class="label">الصف الدراسي</p>
              <p class="value">${className}</p>
            </td>
            <td>
              <p class="label">المادة</p>
              <p class="value">${subjectName}</p>
            </td>
          </tr>
        </table>
        
        <div class="title-box">
          <h2>📚 ${lessonTitle}</h2>
          ${pageNumber ? `<p class="page-num">صفحة ${pageNumber}</p>` : ''}
        </div>
    `;
    
    onProgress?.(30, 'جاري إضافة الصور...');
    
    // Add lesson images if available
    if (images && images.length > 0) {
      printHTML += `
        <div class="images-section">
          <h3>📷 صور الدرس</h3>
      `;
      
      // تحديد عدد الصور لتسريع التصدير (أول 2 صور فقط)
      images.slice(0, 2).forEach((imgUrl: string, idx: number) => {
        printHTML += `
          <div class="lesson-image">
            <img src="${imgUrl}" alt="صورة الدرس ${idx + 1}" loading="lazy" />
          </div>
        `;
      });
      
      printHTML += `</div>`;
    }
    
    onProgress?.(40, 'جاري إضافة الملخص...');
    
    printHTML += `
        <div class="summary-box">
          <h3>📝 ملخص الدرس</h3>
          <p>${summary}</p>
        </div>
    `;
    
    onProgress?.(50, 'جاري إضافة الأسئلة...');
    
    if (questions.length > 0) {
      printHTML += `
        <div class="questions-header">
          <h3>❓ أسئلة الدرس (${questions.length} سؤال)</h3>
        </div>
      `;
      
      questions.forEach((q: any, idx: number) => {
        const diffClass = q.difficulty === 'easy' ? 'easy' : q.difficulty === 'medium' ? 'medium' : 'hard';
        const diffText = q.difficulty === 'easy' ? '⭐ سهل' : q.difficulty === 'medium' ? '⭐⭐ متوسط' : '⭐⭐⭐ صعب';
        const diffBadgeClass = `difficulty-${q.difficulty || 'medium'}`;
        
        // إضافة رقم المرجع الداخلي إذا كان موجوداً
        const refNumber = q.source_reference ? ` (${q.source_reference})` : '';
        
        printHTML += `
          <div class="question-box ${diffClass}">
            <div class="question-header">
              <div class="question-number">
                <div class="question-number-badge">س ${idx + 1}${refNumber}</div>
              </div>
              <div class="question-text">
                <p>${q.question}</p>
              </div>
            </div>
            
            <div class="options">
        `;
        
        (q.options || []).forEach((opt: string, optIdx: number) => {
          const isCorrect = optIdx === q.correct_option_index;
          const optClass = isCorrect ? 'correct' : 'incorrect';
          
          printHTML += `
              <div class="option ${optClass}">
                <div class="option-label">
                  <div class="option-label-badge">${String.fromCharCode(65 + optIdx)}</div>
                </div>
                <div class="option-text">${opt}</div>
                ${isCorrect ? '<div class="option-check"><span>✓</span></div>' : ''}
              </div>
          `;
        });
        
        printHTML += `</div>`;
        
        if (q.explanation || q.method || q.source_reference) {
          printHTML += `<div class="explanation-box">`;
          
          if (q.explanation) {
            printHTML += `
              <p class="explanation-label">💡 الشرح:</p>
              <p class="explanation-text">${q.explanation}</p>
            `;
          }
          
          if (q.method) {
            printHTML += `
              <p class="explanation-label">🔍 طريقة الحل:</p>
              <p class="explanation-text">${q.method}</p>
            `;
          }
          
          if (q.source_reference) {
            printHTML += `
              <p class="explanation-label">📖 المصدر:</p>
              <p class="explanation-text">${q.source_reference}</p>
            `;
          }
          
          printHTML += `</div>`;
        }
        
        printHTML += `
            <div class="badges">
              <span class="badge ${diffBadgeClass}">${diffText}</span>
        `;
        
        if (q.type) {
          const typeText = q.type === 'mcq' ? '📝 اختيار متعدد' : '✓✗ صح/خطأ';
          printHTML += `<span class="badge type">${typeText}</span>`;
        }
        
        printHTML += `
            </div>
          </div>
        `;
      });
    }
    
    printHTML += `
        <div class="footer">
          <p>تم التصدير من تطبيق الوسيلة الذكية - سلسلة وسائل أجيالنا • ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        </div>
      </body>
      </html>
    `;
    
    onProgress?.(70, 'جاري فتح نافذة الطباعة...');
    
    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('تعذر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.');
    }
    
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onProgress?.(90, 'جاري التحضير للطباعة...');
    
    // Trigger print dialog
    printWindow.focus();
    printWindow.print();
    
    onProgress?.(100, 'تم فتح نافذة الطباعة! اختر "حفظ كـ PDF" من خيارات الطباعة');
    
    return `${lessonTitle}.pdf`;
  } catch (error: any) {
    console.error('PDF Export Error:', error);
    throw new Error(`فشل في إنشاء PDF: ${error.message || 'خطأ غير معروف'}`);
  }
};

export interface ExportOptions {
  titlesOnly: boolean;
  titlesAndPages: boolean;
  questionsOnlyNoAnswers: boolean;
  titlesPagesQuestions: boolean;
  questionsWithAnswers: boolean;
  questionsWithOptionsNoCorrect: boolean;
  numCorrectAndAttachments: boolean;
  numCorrectOnly: boolean;
  numAnswerSymbolOnly: boolean;
  attachmentsOnly: boolean;
  lessonImages: boolean;
  lessonSummary: boolean; // ملخص الدرس
}

/**
 * Compress image URL to reduce PDF file size
 */
const compressImageUrl = async (imgUrl: string, maxWidth: number = 600, quality: number = 0.5): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Scale down if image is too large
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed base64 with lower quality
          const compressedUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedUrl);
        } else {
          resolve(imgUrl); // Fallback to original
        }
      };
      
      img.onerror = () => {
        resolve(imgUrl); // Fallback to original on error
      };
      
      img.src = imgUrl;
    } catch (error) {
      console.error('Image compression error:', error);
      resolve(imgUrl); // Fallback to original
    }
  });
};

/**
 * Export lessons with selected options and sophisticated formatting
 */
// دالة لتحديد لون العلامة المائية حسب المادة
const getWatermarkColor = (subjectName: string): string => {
  const subject = subjectName.toLowerCase();
  
  // القرآن الكريم: أخضر
  if (subject.includes('قرآن') || subject.includes('قران')) {
    return '#10b981';
  }
  // الإسلامية: أزرق فاتح
  if (subject.includes('إسلام') || subject.includes('اسلام') || subject.includes('فقه') || subject.includes('توحيد') || subject.includes('حديث')) {
    return '#60a5fa';
  }
  // النحو والأدب: بنفسجي
  if (subject.includes('نحو') || subject.includes('أدب') || subject.includes('ادب') || subject.includes('بلاغة')) {
    return '#a855f7';
  }
  // العربي: كحلي
  if (subject.includes('عرب') || subject.includes('لغة')) {
    return '#1e40af';
  }
  // الرياضيات: برتقالي
  if (subject.includes('رياض') || subject.includes('حساب')) {
    return '#f97316';
  }
  // العلوم: أخضر داكن
  if (subject.includes('علوم') || subject.includes('فيزياء') || subject.includes('كيمياء') || subject.includes('أحياء')) {
    return '#059669';
  }
  // التاريخ والجغرافيا: بني
  if (subject.includes('تاريخ') || subject.includes('جغراف')) {
    return '#92400e';
  }
  // الإنجليزي: أحمر
  if (subject.includes('إنجليز') || subject.includes('انجليز') || subject.includes('english')) {
    return '#dc2626';
  }
  
  // إذا لم يتطابق مع أي مادة، استخدم لون عشوائي بناءً على اسم المادة
  const colors = [
    '#00acc1', // سماوي
    '#f97316', // برتقالي
    '#10b981', // أخضر
    '#a855f7', // بنفسجي
    '#dc2626', // أحمر
    '#1e40af', // كحلي
    '#059669', // أخضر داكن
    '#92400e', // بني
    '#60a5fa', // أزرق فاتح
    '#ec4899', // وردي
    '#8b5cf6', // بنفسجي فاتح
    '#f59e0b', // أصفر برتقالي
  ];
  
  // حساب hash بسيط من اسم المادة
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  
  return colors[index];
};

export const exportLessonsWithOptions = async (
  lessons: any[], 
  options: ExportOptions,
  printWindow: Window,
  onProgress?: (progress: number, status: string) => void
) => {
  try {
    console.log('exportLessonsWithOptions called with:', { 
      lessonCount: lessons.length, 
      options,
      firstLesson: lessons[0]?.title 
    });
    
    const appName = 'الوسيلة الذكية';
    const contactInfo = '772772732 - 772772752';
    const copyright = 'جميع الحقوق محفوظة سندس للتجهيزات التعليمية - نهتم من أجلكم';
    
    // Determine title based on count and options
    const mainTitle = lessons.length === 1 ? lessons[0].title : 'تصدير الدروس المحددة';
    
    // Extract subject and class names - handle both single and multiple lessons
    let subjectName = '';
    let className = '';
    
    console.log('🔍 Extracting subject and class names from lessons:', {
      lessonCount: lessons.length,
      firstLesson: lessons[0]?.title,
      hasSubjects: !!lessons[0]?.subjects,
      subjectName: lessons[0]?.subjects?.name,
      hasClasses: !!(lessons[0]?.subjects as any)?.classes,
      className: (lessons[0]?.subjects as any)?.classes?.name
    });
    
    if (lessons.length === 1) {
      // Single lesson: get its subject and class
      subjectName = lessons[0].subjects?.name || '';
      className = (lessons[0].subjects as any)?.classes?.name || '';
      console.log('Single lesson - Subject:', subjectName, 'Class:', className);
    } else if (lessons.length > 1) {
      // Multiple lessons: check if all belong to same subject/class
      const firstSubjectId = lessons[0].subject_id;
      const allSameSubject = lessons.every(l => l.subject_id === firstSubjectId);
      
      if (allSameSubject && lessons[0].subjects) {
        subjectName = lessons[0].subjects.name || '';
        className = (lessons[0].subjects as any)?.classes?.name || '';
        console.log('Multiple lessons (same subject) - Subject:', subjectName, 'Class:', className);
      }
    }
    
    // Fallback to "تصدير متعدد" if not determined
    if (!subjectName) {
      console.warn('⚠️ Subject name not found, using fallback');
      subjectName = 'تصدير متعدد';
    }
    if (!className) {
      console.warn('⚠️ Class name not found, using fallback');
      className = 'تصدير متعدد';
    }
    
    console.log('✅ Final names - Subject:', subjectName, 'Class:', className);
    
    onProgress?.(10, 'جاري تجهيز محتوى التصدير...');

    // Build the types string for the info box
    const selectedTypes = [];
    if (options.titlesOnly) selectedTypes.push('أسماء الدروس فقط');
    if (options.titlesAndPages) selectedTypes.push('العناوين والصفحات');
    if (options.questionsOnlyNoAnswers) selectedTypes.push('الأسئلة فقط (بدون إجابات)');
    if (options.titlesPagesQuestions) selectedTypes.push('العناوين والصفحات والأسئلة');
    if (options.questionsWithAnswers) selectedTypes.push('الأسئلة مع الإجابات');
    if (options.questionsWithOptionsNoCorrect) selectedTypes.push('الأسئلة مع الخيارات (بدون تحديد الإجابة)');
    if (options.numCorrectAndAttachments) selectedTypes.push('رقم السؤال والإجابة الصحيحة والمرفقات');
    if (options.numCorrectOnly) selectedTypes.push('رقم السؤال مع الإجابة الصحيحة فقط');
    if (options.numAnswerSymbolOnly) selectedTypes.push('رقم السؤال مع رمز الإجابة');
    if (options.attachmentsOnly) selectedTypes.push('المرفقات فقط');
    if (options.lessonImages) selectedTypes.push('صور الدرس');
    if (options.lessonSummary) {
      selectedTypes.push('ملخص الدرس');
      console.log('✅ Lesson Summary export option is ENABLED');
    }
    
    const typesStr = selectedTypes.join(' - ');
    console.log('Selected export types:', typesStr);
    console.log('Export options object:', options);

    // تحديد لون العلامة المائية حسب المادة
    const watermarkColor = getWatermarkColor(subjectName);
    console.log('🎨 Watermark color for subject:', subjectName, '→', watermarkColor);

    onProgress?.(30, 'جاري بناء محتوى HTML...');
    
    let printHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${mainTitle} - ${appName}</title>
        <style>
          :root {
            --watermark-color: ${watermarkColor};
          }
          
          @media print {
            @page {
              size: A4;
              margin: 12mm;
            }
            body { 
              margin: 0; 
              padding: 0;
              background: white !important;
              font-size: 12px;
              padding-bottom: 90px;
            }
            .no-print { display: none !important; }
            .page-break {
              page-break-before: always;
            }
            .avoid-break {
              page-break-inside: avoid;
            }
            img {
              max-width: 100%;
              height: auto;
              page-break-inside: avoid;
            }
            .question-item {
              margin-bottom: 8px;
              padding: 10px;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              display: block;
              overflow: visible;
            }
            .question-header {
              page-break-inside: avoid !important;
              page-break-after: avoid !important;
            }
            .option-list {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .attachment-box {
              margin-bottom: 8px;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .lesson-section {
              margin-bottom: 15px;
            }
            .content-wrapper {
              padding-bottom: 100px !important;
            }
            /* مسافة كبيرة فقط في نهاية المحتوى الكامل */
            .questions-section:last-child .question-item:last-child,
            .lesson-section:last-of-type {
              margin-bottom: 80px !important;
            }
          }
          
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          
          body {
            font-family: Arial, sans-serif;
            direction: rtl;
            background: #ffffff !important;
            color: #000000;
            padding: 15px;
            margin: 0;
            line-height: 1.5;
            font-size: 13px;
          }

          /* Page Container */
          .page-container {
            background: #ffffff !important;
            padding: 0;
            margin: 0;
          }

          /* Watermark */
          .watermark-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            pointer-events: none;
          }
          
          .watermark {
            position: absolute;
            opacity: 0.25;
            font-size: 20px;
            font-weight: 900;
            color: var(--watermark-color);
            white-space: nowrap;
            transform: rotate(-45deg);
            text-align: center;
            line-height: 1.4;
            padding: 8px 16px;
            border: 3px solid var(--watermark-color);
            border-radius: 10px;
            background: transparent;
          }
          
          .watermark:nth-child(1) { top: 8%; left: 5%; }
          .watermark:nth-child(2) { top: 15%; left: 50%; }
          .watermark:nth-child(3) { top: 25%; left: 20%; }
          .watermark:nth-child(4) { top: 35%; left: 65%; }
          .watermark:nth-child(5) { top: 45%; left: 10%; }
          .watermark:nth-child(6) { top: 55%; left: 55%; }
          .watermark:nth-child(7) { top: 65%; left: 25%; }
          .watermark:nth-child(8) { top: 75%; left: 70%; }
          .watermark:nth-child(9) { top: 85%; left: 15%; }
          .watermark:nth-child(10) { top: 92%; left: 60%; }
          
          /* Header */
          .page-header {
            background: linear-gradient(135deg, #00acc1, #00838f);
            padding: 20px;
            margin-bottom: 25px;
            border-radius: 8px;
            border: 3px solid #007c8a;
          }

          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
          }

          .header-info { 
            text-align: right; 
            flex: 1;
          }
          
          .header-title { 
            font-size: 28px; 
            font-weight: bold; 
            color: white; 
            margin: 0 0 5px 0;
          }
          
          .header-subtitle {
            font-size: 14px;
            color: white;
            margin: 0;
          }
          
          .header-contacts { 
            font-size: 12px; 
            color: white; 
            margin: 5px 0 0 0;
          }
          
          .header-logo { 
            width: 80px; 
            height: 80px; 
            border: 3px solid white;
            border-radius: 50%;
            overflow: hidden;
            background: white;
            flex-shrink: 0;
          }

          /* Info Box */
          .info-box {
            background: #e0f7fa;
            border: 2px solid #00acc1;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 8px;
          }
          
          .info-box table { 
            width: 100%; 
            border-collapse: collapse; 
          }
          
          .info-box td { 
            padding: 8px 12px; 
            font-size: 14px;
          }
          
          .info-box .label { 
            font-weight: bold; 
            color: #00838f; 
            width: 140px;
          }
          
          .info-box .value { 
            font-weight: 600; 
            color: #000;
          }

          /* Content Wrapper */
          .content-wrapper {
            padding-bottom: 150px;
            margin-bottom: 120px;
          }

          /* Lesson Section */
          .lesson-section { 
            margin-bottom: 30px;
            page-break-after: auto;
          }
          
          /* منع القسم الأخير من الاقتراب من Footer */
          .lesson-section:last-child {
            margin-bottom: 120px;
          }
          
          .lesson-title-bar { 
            background: linear-gradient(135deg, #00acc1, #00838f);
            color: white; 
            padding: 12px 15px; 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 15px; 
            border-radius: 8px;
            border: 2px solid #007c8a;
            page-break-inside: avoid;
            page-break-after: avoid;
          }
          
          /* Lesson Images */
          .lesson-images { 
            margin: 20px 0; 
          }
          
          .lesson-image-wrapper { 
            margin-bottom: 25px; 
            page-break-inside: avoid; 
            text-align: center;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 8px;
            border: 2px solid #00acc1;
          }
          
          .lesson-image { 
            max-width: 400px;
            width: 100%; 
            height: auto; 
            border: 2px solid white; 
            border-radius: 6px;
            display: block;
            margin: 0 auto;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
            object-fit: contain;
          }
          
          .image-caption { 
            margin-top: 8px; 
            font-size: 13px; 
            color: #00838f; 
            font-weight: bold;
            text-align: center;
          }
          
          /* Lesson Summary */
          .lesson-summary-box {
            margin: 15px 0;
            padding: 15px;
            background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
            border: 2px solid #00acc1;
            border-radius: 12px;
            page-break-inside: avoid;
            break-inside: avoid;
            orphans: 3;
            widows: 3;
          }
          
          .summary-header {
            font-size: 16px;
            font-weight: bold;
            color: #00838f;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 2px solid #00acc1;
          }
          
          .summary-content {
            font-size: 13px;
            line-height: 1.6;
            color: #000;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          
          /* Questions Section */
          .questions-section { 
            margin-top: 15px; 
          }
          
          .question-item { 
            border: 2px solid #e0f7fa; 
            padding: 12px; 
            margin-bottom: 15px; 
            border-radius: 8px; 
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            background: #fafafa;
            orphans: 4;
            widows: 4;
            display: block;
            overflow: visible;
          }
          
          .question-header { 
            font-weight: bold; 
            font-size: 14px; 
            color: #000; 
            margin-bottom: 10px; 
            border-bottom: 2px solid #00acc1; 
            padding-bottom: 6px;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }
          
          .question-number {
            color: #b91c1c;
            font-weight: bold;
          }
          
          .option-list { 
            list-style: none; 
            padding: 0; 
            margin: 12px 0;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          .option-item { 
            padding: 8px 14px; 
            border: 2px solid #e0f7fa; 
            border-radius: 6px; 
            display: inline-flex; 
            align-items: center; 
            gap: 8px;
            background: white;
            flex: 0 1 auto;
            min-width: 100px;
            page-break-inside: avoid !important;
          }
          
          .option-item.correct { 
            background: #d4fc79; 
            border-color: #10b981;
            border-width: 2px;
            font-weight: bold;
          }
          
          .option-marker { 
            background: #667eea; 
            color: white; 
            width: 24px; 
            height: 24px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 12px; 
            font-weight: bold;
            flex-shrink: 0;
          }
          
          .option-item.correct .option-marker { 
            background: #10b981;
          }

          .attachment-box { 
            background: #fff8e1; 
            border: 2px solid #ffa726; 
            padding: 12px; 
            margin-top: 12px; 
            margin-bottom: 15px;
            border-radius: 6px; 
            font-size: 13px; 
            color: #333;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          .attachment-label { 
            font-weight: bold; 
            color: #f57c00; 
            margin-bottom: 5px;
          }

          /* Footer */
          .page-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            padding: 18px 12px;
            font-size: 13px;
            color: white;
            background: linear-gradient(135deg, #00acc1, #00838f);
            border-top: 3px solid #007c8a;
            z-index: 1000;
            line-height: 1.6;
            min-height: 70px;
          }
          
          .page-footer::before {
            content: "للاستفسار 772772732";
            display: block;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 4px;
          }
          
          .page-footer::after {
            content: "جميع الحقوق محفوظة السندس للتجهيزات التعليمية - نهتم من أجلكم";
            display: block;
            font-weight: 600;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <!-- Watermark Container -->
        <div class="watermark-container">
          <div class="watermark">تطبيق الوسيلة الذكية<br/>للاستفسار 772772732<br/>نهتم من اجلكم</div>
          <div class="watermark">تطبيق الوسيلة الذكية<br/>للاستفسار 772772732<br/>نهتم من اجلكم</div>
          <div class="watermark">تطبيق الوسيلة الذكية<br/>للاستفسار 772772732<br/>نهتم من اجلكم</div>
          <div class="watermark">تطبيق الوسيلة الذكية<br/>للاستفسار 772772732<br/>نهتم من اجلكم</div>
          <div class="watermark">تطبيق الوسيلة الذكية<br/>للاستفسار 772772732<br/>نهتم من اجلكم</div>
          <div class="watermark">تطبيق الوسيلة الذكية<br/>للاستفسار 772772732<br/>نهتم من اجلكم</div>
          <div class="watermark">تطبيق الوسيلة الذكية<br/>للاستفسار 772772732<br/>نهتم من اجلكم</div>
          <div class="watermark">تطبيق الوسيلة الذكية<br/>للاستفسار 772772732<br/>نهتم من اجلكم</div>
          <div class="watermark">تطبيق الوسيلة الذكية<br/>للاستفسار 772772732<br/>نهتم من اجلكم</div>
          <div class="watermark">تطبيق الوسيلة الذكية<br/>للاستفسار 772772732<br/>نهتم من اجلكم</div>
        </div>
        
        <!-- Page Container with Colored Border -->
        <div class="page-container">
          <!-- Page Footer -->
          <div class="page-footer"></div>
          
          <!-- Action Buttons (hidden - automatic print) -->
          <div style="display: none;">
            <button onclick="window.print()" style="background: linear-gradient(135deg, #00acc1, #00838f); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 8px rgba(0,172,193,0.3); display: flex; align-items: center; gap: 8px; font-family: Arial, sans-serif;">
              <span style="font-size: 20px;">🖨️</span>
              <span>طباعة / حفظ PDF</span>
            </button>
            <button onclick="downloadPDF()" id="downloadBtn" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 8px rgba(16,185,129,0.3); display: flex; align-items: center; gap: 8px; font-family: Arial, sans-serif;">
              <span style="font-size: 20px;">⬇️</span>
              <span>تنزيل PDF</span>
            </button>
          </div>
          
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
          <script>
            function downloadPDF() {
              const btn = document.getElementById('downloadBtn');
              if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '<span style="font-size: 20px;">⏳</span><span>جاري التنزيل...</span>';
                btn.disabled = true;
              }
              
              const element = document.querySelector('.page-container');
              const opt = {
                margin: 0,
                filename: '${mainTitle.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_${new Date().getTime()}.pdf',
                image: { type: 'jpeg', quality: 0.6 },
                html2canvas: { scale: 1.5, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
              };
              
              html2pdf().set(opt).from(element).save().then(() => {
                if (btn) {
                  btn.innerHTML = originalText;
                  btn.disabled = false;
                }
                console.log('✅ تم حفظ الملف بنجاح!');
              }).catch((err) => {
                console.error('PDF download error:', err);
                alert('حدث خطأ أثناء تنزيل الملف. يرجى المحاولة مرة أخرى.');
                if (btn) {
                  btn.innerHTML = originalText;
                  btn.disabled = false;
                }
              });
            }
            
            // فتح نافذة الطباعة تلقائياً بعد تحميل المحتوى بالكامل
            window.addEventListener('load', function() {
              console.log('📄 بدء تحميل الصفحة...');
              
              // انتظار إضافي لضمان تحميل كل شيء
              setTimeout(function() {
                console.log('🚀 فتح نافذة الطباعة تلقائياً...');
                window.print();
              }, 3000);
            });
          </script>

          <!-- Page Header - Will repeat on every page -->
          <div class="page-header">
            <div class="header-content">
              <div class="header-info">
                <h1 class="header-title">تطبيق الوسيلة الذكية</h1>
                <p class="header-subtitle">سلسلة وسائل أجيالنا الذكية للمحتوى الدراسي</p>
                <p class="header-contacts">للتواصل: ${contactInfo}</p>
              </div>
              <div class="header-logo">
                <img src="https://miaoda-conversation-file.s3cdn.medo.dev/user-9wofituwhou8/conv-a8tauoehdn9c/20260315/file-a9l4g2jirr40.jpg" alt="Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
              </div>
            </div>
          </div>

          <div class="info-box">
            <table>
              <tr>
                <td class="label">الصف:</td>
                <td class="value"><span style="color: #dc2626; font-weight: bold;">${className || 'تصدير متعدد'}</span></td>
                <td class="label">المادة:</td>
                <td class="value"><span style="color: #dc2626; font-weight: bold;">${subjectName || 'تصدير متعدد'}</span></td>
              </tr>
              <tr>
                <td class="label">نوع التصدير:</td>
                <td class="value" colspan="3">${typesStr}</td>
              </tr>
            </table>
          </div>
          
          <div class="content-wrapper">
    `;

    lessons.forEach((lesson, lIdx) => {
      const questions = lesson.ai_questions || [];
      
      printHTML += `<div class="lesson-section">`;
      
      // Title logic
      if (options.titlesOnly || options.titlesAndPages || options.titlesPagesQuestions) {
        let titleText = lesson.title;
        if (options.titlesAndPages || options.titlesPagesQuestions) {
          if (lesson.page_number) titleText += ` (صفحة ${lesson.page_number})`;
        }
        printHTML += `<div class="lesson-title-bar">${titleText}</div>`;
      }

      // Lesson Images logic
      if (options.lessonImages && lesson.image_urls && lesson.image_urls.length > 0) {
        printHTML += `<div class="lesson-images">`;
        lesson.image_urls.forEach((imgUrl: string, imgIdx: number) => {
          printHTML += `
            <div class="lesson-image-wrapper">
              <img src="${imgUrl}" alt="صفحة ${imgIdx + 1}" class="lesson-image" loading="lazy" style="max-width: 400px; height: auto;" />
              <p class="image-caption">صفحة ${imgIdx + 1} من ${lesson.image_urls.length}</p>
            </div>
          `;
        });
        printHTML += `</div>`;
      }

      // Lesson Summary logic
      if (options.lessonSummary) {
        console.log('✅ Lesson Summary export option is ENABLED');
        console.log('📚 Lesson object:', JSON.stringify({
          id: lesson.id,
          title: lesson.title,
          ai_summary: lesson.ai_summary,
          summary: lesson.summary,
          has_ai_summary: !!lesson.ai_summary,
          has_summary: !!lesson.summary,
          ai_summary_length: lesson.ai_summary?.length || 0,
          summary_length: lesson.summary?.length || 0
        }, null, 2));
        
        const summaryText = lesson.ai_summary || lesson.summary || '';
        
        if (summaryText && summaryText.trim()) {
          console.log('✅ Summary found! Length:', summaryText.length);
          printHTML += `
            <div class="lesson-summary-box">
              <div class="summary-header">📝 ملخص الدرس</div>
              <div class="summary-content">${summaryText}</div>
            </div>
          `;
        } else {
          console.warn('❌ No summary found for lesson:', lesson.title);
          console.warn('❌ Both ai_summary and summary are empty or null');
          printHTML += `
            <div class="lesson-summary-box">
              <div class="summary-header">📝 ملخص الدرس</div>
              <div class="summary-content" style="color: #999; font-style: italic;">لا يوجد ملخص متاح لهذا الدرس. يرجى توليد الملخص أولاً من صفحة الدروس.</div>
            </div>
          `;
        }
      }

      // Questions logic
      const showQuestions = options.questionsOnlyNoAnswers || options.titlesPagesQuestions || options.questionsWithAnswers || options.questionsWithOptionsNoCorrect || options.numCorrectAndAttachments || options.numCorrectOnly || options.numAnswerSymbolOnly;
      
      if (showQuestions && questions.length > 0) {
        printHTML += `<div class="questions-section">`;
        questions.forEach((q: any, qIdx: number) => {
          printHTML += `<div class="question-item">`;
          
          // Question header
          if (!options.attachmentsOnly) {
            printHTML += `<div class="question-header"><span class="question-number">سؤال ${qIdx + 1}:</span> ${q.question}</div>`;
          }

          // Options logic
          const showOptions = options.titlesPagesQuestions || options.questionsWithAnswers || options.questionsWithOptionsNoCorrect;
          if (showOptions && q.options && q.options.length > 0) {
            printHTML += `<ul class="option-list">`;
            q.options.forEach((opt: string, optIdx: number) => {
              const isCorrect = optIdx === q.correct_option_index;
              const highlightCorrect = options.questionsWithAnswers;
              const itemClass = (isCorrect && highlightCorrect) ? 'option-item correct' : 'option-item';
              
              printHTML += `
                <li class="${itemClass}">
                  <span class="option-marker">${String.fromCharCode(65 + optIdx)}</span>
                  <span>${opt}</span>
                </li>
              `;
            });
            printHTML += `</ul>`;
          }

          // NumCorrectAndAttachments special mode
          if (options.numCorrectAndAttachments) {
            printHTML += `
              <div style="margin: 10px 0; font-weight: bold; color: #1e40af; border: 1px dashed #1e40af; padding: 10px; border-radius: 4px;">
                <span class="question-number">رقم السؤال: ${qIdx + 1}</span> | الإجابة الصحيحة: ${q.options[q.correct_option_index] || 'غير محدد'}
              </div>
            `;
          }

          // NumCorrectOnly special mode - رقم السؤال مع الإجابة الصحيحة فقط
          if (options.numCorrectOnly) {
            printHTML += `
              <div style="margin: 10px 0; font-weight: bold; color: #1e40af; border: 2px solid #1e40af; padding: 12px; border-radius: 6px; background: #dbeafe;">
                <span class="question-number">رقم السؤال: ${qIdx + 1}</span> | الإجابة الصحيحة: ${q.options[q.correct_option_index] || 'غير محدد'}
              </div>
            `;
          }

          // NumAnswerSymbolOnly special mode - رقم السؤال مع رمز الإجابة
          if (options.numAnswerSymbolOnly) {
            const answerSymbol = String.fromCharCode(65 + (q.correct_option_index || 0));
            printHTML += `
              <div style="margin: 10px 0; font-weight: bold; color: #dc2626; border: 2px solid #dc2626; padding: 12px; border-radius: 6px; background: #fef2f2;">
                <span class="question-number">رقم السؤال: ${qIdx + 1}</span> | رمز الإجابة: <span style="font-size: 18px; color: #dc2626;">${answerSymbol}</span>
              </div>
            `;
          }

          // Attachments logic
          if (options.numCorrectAndAttachments || options.attachmentsOnly) {
            if (q.explanation || q.method || q.source_reference) {
              printHTML += `<div class="attachment-box">`;
              if (q.explanation) {
                printHTML += `<div><span class="attachment-label">الشرح: </span>${q.explanation}</div>`;
              }
              if (q.method) {
                printHTML += `<div><span class="attachment-label">طريقة الحل: </span>${q.method}</div>`;
              }
              if (q.source_reference) {
                printHTML += `<div><span class="attachment-label">المصدر: </span>${q.source_reference}</div>`;
              }
              printHTML += `</div>`;
            }
          }

          printHTML += `</div>`;
        });
        printHTML += `</div>`;
      } else if (options.attachmentsOnly) {
          // Special case: only attachments for the lesson
          printHTML += `<div class="questions-section">`;
          questions.forEach((q: any, qIdx: number) => {
              if (q.explanation || q.method || q.source_reference) {
                printHTML += `<div class="question-item">`;
                printHTML += `<div class="question-header">مرفقات سؤال ${qIdx + 1}</div>`;
                printHTML += `<div class="attachment-box">`;
                if (q.explanation) printHTML += `<div><span class="attachment-label">الشرح: </span>${q.explanation}</div>`;
                if (q.method) printHTML += `<div><span class="attachment-label">طريقة الحل: </span>${q.method}</div>`;
                if (q.source_reference) printHTML += `<div><span class="attachment-label">المصدر: </span>${q.source_reference}</div>`;
                printHTML += `</div></div>`;
              }
          });
          printHTML += `</div>`;
      }

      printHTML += `</div>`;
    });

    printHTML += `
          </div>
        </div>
      </body>
      </html>
    `;
    
    console.log('HTML generation completed. Length:', printHTML.length);
    onProgress?.(80, 'جاري كتابة المحتوى...');
    
    console.log('Writing HTML to print window...');
    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    console.log('Waiting before print...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Focusing and printing...');
    printWindow.focus();
    printWindow.print();
    
    console.log('Print dialog opened successfully');
    onProgress?.(100, 'اكتملت العملية! اختر "حفظ كـ PDF" من خيارات الطباعة');
    return true;
  } catch (error: any) {
    console.error('Export error:', error);
    throw error;
  }
};

