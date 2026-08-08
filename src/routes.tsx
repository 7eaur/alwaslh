import React, { lazy } from 'react';

// Pages
const StudentCodeLogin = lazy(() => import('@/pages/StudentCodeLogin'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));

// Admin Pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminClasses = lazy(() => import('@/pages/admin/Classes'));
const AdminLessons = lazy(() => import('@/pages/admin/Lessons'));
const AdminAccessCodes = lazy(() => import('@/pages/admin/AccessCodesManagement'));
const AdminQuizzes = lazy(() => import('@/pages/admin/Quizzes'));
const AdminNotifications = lazy(() => import('@/pages/admin/Notifications'));
const AdminClassCodes = lazy(() => import('@/pages/admin/ClassCodesManagement'));
const AdminAccountsManagement = lazy(() => import('@/pages/admin/AccountsManagement'));

// Student Pages
const StudentDashboard = lazy(() => import('@/pages/student/Dashboard'));
const StudentLessons = lazy(() => import('@/pages/student/Lessons'));
const StudentLessonDetail = lazy(() => import('@/pages/student/LessonDetail'));
const StudentQuizzes = lazy(() => import('@/pages/student/Quizzes'));
const StudentNotes = lazy(() => import('@/pages/student/Notes'));
const StudentNotifications = lazy(() => import('@/pages/student/Notifications'));
const StudentStatistics = lazy(() => import('@/pages/student/Statistics'));
const ActivateNewCode = lazy(() => import('@/pages/student/ActivateNewCode'));

export interface MyRouteConfig {
  path: string;
  element: React.ReactNode;
  allowedRoles?: ('admin' | 'student')[];
}

export const routes: MyRouteConfig[] = [
  // Public
  { path: '/', element: <StudentCodeLogin /> },
  { path: '/student-login', element: <StudentCodeLogin /> },
  { path: '/admin-login', element: <AdminLogin /> },

  // Admin (Role-guarded in App.tsx)
  { path: '/admin/dashboard', element: <AdminDashboard />, allowedRoles: ['admin'] },
  { path: '/admin/classes', element: <AdminClasses />, allowedRoles: ['admin'] },
  { path: '/admin/lessons', element: <AdminLessons />, allowedRoles: ['admin'] },
  { path: '/admin/quizzes', element: <AdminQuizzes />, allowedRoles: ['admin'] },
  { path: '/admin/codes', element: <AdminAccessCodes />, allowedRoles: ['admin'] },
  { path: '/admin/notifications', element: <AdminNotifications />, allowedRoles: ['admin'] },
  { path: '/admin/class-codes', element: <AdminClassCodes />, allowedRoles: ['admin'] },
  { path: '/admin/accounts', element: <AdminAccountsManagement />, allowedRoles: ['admin'] },

  // Student (AccessContext-guarded)
  { path: '/student/dashboard', element: <StudentDashboard />, allowedRoles: ['student'] },
  { path: '/student/lessons', element: <StudentLessons />, allowedRoles: ['student'] },
  { path: '/student/lessons/:id', element: <StudentLessonDetail />, allowedRoles: ['student'] },
  { path: '/student/quizzes', element: <StudentQuizzes />, allowedRoles: ['student'] },
  { path: '/student/notes', element: <StudentNotes />, allowedRoles: ['student'] },
  { path: '/student/notifications', element: <StudentNotifications />, allowedRoles: ['student'] },
  { path: '/student/statistics', element: <StudentStatistics />, allowedRoles: ['student'] },
  { path: '/student/activate', element: <ActivateNewCode />, allowedRoles: ['student'] },
];
