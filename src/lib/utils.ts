import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Params = Partial<
  Record<keyof URLSearchParams, string | number | null | undefined>
>;

export function createQueryString(
  params: Params,
  searchParams: URLSearchParams
) {
  const newSearchParams = new URLSearchParams(searchParams?.toString());

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, String(value));
    }
  }

  return newSearchParams.toString();
}

export function formatDate(
  date: Date | string | number,
  opts: Intl.DateTimeFormatOptions = {}
) {
  return new Intl.DateTimeFormat("ar-SA", {
    month: opts.month ?? "long",
    day: opts.day ?? "numeric",
    year: opts.year ?? "numeric",
    ...opts,
  }).format(new Date(date));
}

export function shuffleOptions(options: string[], correctIdx: number) {
  const correctOption = options[correctIdx];
  // More robust shuffle
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const newCorrectIdx = shuffled.indexOf(correctOption);
  return { options: shuffled, correct_option_index: newCorrectIdx };
}

/**
 * تحويل الأرقام العربية إلى إنجليزية
 * مثال: "٤١" → "41"
 */
export function convertArabicToEnglishNumbers(text: string | number | null | undefined): string | null {
  if (text === null || text === undefined) return null;
  
  const str = String(text);
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = str;
  for (let i = 0; i < arabicNumbers.length; i++) {
    result = result.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
  }
  
  return result;
}

/**
 * تحويل الرموز العلمية والرياضية الإنجليزية إلى عربية
 * يُستخدم في الشرح (explanation) والحل (method) للأسئلة المولدة
 */
export function localizeScientificText(text: string | null | undefined): string {
  if (!text) return '';
  let result = text;

  // الدوال المثلثية (مع قوس)
  result = result.replace(/\bsin\(/g, 'جا(');
  result = result.replace(/\bcos\(/g, 'جتا(');
  result = result.replace(/\btan\(/g, 'ظا(');

  // المتغيرات الفيزيائية المشهورة — مع حدود لتجنب استبدال كلمات عادية
  result = result.replace(/\bR\s*=/g, 'ن =');       // نصف القطر
  result = result.replace(/\bV₀\b/g, 'ف₀');           // السرعة الابتدائية
  result = result.replace(/\bV0\b/g, 'ف₀');
  result = result.replace(/\bV\s*=/g, 'ف =');        // السرعة
  result = result.replace(/\bg\s*=/g, 'ع =');        // التسارع
  result = result.replace(/\be\s*=/g, 'هـ =');       // الشحنة
  result = result.replace(/\bL\s*=/g, 'ل =');        // الحث
  result = result.replace(/\bI\s*=/g, 'ت =');        // التيار

  // رموز التفاضل والتغير
  result = result.replace(/ΔI\/Δt/g, 'Δت/Δز');
  result = result.replace(/dI\/dt/g, 'دت/دز');
  result = result.replace(/d\//g, 'د/');

  // الرموز الرياضية
  result = result.replace(/\*/g, ' × ');
  result = result.replace(/\//g, ' ÷ ');
  result = result.replace(/\^2/g, '²');
  result = result.replace(/\^3/g, '³');

  // الفاصلة العشرية: دائماً نستخدم الفاصلة العربية ولا نقلب ترتيب الأرقام
  // نحول أي رقم عشري مكتوب بالنقطة إلى فاصلة عربية
  result = result.replace(/(\d+)\.(\d+)/g, '$1,$2');

  return result;
}

/**
 * تحويل رقم الصفحة من أي صيغة إلى integer
 * مثال: "٤١" → 41, "41" → 41, "صفحة ٤١" → 41
 */
export function parsePageNumber(pageNumber: string | number | null | undefined): number | null {
  if (pageNumber === null || pageNumber === undefined) return null;
  
  // تحويل إلى string
  let str = String(pageNumber);
  
  // تحويل الأرقام العربية إلى إنجليزية
  str = convertArabicToEnglishNumbers(str) || '';
  
  // استخراج الأرقام فقط
  const numbers = str.match(/\d+/);
  if (!numbers) return null;
  
  const parsed = parseInt(numbers[0], 10);
  return isNaN(parsed) ? null : parsed;
}
