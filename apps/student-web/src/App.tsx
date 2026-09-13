import { useEffect, useState } from "react";
import {
  ApiRequestError,
  isMissingSessionError,
  logoutStudent,
  restoreStudentSession,
  type SessionProfile,
} from "./auth-api";
import { clearActiveOfflineLease, getActiveOfflineScope } from "./offline-session";
import { StudentAccessSection } from "./student-access";
import {
  StudentBrand,
  StudentEntryExperience,
  type StudentEntryMode,
  type StudentEntryNotice,
} from "./student-entry";

type SessionPhase = "checking" | "anonymous" | "authenticated" | "offline" | "unavailable";
const WELCOME_SEEN_KEY = "alwaslh-student:welcome-seen-v1";

function initialEntryMode(): StudentEntryMode {
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (!standalone) return "activation";
  try { return window.localStorage.getItem(WELCOME_SEEN_KEY) === "1" ? "activation" : "welcome"; }
  catch { return "welcome"; }
}

function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, []);
  return online;
}

function LoadingScreen() {
  return <main className="student-session-state" aria-busy="true"><StudentBrand /><div role="status" aria-live="polite"><span className="spinner" aria-hidden="true" /><h1>جاري فتح مساحة الطالب</h1><p>ثوانٍ قليلة ونكمل من حيث توقفت.</p></div></main>;
}

function ConnectionGate({ kind, onRetry }: { kind: "offline" | "unavailable"; onRetry: () => void }) {
  const offline = kind === "offline";
  return <main className="student-session-state"><StudentBrand /><section aria-labelledby="connection-title">
    <p className="eyebrow">{offline ? "لا يوجد اتصال" : "تعذر الاتصال"}</p>
    <h1 id="connection-title">{offline ? "اتصل بالإنترنت للمتابعة" : "الخدمة غير متاحة الآن"}</h1>
    <p>{offline ? "نحتاج اتصالًا للتحقق من حسابك عند فتح التطبيق. إذا سبق أن حفظت درسًا على هذا الجهاز فسيظهر لك تلقائيًا عندما يكون الوصول المحلي ما زال صالحًا." : "لم يتم تسجيل خروجك. انتظر قليلًا ثم أعد المحاولة."}</p>
    <button className="primary-button" type="button" onClick={onRetry} disabled={offline && !navigator.onLine}>إعادة المحاولة</button>
  </section></main>;
}

function offlineProfile(): SessionProfile | null {
  const scope = getActiveOfflineScope();
  if (!scope) return null;
  return { id: scope.profileId, role: "student", displayName: null };
}

export default function App() {
  const online = useOnlineStatus();
  const [phase, setPhase] = useState<SessionPhase>("checking");
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [mode, setMode] = useState<StudentEntryMode>(() => initialEntryMode());
  const [notice, setNotice] = useState<StudentEntryNotice | null>(null);

  async function checkSession() {
    if (!navigator.onLine) {
      const localProfile = offlineProfile();
      setProfile(localProfile);
      setPhase("offline");
      return;
    }
    setPhase("checking");
    try {
      const restored = await restoreStudentSession();
      if (restored.role !== "student") {
        await logoutStudent().catch(() => undefined);
        setProfile(null); setPhase("anonymous"); return;
      }
      setProfile(restored); setPhase("authenticated");
    } catch (error) {
      if (isMissingSessionError(error)) { setProfile(null); setPhase("anonymous"); }
      else if (error instanceof ApiRequestError && error.code === "SERVICE_UNAVAILABLE") {
        const localProfile = offlineProfile();
        if (localProfile) { setProfile(localProfile); setPhase("offline"); }
        else setPhase(navigator.onLine ? "unavailable" : "offline");
      }
      else setPhase("unavailable");
    }
  }

  useEffect(() => { void checkSession(); }, []);

  function handleSessionExpired() {
    void clearActiveOfflineLease().catch(() => undefined);
    setProfile(null);
    setNotice({ message: "انتهت جلستك. سجّل الدخول مرة أخرى للمتابعة.", tone: "info" });
    setMode("login");
    setPhase("anonymous");
  }

  async function handleLogout() {
    if (online) await logoutStudent().catch(() => undefined);
    await clearActiveOfflineLease().catch(() => undefined);
    setProfile(null); setNotice(null); setMode("login"); setPhase("anonymous");
  }

  if (phase === "checking") return <LoadingScreen />;
  if (phase === "offline" && profile) return <div className="app-frame"><StudentAccessSection profile={profile} online={false} onSessionExpired={handleSessionExpired} onLoggedOut={() => void handleLogout()} /></div>;
  if (phase === "offline") return <ConnectionGate kind="offline" onRetry={() => void checkSession()} />;
  if (phase === "unavailable") return <ConnectionGate kind="unavailable" onRetry={() => void checkSession()} />;

  if (phase === "authenticated" && profile) return <div className="app-frame"><StudentAccessSection profile={profile} online={online} onSessionExpired={handleSessionExpired} onLoggedOut={() => void handleLogout()} /></div>;

  return <div className="app-frame"><StudentEntryExperience
    online={online}
    mode={mode}
    notice={notice}
    onMode={(nextMode) => { setMode(nextMode); if (nextMode !== "login") setNotice(null); }}
    onAuthenticated={(nextProfile, accountIdentifier) => { setProfile(nextProfile); if (accountIdentifier) setNotice({ message: "تم تفعيل الحساب بنجاح.", tone: "success" }); setPhase("authenticated"); }}
  /></div>;
}
