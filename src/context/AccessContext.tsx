/**
 * AccessContext - نظام الوصول المستند إلى حساب الطالب في السيرفر
 * - الكود 6 خانات يستخدم مرة واحدة لتنشيط الحساب.
 * - بعدها يدخل الطالب بكلمة المرور من أي جهاز/متصفح.
 * - يحتفظ بالوصول بدون إنترنت باستخدام الجلسة المحلية والتخزين المحلي.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/db/supabase';
import { useAuth } from './AuthContext';
import { getActivationDeviceId, getDeviceFingerprint, getLegacyDeviceFingerprint, getDeviceSignature, getLegacyDeviceSignatures } from '@/lib/device';
import { db, saveAccessBackup, getAccessBackup, clearAccessBackup } from '@/lib/offline-db';
import { encryptAccessData, decryptAccessData } from '@/lib/access-crypto-v2';

export interface ActivatedClass {
  code: string;
  classId: string;
  className: string;
  activatedAt: string;
  expiresAt: string;
}

export interface AccessStorage {
  accessType: 'full' | 'subjects' | null;
  fullAccessCode?: string;
  activatedClasses: ActivatedClass[];
  lastVerified?: string;
  verificationFailures?: number;
  fingerprint?: string;
}

export type AccessFlowState =
  | 'loading'
  | 'needs_activation'
  | 'needs_password_creation'
  | 'needs_password'
  | 'activated';

export interface AccessContextType {
  isStudent: boolean;
  hasFullAccess: boolean;
  activatedClasses: ActivatedClass[];
  activatedClassIds: string[];
  loading: boolean;
  flowState: AccessFlowState;
  pendingCode: string | null;
  setPendingCode: (code: string | null) => void;
  enterWithCode: (code: string) => Promise<void>;
  setRecoveryPassword: (password: string) => Promise<void>;
  verifyRecoveryPassword: (password: string) => Promise<void>;
  getRecoveryPassword: () => Promise<string | null>;
  addClassCode: (code: string) => Promise<ActivatedClass>;
  logout: () => void;
  resetActivation: () => void;
}

const STORAGE_KEY = 'student_access_v2';
const ACTIVE_ACCESS_CODE_KEY = 'active_access_code';

const AccessContext = createContext<AccessContextType | undefined>(undefined);

async function invokeFunction<T>(name: string, body: Record<string, unknown>, timeoutMs = 30000): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const { data, error } = await supabase.functions.invoke<T>(name, {
      body,
      method: 'POST',
      signal: controller.signal,
    });
    if (error) {
      const errorMsg = await error?.context?.text?.().catch(() => error.message);
      throw new Error(errorMsg || error.message || 'خطأ في الاتصال بالسيرفر');
    }
    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`${label}: استغرق الاتصال وقتاً طويلاً`)), ms);
    }),
  ]);
}

async function migrateStudentData(code: string, userId: string) {
  try {
    await supabase.functions.invoke('migrate-student-data', {
      body: { code, user_id: userId },
      method: 'POST',
    });
  } catch (err: any) {
    console.warn('[Access] فشل ربط البيانات القديمة:', err?.message);
  }
}

async function migrateOfflineIdentifier(oldId: string, newId: string) {
  try {
    await db.notes.where('student_code').equals(oldId).modify(n => { n.student_code = newId; });
    await db.savedQuestions.where('student_code').equals(oldId).modify(q => { q.student_code = newId; });
    await db.quizAttempts.where('student_code').equals(oldId).modify(a => { a.student_code = newId; });
    await db.progress.where('student_code').equals(oldId).modify(p => { p.student_code = newId; });
  } catch (err) {
    console.warn('[Access] فشل ترحيل التخزين المحلي:', err);
  }
}

async function verifyAndActivateClassCode(
  code: string,
  currentClasses: ActivatedClass[],
  userId?: string
): Promise<{ newClass: ActivatedClass; updatedClasses: ActivatedClass[] }> {
  const { data: codeData, error } = await supabase
    .from('class_activation_codes')
    .select('*, classes(id, name)')
    .eq('code', code)
    .maybeSingle();

  if (error || !codeData) {
    throw new Error('الكود الذي أدخلته غير صحيح. الرجاء التأكد والمحاولة مرة أخرى');
  }

  const classInfo = (codeData as any).classes;
  if (!classInfo) throw new Error('لم يتم العثور على الصف المرتبط بهذا الكود');

  const classId: string = classInfo.id;
  const className: string = classInfo.name;

  if (currentClasses.some(c => c.classId === classId)) {
    throw new Error(`الصف "${className}" مفعّل بالفعل`);
  }

  const studentId = userId || getActivationDeviceId();
  const existing = await supabase
    .from('student_class_activations')
    .select('id')
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .maybeSingle();

  if (!existing.data) {
    const expiresAt = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();
    await supabase.from('student_class_activations').insert({
      student_id: studentId,
      class_id: classId,
      activated_at: new Date().toISOString(),
      expires_at: expiresAt,
    });
  }

  await supabase
    .from('class_activation_codes')
    .update({
      is_used: true,
      device_id: getActivationDeviceId(),
      activated_at: new Date().toISOString(),
      expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    })
    .eq('id', codeData.id);

  const newClass: ActivatedClass = {
    code,
    classId,
    className,
    activatedAt: new Date().toISOString(),
    expiresAt: codeData.expires_at ?? new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
  };

  return { newClass, updatedClasses: [...currentClasses, newClass] };
}

export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const [accessData, setAccessData] = useState<AccessStorage>({ accessType: null, activatedClasses: [] });
  const [loading, setLoading] = useState(true);
  const [flowState, setFlowState] = useState<AccessFlowState>('loading');
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const accessDataRef = useRef<AccessStorage>(accessData);
  useEffect(() => { accessDataRef.current = accessData; }, [accessData]);

  const fingerprint = getActivationDeviceId();
  const strongFingerprint = getDeviceFingerprint();
  const legacyFingerprint = getLegacyDeviceFingerprint();
  const deviceSignature = getDeviceSignature();
  const legacyDeviceSignatures = getLegacyDeviceSignatures();

  const persistAccessCode = useCallback((code: string | null) => {
    try {
      if (code) localStorage.setItem(ACTIVE_ACCESS_CODE_KEY, code);
      else localStorage.removeItem(ACTIVE_ACCESS_CODE_KEY);
    } catch { /* تجاهل */ }
  }, []);

  const saveToStorage = useCallback((data: AccessStorage) => {
    const dataWithFingerprint: AccessStorage = {
      ...data,
      fingerprint,
      lastVerified: new Date().toISOString(),
      verificationFailures: 0,
    };
    const encrypted = encryptAccessData(JSON.stringify(dataWithFingerprint), fingerprint);
    if (encrypted) localStorage.setItem(STORAGE_KEY, encrypted);
    if (dataWithFingerprint.fullAccessCode) persistAccessCode(dataWithFingerprint.fullAccessCode);
    setAccessData(dataWithFingerprint);
    saveAccessBackup(dataWithFingerprint).catch(() => {});
    db.syncStatus.delete('initial').catch(() => {});
  }, [fingerprint, persistAccessCode]);

  const logout = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    persistAccessCode(null);
    await clearAccessBackup().catch(() => {});
    await auth.logout();
    setAccessData({ accessType: null, activatedClasses: [] });
    setPendingCode(null);
    setFlowState('needs_activation');
  }, [auth, persistAccessCode]);

  const resetActivation = useCallback(() => {
    setPendingCode(null);
    setFlowState('needs_activation');
  }, []);

  // التحقق من حالة الحساب في السيرفر (إعادة تعيين الكود من المدير)
  const checkAccountState = useCallback(async (userId?: string, code?: string): Promise<boolean> => {
    if (!navigator.onLine) return true;
    try {
      const res = await invokeFunction<{ valid: boolean; reason?: string; code?: string }>('check-account-state', {
        user_id: userId,
        code,
      });
      if (!res.valid) {
        console.warn('[Access] حالة الحساب غير صالحة:', res.reason);
        await logout();
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[Access] فشل التحقق من حالة الحساب:', err?.message);
      return true; // لا نطرد المستخدم عند فشل الاتصال
    }
  }, [logout]);

  // اكتشاف الكود المرتبط بالجهاز (بدون كلمة مرور) لعرض شاشة إدخال كلمة المرور مباشرة
  const detectCodeByDevice = useCallback(async (): Promise<{ code: string; has_recovery_password?: boolean } | null> => {
    if (!navigator.onLine) return null;
    try {
      const res = await invokeFunction<{ success: boolean; code?: string; has_recovery_password?: boolean; error?: string }>('get-code-by-device', {
        fingerprint,
        legacyFingerprints: [strongFingerprint, legacyFingerprint],
        deviceSignature,
        legacyDeviceSignatures,
      });
      if (!res.success || !res.code) return null;
      return { code: res.code, has_recovery_password: res.has_recovery_password };
    } catch (err: any) {
      console.warn('[Access] فشل اكتشاف الكود تلقائياً:', err?.message);
      return null;
    }
  }, [deviceSignature, fingerprint, legacyDeviceSignatures, legacyFingerprint, strongFingerprint]);

  // الترحيل التلقائي للطلاب القدامى (أول فتح بعد التحديث)
  const migrateLegacyAccess = useCallback(async (): Promise<boolean> => {
    if (!navigator.onLine) return false;

    try {
      // محاولة استرجاع كلمة المرور والكود من السيرفر باستخدام بصمة الجهاز
      const res = await invokeFunction<{ success: boolean; password?: string; code?: string; error?: string }>('get-recovery-password', {
        fingerprint,
        legacyFingerprints: [strongFingerprint, legacyFingerprint],
        deviceSignature,
        legacyDeviceSignatures,
      });
      if (!res.success || !res.password || !res.code) return false;

      const code = res.code;

      // إنشاء حساب الطالب من السيرفر باستخدام الكود وكلمة المرور القديمة
      const activateRes = await invokeFunction<{ success: boolean; user_id?: string; error?: string }>('activate-code', {
        code,
        password: res.password,
        fingerprint,
        legacyFingerprints: [strongFingerprint, legacyFingerprint],
        deviceSignature,
        legacyDeviceSignatures,
        is_migration: true,
      });
      if (!activateRes.success || !activateRes.user_id) return false;

      await auth.loginWithPassword(code, res.password);
      await migrateStudentData(code, activateRes.user_id);
      await migrateOfflineIdentifier(code, activateRes.user_id);
      persistAccessCode(code);
      saveToStorage({ accessType: 'full', fullAccessCode: code, activatedClasses: accessData.activatedClasses });
      return true;
    } catch (err: any) {
      console.warn('[Access] فشل الترحيل التلقائي:', err?.message);
      return false;
    }
  }, [accessData.activatedClasses, auth, deviceSignature, legacyDeviceSignatures, fingerprint, legacyFingerprint, persistAccessCode, saveToStorage, strongFingerprint]);

  // تحميل الحالة عند البداية
  useEffect(() => {
    const loadAccess = async () => {
      // إذا كان المستخدم مسجل دخوله بالفعل
      if (auth.isStudent && auth.user) {
        const restored = await loadStoredAccess();
        const data: AccessStorage = {
          ...restored,
          accessType: 'full',
          fullAccessCode: restored?.fullAccessCode || localStorage.getItem(ACTIVE_ACCESS_CODE_KEY) || undefined,
          activatedClasses: restored?.activatedClasses || [],
        };
        setAccessData(data);
        saveToStorage(data);
        setFlowState('activated');
        setLoading(false);
        return;
      }

      // محاولة استعادة الوصول من التخزين المحلي
      const restored = await loadStoredAccess();
      if (restored?.fullAccessCode) {
        const data: AccessStorage = { ...restored, accessType: 'full' };
        setAccessData(data);
        setFlowState('activated');
        setLoading(false);
        // إذا كان هناك نت، نحاول الترحيل التلقائي
        if (navigator.onLine) {
          const migrated = await migrateLegacyAccess();
          if (migrated) {
            setFlowState('activated');
          }
        }
        return;
      }

      // محاولة اكتشاف الكود المرتبط بالجهاز مع مهلة زمنية
      // ثم الترحيل التلقائي إذا لم يكن هناك كود مرتبط
      if (navigator.onLine) {
        try {
          const detected = await withTimeout(detectCodeByDevice(), 8000, 'detectCodeByDevice');
          if (detected?.code) {
            setPendingCode(detected.code);
            if (detected.has_recovery_password) {
              setFlowState('needs_password');
              setLoading(false);
              return;
            }
            // وجد كود لكن بدون كلمة مرور محفوظة: محاولة الترحيل التلقائي
            try {
              const migrated = await withTimeout(migrateLegacyAccess(), 12000, 'migrateLegacyAccess');
              if (migrated) {
                setFlowState('activated');
                setLoading(false);
                return;
              }
            } catch (migrateErr) {
              console.warn('[Access] انتهت مهلة الترحيل التلقائي:', migrateErr);
            }
          }
        } catch (detectErr) {
          console.warn('[Access] انتهت مهلة اكتشاف الكود:', detectErr);
        }

        // محاولة الترحيل التلقائي كحل أخير
        try {
          const migrated = await withTimeout(migrateLegacyAccess(), 12000, 'migrateLegacyAccess');
          if (migrated) {
            setFlowState('activated');
            setLoading(false);
            return;
          }
        } catch (migrateErr) {
          console.warn('[Access] انتهت مهلة الترحيل التلقائي:', migrateErr);
        }
      }

      setFlowState('needs_activation');
      setLoading(false);
    };

    loadAccess();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isStudent, auth.user]);

  async function loadStoredAccess(): Promise<AccessStorage | null> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        let decrypted = decryptAccessData(stored, fingerprint);
        if (!decrypted) {
          decrypted = decryptAccessData(stored, strongFingerprint) || decryptAccessData(stored, legacyFingerprint);
          if (decrypted) {
            const reEncrypted = encryptAccessData(decrypted, fingerprint);
            if (reEncrypted) localStorage.setItem(STORAGE_KEY, reEncrypted);
          }
        }
        if (decrypted) return JSON.parse(decrypted);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch { localStorage.removeItem(STORAGE_KEY); }

    try {
      const backup = await getAccessBackup();
      if (backup && backup.accessType) {
        const isKnown = !backup.fingerprint ||
          backup.fingerprint === fingerprint ||
          backup.fingerprint === strongFingerprint ||
          backup.fingerprint === legacyFingerprint;
        if (isKnown) return { ...backup, fingerprint };
        await clearAccessBackup();
      }
    } catch { /* تجاهل */ }

    return null;
  }

  const enterWithCode = useCallback(async (code: string) => {
    const trimmedCode = code.trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      throw new Error('الكود يجب أن يكون 6 أرقام');
    }

    if (!navigator.onLine) {
      throw new Error('يجب الاتصال بالإنترنت لتفعيل كود جديد');
    }

    // التحقق من الكود وتسجيل الجهاز في نفس الوقت (عبر Edge Function لتفادي مشاكل الشبكة)
    let lastErr: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const recordRes = await invokeFunction<{ success: boolean; is_used?: boolean; error?: string; has_recovery_password?: boolean }>('record-code-device', {
          code: trimmedCode,
          fingerprint,
          legacyFingerprints: [strongFingerprint, legacyFingerprint],
          deviceSignature,
          legacyDeviceSignatures,
        });
        if (!recordRes.success || recordRes.is_used === undefined) {
          throw new Error(recordRes.error || 'الكود غير صحيح');
        }
        setPendingCode(trimmedCode);
        if (recordRes.is_used) {
          setFlowState('needs_password');
        } else {
          setFlowState('needs_password_creation');
        }
        return;
      } catch (err: any) {
        lastErr = err;
        const isNetworkError = err?.message && (
          /fetch|network|connection|timeout|offline|Failed to fetch/i.test(err.message)
        );
        if (!isNetworkError || attempt === 3) break;
        // انتظار قصير قبل إعادة المحاولة عند ضعف الشبكة
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      }
    }

    const isNetworkError = lastErr?.message && (
      /fetch|network|connection|timeout|offline|Failed to fetch/i.test(lastErr.message)
    );
    console.warn('[Access] فشل التحقق من الكود:', lastErr?.message);
    if (isNetworkError) {
      throw new Error('الاتصال بالإنترنت ضعيف، يرجى المحاولة مرة أخرى');
    }
    throw new Error(lastErr?.message || 'الكود غير صحيح');
  }, [deviceSignature, legacyDeviceSignatures, fingerprint, legacyFingerprint, strongFingerprint]);

  const setRecoveryPassword = useCallback(async (password: string) => {
    if (!pendingCode) throw new Error('لا يوجد كود بانتظار تعيين كلمة المرور');
    if (!/^\d{4,}$/.test(password)) {
      throw new Error('كلمة المرور يجب أن تتكون من 4 أرقام على الأقل');
    }

    const res = await invokeFunction<{ success: boolean; user_id?: string; error?: string }>('activate-code', {
      code: pendingCode,
      password,
      fingerprint,
      legacyFingerprints: [strongFingerprint, legacyFingerprint],
      deviceSignature,
      legacyDeviceSignatures,
    });
    if (!res.success || !res.user_id) throw new Error(res.error || 'فشل تفعيل الكود');

    await auth.loginWithPassword(pendingCode, password);
    await migrateStudentData(pendingCode, res.user_id);
    await migrateOfflineIdentifier(pendingCode, res.user_id);
    persistAccessCode(pendingCode);
    saveToStorage({ accessType: 'full', fullAccessCode: pendingCode, activatedClasses: accessData.activatedClasses });
    setPendingCode(null);
    setFlowState('activated');
  }, [accessData.activatedClasses, auth, deviceSignature, legacyDeviceSignatures, fingerprint, legacyFingerprint, pendingCode, persistAccessCode, saveToStorage, strongFingerprint]);

  const verifyRecoveryPassword = useCallback(async (password: string) => {
    if (!pendingCode) throw new Error('لا يوجد كود');

    // التحقق من البصمة والكلمة قبل تسجيل الدخول (ربط الجهاز)
    const verifyRes = await invokeFunction<{ success: boolean; error?: string }>('verify-recovery-password', {
      code: pendingCode,
      password,
      fingerprint,
      legacyFingerprints: [strongFingerprint, legacyFingerprint],
      deviceSignature,
      legacyDeviceSignatures,
    });
    if (!verifyRes.success) {
      throw new Error(verifyRes.error || 'لا يمكن الدخول من هذا الجهاز');
    }

    try {
      await auth.loginWithPassword(pendingCode, password);
    } catch (loginErr: any) {
      // إذا فشل تسجيل الدخول، قد يكون الطالب قديماً ولم يُنشأ له حساب بعد
      // نحاول ترحيله تلقائياً باستخدام كلمة المرور المدخلة
      const migrationRes = await invokeFunction<{ success: boolean; user_id?: string; error?: string }>('activate-code', {
        code: pendingCode,
        password,
        fingerprint,
        legacyFingerprints: [strongFingerprint, legacyFingerprint],
        deviceSignature,
        is_migration: true,
      });
      if (!migrationRes.success || !migrationRes.user_id) {
        throw loginErr;
      }
      await auth.loginWithPassword(pendingCode, password);
    }

    if (auth.user?.id) {
      const valid = await checkAccountState(auth.user.id, pendingCode);
      if (!valid) throw new Error('تم إعادة تعيين الكود من قبل المدير');
      await migrateStudentData(pendingCode, auth.user.id);
      await migrateOfflineIdentifier(pendingCode, auth.user.id);
    }
    persistAccessCode(pendingCode);
    saveToStorage({ accessType: 'full', fullAccessCode: pendingCode, activatedClasses: accessData.activatedClasses });
    setPendingCode(null);
    setFlowState('activated');
  }, [accessData.activatedClasses, auth, checkAccountState, deviceSignature, legacyDeviceSignatures, fingerprint, legacyFingerprint, persistAccessCode, pendingCode, saveToStorage, strongFingerprint]);

  const getRecoveryPassword = useCallback(async (): Promise<string | null> => {
    try {
      const res = await invokeFunction<{ success: boolean; password?: string; error?: string }>('get-recovery-password', {
        fingerprint,
        legacyFingerprints: [strongFingerprint, legacyFingerprint],
        deviceSignature,
        legacyDeviceSignatures,
      });
      return res.success && res.password ? res.password : null;
    } catch {
      return null;
    }
  }, [deviceSignature, legacyDeviceSignatures, fingerprint, legacyFingerprint, strongFingerprint]);

  const addClassCode = useCallback(async (code: string): Promise<ActivatedClass> => {
    const trimmedCode = code.trim();
    if (!/^\d{7}$/.test(trimmedCode)) {
      throw new Error('كود الصف يجب أن يكون 7 أرقام');
    }
    const { newClass, updatedClasses } = await verifyAndActivateClassCode(
      trimmedCode,
      accessData.activatedClasses,
      auth.user?.id
    );
    saveToStorage({
      accessType: accessData.accessType === 'full' ? 'full' : 'subjects',
      fullAccessCode: accessData.fullAccessCode,
      activatedClasses: updatedClasses,
    });
    return newClass;
  }, [accessData, auth.user?.id, saveToStorage]);

  // فحص دوري لحالة الحساب عند فتح التطبيق ووجود إنترنت
  useEffect(() => {
    if (auth.loading || (!auth.isStudent && !accessDataRef.current.accessType)) return;

    const verify = async () => {
      if (document.visibilityState !== 'visible') return;
      const userId = auth.user?.id;
      const code = accessDataRef.current.fullAccessCode;
      if (!userId && !code) return;
      await checkAccountState(userId, code);
    };

    verify();
    const onVisible = () => verify();
    document.addEventListener('visibilitychange', onVisible);

    const interval = setInterval(verify, 600000); // كل 10 دقائق لتقليل استهلاك البطارية

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [auth.loading, auth.isStudent, auth.user?.id, checkAccountState]);

  const isStudent = auth.isStudent || accessData.accessType !== null;
  const hasFullAccess = accessData.accessType === 'full';
  const activatedClassIds = accessData.activatedClasses.map(c => c.classId);

  return (
    <AccessContext.Provider
      value={{
        isStudent,
        hasFullAccess,
        activatedClasses: accessData.activatedClasses,
        activatedClassIds,
        loading: loading || auth.loading,
        flowState,
        pendingCode,
        setPendingCode,
        enterWithCode,
        setRecoveryPassword,
        verifyRecoveryPassword,
        getRecoveryPassword,
        addClassCode,
        logout,
        resetActivation,
      }}
    >
      {children}
    </AccessContext.Provider>
  );
};

export const useAccess = () => {
  const ctx = useContext(AccessContext);
  if (!ctx) {
    return {
      isStudent: false,
      hasFullAccess: false,
      activatedClasses: [],
      activatedClassIds: [],
      loading: true,
      flowState: 'loading' as AccessFlowState,
      pendingCode: null,
      setPendingCode: () => {},
      enterWithCode: async () => {},
      setRecoveryPassword: async () => {},
      verifyRecoveryPassword: async () => {},
      getRecoveryPassword: async () => null,
      addClassCode: async () => ({} as ActivatedClass),
      logout: () => {},
      resetActivation: () => {},
    } as AccessContextType;
  }
  return ctx;
};
