import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/db/supabase';
import { Profile } from '@/types';

interface AuthContextType {
  user: any;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isGuest: boolean;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  loginWithCode: (code: string) => Promise<void>;
  loginWithSubjectCode: (code: string, subjectId: string) => Promise<void>;
  loginAdminWithCode: (code: string) => Promise<void>;
  loginAsGuest: () => void;
  registerAccount: (username: string, password: string) => Promise<void>;
  activateFullAccess: (code: string) => Promise<void>;
  activateClass: (code: string, classId: string) => Promise<void>;
  logout: () => Promise<void>;
  lastLogin: string | null;
  updateLastLogin: () => Promise<void>;
  updateProfileFlag: (flag: 'install_prompt_shown' | 'tutorial_shown', value: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  const clearCache = () => {
    localStorage.removeItem('cached_user');
    localStorage.removeItem('cached_profile');
    localStorage.removeItem('guest_mode');
    localStorage.removeItem('active_user_id');
    localStorage.removeItem('active_access_code');
    Object.keys(localStorage)
      .filter(k => k.startsWith('alwaseela_cache_'))
      .forEach(k => localStorage.removeItem(k));
  };

  const forceLogout = React.useCallback(async () => {
    setUser(null);
    setProfile(null);
    setIsGuest(false);
    clearCache();
    try { await supabase.auth.signOut(); } catch { /* تجاهل */ }
  }, []);

  const fetchProfile = async (uid: string) => {
    const cachedProfile = localStorage.getItem('cached_profile');
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        setProfile(parsed);
        setLastLogin(parsed.last_login_at || null);
      } catch { /* تجاهل */ }
    }

    if (navigator.onLine) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
        if (!error && data) {
          setProfile(data as Profile);
          setLastLogin(data.last_login_at || null);
          localStorage.setItem('cached_profile', JSON.stringify(data));
        }
      } catch (err) {
        console.warn('فشل جلب الملف الشخصي، يتم استخدام الكاش:', err);
      }
    }
    setLoading(false);
  };

  const updateLastLogin = async (uid?: string) => {
    const target = uid || user?.id;
    if (!target || !navigator.onLine) return;
    const now = new Date().toISOString();
    try {
      const { error } = await supabase.from('profiles').update({ last_login_at: now }).eq('id', target);
      if (!error) {
        setLastLogin(now);
        setProfile(prev => prev ? { ...prev, last_login_at: now } : null);
      }
    } catch (err) {
      console.warn('فشل تحديث آخر دخول:', err);
    }
  };

  const updateProfileFlag = async (flag: 'install_prompt_shown' | 'tutorial_shown', value: boolean) => {
    const uid = user?.id;
    if (!uid) return;
    const newProfile = profile ? { ...profile, [flag]: value } : { id: uid, [flag]: value };
    setProfile(newProfile as Profile);
    localStorage.setItem('cached_profile', JSON.stringify(newProfile));
    if (!navigator.onLine) return;
    try {
      const { error } = await supabase.from('profiles').update({ [flag]: value }).eq('id', uid);
      if (error) throw error;
    } catch (err) {
      console.warn(`فشل تحديث ${flag}:`, err);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const guestMode = localStorage.getItem('guest_mode');
      if (guestMode === 'true') {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      const cachedUser = localStorage.getItem('cached_user');
      const cachedProfile = localStorage.getItem('cached_profile');
      if (cachedUser && cachedProfile) {
        try {
          setUser(JSON.parse(cachedUser));
          setProfile(JSON.parse(cachedProfile));
        } catch { /* تجاهل */ }
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem('cached_user', JSON.stringify(session.user));
          localStorage.setItem('active_user_id', session.user.id);
          await fetchProfile(session.user.id);
          await updateLastLogin(session.user.id);
        } else {
          if (!cachedUser) setLoading(false);
        }
      } catch (err) {
        console.warn('فشل التحقق من الجلسة، يتم الاعتماد على الكاش:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem('cached_user', JSON.stringify(session.user));
        localStorage.setItem('active_user_id', session.user.id);
        fetchProfile(session.user.id);
        updateLastLogin(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('cached_user');
        localStorage.removeItem('active_user_id');
        setLoading(false);
      }
    });

    // مراقبة حذف الحساب من قبل المدير
    let profileSubscription: any = null;
    if (profile?.id) {
      profileSubscription = supabase
        .channel(`profile-watch-${profile.id}`)
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'profiles', filter: `id=eq.${profile.id}` },
          () => {
            console.warn('[Auth] الملف الشخصي محذوف من قبل المدير — خروج فوري');
            forceLogout();
          }
        )
        .subscribe();
    }

    return () => {
      subscription.unsubscribe();
      if (profileSubscription) profileSubscription.unsubscribe();
    };
  }, [profile?.id, forceLogout]);

  const loginWithPassword = async (username: string, password: string) => {
    const email = `${username}@miaoda.com`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      localStorage.setItem('cached_user', JSON.stringify(data.user));
      localStorage.setItem('active_user_id', data.user.id);
      await fetchProfile(data.user.id);
      await updateLastLogin(data.user.id);
    }
  };

  const loginWithCode = async (code: string) => {
    // للتوافق: يستخدم كلمة المرور نفس الكود (غير مستخدم في التدفق الجديد)
    const email = `${code}@miaoda.com`;
    const { error } = await supabase.auth.signInWithPassword({ email, password: code });
    if (error) throw error;
  };

  const loginWithSubjectCode = async (code: string, subjectId: string) => {
    console.warn('[Auth] loginWithSubjectCode غير مستخدم في التدفق الجديد', code, subjectId);
  };

  const loginAdminDirect = async (email: string, password: string): Promise<{ access_token: string; refresh_token: string; user?: any }> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) throw new Error("إعدادات Supabase مفقودة");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      if (!response.ok || !data || !data.access_token) {
        const msg = data?.message || data?.error_description || (response.status === 400 ? 'رمز دخول غير صحيح' : 'تعذر تسجيل الدخول');
        throw new Error(msg);
      }
      await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
      return { access_token: data.access_token, refresh_token: data.refresh_token, user: data.user };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === 'AbortError') throw new Error("انتهت مهلة الاتصال بالخادم. تأكد من جودة الإنترنت.");
      throw err;
    }
  };

  const loginAdminWithCode = async (code: string) => {
    const email = 'admin@miaoda.com';
    try {
      const tokens = await loginAdminDirect(email, code);
      const adminUser = tokens.user || {
        id: 'admin-local-session',
        email,
        role: 'admin',
        aud: 'authenticated'
      };
      setUser(adminUser);
      const adminProfile: Profile = { id: adminUser.id, username: 'admin', role: 'admin', created_at: new Date().toISOString() };
      setProfile(adminProfile);
      localStorage.setItem('cached_user', JSON.stringify(adminUser));
      localStorage.setItem('cached_profile', JSON.stringify(adminProfile));
      setIsGuest(false);
    } catch (directErr: any) {
      const msg = directErr?.message || '';
      if (msg.includes('رمز دخول غير صحيح') || msg.includes('Invalid')) {
        throw new Error("رمز دخول غير صحيح");
      }
      try {
        const signInPromise = supabase.auth.signInWithPassword({ email, password: code });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000));
        const result = await Promise.race([signInPromise, timeoutPromise]) as any;
        if (!result.error) return;
        if (result.error?.message?.includes("Invalid login credentials")) throw new Error("رمز دخول غير صحيح");
        throw result.error;
      } catch (err: any) {
        throw new Error(err?.message || "تعذر تسجيل الدخول. تأكد من الاتصال بالإنترنت.");
      }
    }
  };

  const loginAsGuest = () => {
    setIsGuest(true);
    setProfile(null);
    setUser(null);
    setLoading(false);
    localStorage.setItem('guest_mode', 'true');
  };

  const registerAccount = async (username: string, password: string) => {
    const email = `${username.toLowerCase()}_${Date.now()}@student.app`;
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error("فشل إنشاء الحساب");

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: authData.user.id, username, password, role: 'student', activated_subjects: [], full_access_code: null });
    if (profileError) throw profileError;

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    if (signInData.user) {
      setUser(signInData.user);
      localStorage.setItem('cached_user', JSON.stringify(signInData.user));
      localStorage.setItem('active_user_id', signInData.user.id);
      await fetchProfile(signInData.user.id);
      await updateLastLogin(signInData.user.id);
    }
  };

  const activateFullAccess = async (code: string) => {
    // لم يعد مستخدماً في التدفق الجديد
    console.warn('[Auth] activateFullAccess غير مستخدم', code);
  };

  const activateClass = async (code: string, classId: string) => {
    // لم يعد مستخدماً في التدفق الجديد
    console.warn('[Auth] activateClass غير مستخدم', code, classId);
  };

  const logout = async () => {
    clearCache();
    setUser(null);
    setProfile(null);
    setIsGuest(false);
    await supabase.auth.signOut();
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isStudent: profile?.role === 'student',
    isGuest,
    loginWithPassword,
    loginWithCode,
    loginWithSubjectCode,
    loginAdminWithCode,
    loginAsGuest,
    registerAccount,
    activateFullAccess,
    activateClass,
    logout,
    lastLogin,
    updateLastLogin,
    updateProfileFlag,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
