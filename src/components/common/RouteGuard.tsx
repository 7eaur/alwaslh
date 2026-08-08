import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAccess } from '@/context/AccessContext';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'student')[];
}

const PUBLIC_ROUTES = ['/', '/student-login', '/admin-login'];

export const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
  const { user, profile, loading: authLoading, isAdmin } = useAuth();
  const { isStudent, loading: accessLoading } = useAccess();
  const location = useLocation();

  const loading = authLoading || accessLoading;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isPublic = PUBLIC_ROUTES.includes(location.pathname);

  // ===== صفحات الطلاب: حماية بـ AccessContext (localStorage) =====
  if (allowedRoles?.includes('student') && !allowedRoles?.includes('admin')) {
    if (!isStudent) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // ===== صفحات المدير: حماية بـ Supabase Auth =====
  if (allowedRoles?.includes('admin')) {
    if (!user || !profile) {
      return <Navigate to="/admin-login" replace />;
    }
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // ===== الصفحات العامة =====
  if (isPublic) {
    // إذا كان الطالب مسجلاً بالفعل → اذهب للـ dashboard
    if (isStudent && location.pathname === '/') {
      return <Navigate to="/student/dashboard" replace />;
    }
    // إذا كان المدير مسجلاً → اذهب للـ admin dashboard
    if (isAdmin && location.pathname === '/admin-login') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // أي مسار آخر بدون حماية محددة
  return <>{children}</>;
};
