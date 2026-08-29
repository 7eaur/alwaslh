import { z } from "zod";
import {
  CLASS_ACCESS_CODE_LENGTH,
  FULL_ACCESS_CODE_LENGTH,
} from "../../domain/src/access";

const arabicIndicDigits = /[٠-٩]/g;
const easternArabicIndicDigits = /[۰-۹]/g;

const digitMap: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

export function normalizeDigits(value: string): string {
  return value
    .trim()
    .replace(arabicIndicDigits, (digit) => digitMap[digit] ?? digit)
    .replace(easternArabicIndicDigits, (digit) => digitMap[digit] ?? digit);
}

export const fullAccessCodeSchema = z.preprocess(
  (value) => typeof value === "string" ? normalizeDigits(value) : value,
  z.string().regex(/^\d{6}$/, `رمز الوصول الكامل يجب أن يتكون من ${FULL_ACCESS_CODE_LENGTH} أرقام`),
);

export const classAccessCodeSchema = z.preprocess(
  (value) => typeof value === "string" ? normalizeDigits(value) : value,
  z.string().regex(/^\d{7}$/, `رمز الصف يجب أن يتكون من ${CLASS_ACCESS_CODE_LENGTH} أرقام`),
);

export type FullAccessCode = z.infer<typeof fullAccessCodeSchema>;
export type ClassAccessCode = z.infer<typeof classAccessCodeSchema>;
