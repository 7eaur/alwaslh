/**
 * Hook للتحكم في الوصول للمحتوى
 * يتحقق من صلاحيات الطالب عبر AccessContext (localStorage)
 */

import { useAccess } from '@/context/AccessContext';
import { supabase } from '@/db/supabase';

export interface AccessControl {
  hasFullAccess: boolean;
  activatedClassIds: string[];
  canAccessSubject: (subjectClassId: string) => boolean;
  canAccessContent: (subjectClassId: string) => boolean;
}

export function useAccessControl(): AccessControl {
  const { hasFullAccess, activatedClassIds } = useAccess();

  /**
   * التحقق من إمكانية الوصول لمادة بناءً على class_id الخاص بها
   */
  const canAccessSubject = (subjectClassId: string): boolean => {
    if (hasFullAccess) return true;
    return activatedClassIds.includes(subjectClassId);
  };

  /**
   * التحقق من إمكانية الوصول للمحتوى (درس أو اختبار)
   */
  const canAccessContent = (subjectClassId: string): boolean => {
    if (hasFullAccess) return true;
    return activatedClassIds.includes(subjectClassId);
  };

  return {
    hasFullAccess,
    activatedClassIds,
    canAccessSubject,
    canAccessContent,
  };
}

