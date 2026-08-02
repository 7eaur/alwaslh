export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}


export type UserRole = 'admin' | 'student';

// معلومات تفعيل مادة واحدة
export interface SubjectActivation {
  subject_id: string;
  code: string;
  activated_at: string;
  expires_at: string;
}

export interface Profile {
  id: string;
  username: string;
  role: UserRole;
  device_id?: string;
  created_at: string;
  activated_subjects?: SubjectActivation[]; // تغيير من string[] إلى SubjectActivation[]
  full_access_code?: string; // كود 6 خانات (إن وجد)
  last_login_at?: string; // تاريخ آخر دخول
  install_prompt_shown?: boolean; // هل تم عرض رسالة التثبيت
  tutorial_shown?: boolean; // هل تم عرض التعليمات
}

export interface Class {
  id: string;
  name: string;
  created_at: string;
  deleted_at?: string | null;
}

export interface SubjectExtraClass {
  id: string;
  subject_id: string;
  class_id: string;
  created_at: string;
  classes?: { id: string; name: string };
}

export interface Subject {
  id: string;
  class_id: string;
  name: string;
  created_at: string;
  deleted_at?: string | null;
  extra_classes?: SubjectExtraClass[];
}

export interface Lesson {
  id: string;
  subject_id: string;
  title: string;
  image_urls: string[];
  ai_thumbnails?: string[];
  summary: string | null;
  extracted_text?: string | null;
  audio_url?: string | null;
  ai_questions: QuizQuestion[];
  page_number: number | null;
  created_at: string;
  deleted_at?: string | null;
  subjects?: { 
    name: string; 
    class_id: string;
    classes?: {
      name: string;
    };
  };
}

export interface DetectedPage {
  imageUrl: string;
  aiUrl?: string; // Small version for AI analysis
  title: string;
  page_number: number | null;
  content_preview: string;
  id?: string;
}

export interface SmartLesson {
  title: string;
  pages: DetectedPage[];
  summary?: string;
  questions?: QuizQuestion[];
  isGenerating?: boolean;
}

export interface QuizQuestion {
  id?: string; // إضافة id للتخزين المحلي
  question: string;
  options: string[];
  correct_option_index: number;
  source_reference?: string;
  type?: 'mcq' | 'true_false';
  difficulty?: 'easy' | 'medium' | 'hard';
  explanation?: string; // الشرح والتوضيحات
  solution_method?: string; // طريقة الحل
  method?: string;
  lesson_id?: string; // معرف الدرس الذي استخرج منه السؤال
  quiz_id?: string; // معرف الاختبار
  lesson_page_url?: string; // رابط صورة الدرس
  serial_number?: string; // رقم السؤال التسلسلي (6+ أرقام)
  page_number?: number; // رقم الصفحة الداخلي
}

export interface AccessCode {
  id: string;
  code: string;
  is_used: boolean;
  device_id: string | null;
  activated_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface StudentNote {
  id: string;
  student_id: string;
  lesson_id: string;
  lesson_title?: string;
  content?: string;
  type: 'text' | 'image' | 'audio' | 'capture' | 'voice_record';
  media_url?: string;
  description?: string;
  created_at: string;
}

export interface StudentAchievement {
  id: string;
  student_id: string;
  quiz_id?: string;
  achievement_type: 'excellence' | 'distinction';
  badge_icon?: string;
  points: number;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject_id: string;
  lesson_ids: string[];
  questions: QuizQuestion[];
  versions?: QuizVersion[];
  created_at: string;
  deleted_at?: string | null;
  subjects?: { name: string; class_id: string };
}

export interface QuizVersion {
  name: string;
  questions: QuizQuestion[];
  lesson_ids?: string[];
  lesson_id?: string; // معرف الدرس الواحد (للاستخراج من صورة درس واحد)
  lesson_image_url?: string; // صورة الدرس الخاصة بهذا النموذج
  question_count?: number;
  generated?: boolean; // علامة لتتبع ما إذا تم التوليد
}

export interface QuizAttempt {
  id: string;
  student_id: string;
  lesson_id?: string;
  quiz_id?: string;
  score: number;
  total_questions: number;
  questions?: any[];
  user_answers?: number[];
  version_name?: string;
  created_at: string;
}

export interface QuizProgress {
  id: string;
  student_id: string;
  lesson_id?: string;
  quiz_id?: string;
  current_index: number;
  user_answers: number[];
  shuffled_questions?: QuizQuestion[];
  is_completed: boolean;
  score: number;
  total_questions: number;
  updated_at: string;
  created_at: string;
}

// ===== أنواع نظام أكواد تفعيل المواد =====

// كود تفعيل مادة (7 خانات)
export interface SubjectActivationCode {
  id: string;
  code: string;
  used: boolean;
  created_at: string;
}

// كود مادة مفعل في localStorage
export interface ActivatedSubjectCode {
  code: string;
  subjectId: string;
  subjectName: string;
  activatedAt: string;
  expiresAt: string;
}

// تخزين الأكواد في localStorage
export interface ActivationCodesStorage {
  fullCode?: string;  // كود 6 خانات (تفعيل كامل)
  subjectCodes: ActivatedSubjectCode[];  // أكواد 7 خانات (تفعيل مواد)
}

// حالة التفعيل
export interface ActivationStatus {
  hasFullAccess: boolean;  // هل لديه كود 6 خانات
  activatedSubjects: string[];  // IDs المواد المفعلة
  isTrialMode: boolean;  // هل في وضع التجربة
}


