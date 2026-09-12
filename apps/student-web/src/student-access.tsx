import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ApiRequestError,
  createAccessRedemptionIdempotencyKey,
  isMissingSessionError,
  isSevenDigitClassCode,
  listStudentEntitlements,
  normalizeAccessCode,
  redeemStudentAccess,
} from "./auth-api";
import type { EntitlementView } from "./auth-api";
import { StudentAssessmentSection } from "./student-assessment";
import { StudentLearningExperience } from "./student-learning";
import { StudentOfflineDownloadsSection } from "./student-offline-downloads";

type AccessState =
  | { status: "loading" }
  | { status: "ready"; entitlements: EntitlementView[] }
  | { status: "offline" }
  | { status: "error"; message: string };

type StudentDestination = "home" | "learn" | "practice" | "downloads" | "account";
type StudentDestinationIcon = "home" | "learn" | "practice" | "downloads" | "account";

interface StudentDestinationDefinition {
  key: Exclude<StudentDestination, "account">;
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: StudentDestinationIcon;
}

const learningDestinations: StudentDestinationDefinition[] = [
  {
    key: "home",
    href: "/app/home",
    label: "الرئيسية",
    shortLabel: "الرئيسية",
    description: "ابدأ من هنا وانتقل بسرعة إلى دروسك وتدريباتك وما حفظته على الجهاز.",
    icon: "home",
  },
  {
    key: "learn",
    href: "/app/learn",
    label: "التعلم",
    shortLabel: "التعلم",
    description: "اختر مادة، ثم انتقل إلى الدرس الذي تريد تعلمه.",
    icon: "learn",
  },
  {
    key: "practice",
    href: "/app/practice",
    label: "التدريب",
    shortLabel: "التدريب",
    description: "اختر تدريبًا أو اختبارًا متاحًا لك وابدأ عندما تكون جاهزًا.",
    icon: "practice",
  },
  {
    key: "downloads",
    href: "/app/downloads",
    label: "التنزيلات",
    shortLabel: "التنزيلات",
    description: "أدر الدروس التي حفظتها على هذا الجهاز للاستخدام عند انقطاع الشبكة.",
    icon: "downloads",
  },
];

function requestMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر إكمال الطلب. حاول مرة أخرى.";
}

function expiryLabel(expiresAt: string | null): string {
  if (!expiresAt) return "بدون تاريخ انتهاء محدد";
  return `صالح حتى ${new Intl.DateTimeFormat("ar-YE", { dateStyle: "medium" }).format(new Date(expiresAt))}`;
}

function destinationFromPath(pathname: string): StudentDestination | null {
  if (pathname === "/app" || pathname === "/app/") return "home";
  if (pathname === "/app/account" || pathname.startsWith("/app/account/")) return "account";
  for (const destination of learningDestinations) {
    if (pathname === destination.href || pathname.startsWith(`${destination.href}/`)) return destination.key;
  }
  return null;
}

function isReaderPath(pathname: string): boolean {
  return /^\/app\/learn\/lessons\/[^/]+\/?$/.test(pathname);
}

function DestinationIcon({ kind }: { kind: StudentDestinationIcon }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    focusable: false,
    "aria-hidden": true,
  };

  if (kind === "home") {
    return (
      <svg {...common}>
        <path d="M3.5 10.5 12 3.8l8.5 6.7" />
        <path d="M5.5 9.3V20h13V9.3" />
        <path d="M9.3 20v-6h5.4v6" />
      </svg>
    );
  }
  if (kind === "learn") {
    return (
      <svg {...common}>
        <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z" />
        <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v17h4.5A3.5 3.5 0 0 1 20 22V5.5Z" />
      </svg>
    );
  }
  if (kind === "practice") {
    return (
      <svg {...common}>
        <path d="M8 3h8" />
        <path d="M9 2v3M15 2v3" />
        <rect x="4" y="5" width="16" height="16" rx="3" />
        <path d="m8 13 2.3 2.3L16 9.7" />
      </svg>
    );
  }
  if (kind === "downloads") {
    return (
      <svg {...common}>
        <path d="M12 3v11" />
        <path d="m7.5 10 4.5 4.5 4.5-4.5" />
        <path d="M5 20h14" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function StudentNetworkState({ online }: { online: boolean }) {
  return (
    <div className={`student-network-state ${online ? "is-online" : "is-offline"}`} role="status" aria-live="polite">
      <span aria-hidden="true" />
      {online ? "متصل" : "غير متصل — يمكنك فتح ما سبق تنزيله"}
    </div>
  );
}

function StudentShellNavigation({
  destination,
  online,
  focused = false,
}: {
  destination: StudentDestination;
  online: boolean;
  focused?: boolean;
}) {
  if (focused) {
    return (
      <div className="student-shell-toolbar student-shell-toolbar--focused">
        <StudentNetworkState online={online} />
      </div>
    );
  }

  return (
    <>
      <div className="student-shell-toolbar">
        <StudentNetworkState online={online} />
        <Link
          className={`student-account-entry ${destination === "account" ? "is-active" : ""}`}
          to="/app/account"
          aria-current={destination === "account" ? "page" : undefined}
        >
          <DestinationIcon kind="account" />
          <span>حسابي</span>
        </Link>
      </div>

      <nav className="student-adaptive-nav" aria-label="التنقل الرئيسي للطالب">
        <div className="student-adaptive-nav__brand">
          <span>مساحة التعلم</span>
          <small>الوسيلة الذكية</small>
        </div>
        <div className="student-adaptive-nav__links">
          {learningDestinations.map((item) => (
            <Link
              key={item.key}
              className={`student-nav-link ${destination === item.key ? "is-active" : ""}`}
              to={item.href}
              aria-current={destination === item.key ? "page" : undefined}
            >
              <DestinationIcon kind={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <Link
          className={`student-nav-link student-nav-link--account ${destination === "account" ? "is-active" : ""}`}
          to="/app/account"
          aria-current={destination === "account" ? "page" : undefined}
        >
          <DestinationIcon kind="account" />
          <span>الحساب</span>
        </Link>
      </nav>

      <nav className="student-bottom-nav" aria-label="التنقل الرئيسي للطالب على الهاتف">
        {learningDestinations.map((item) => (
          <Link
            key={item.key}
            className={`student-bottom-nav__item ${destination === item.key ? "is-active" : ""}`}
            to={item.href}
            aria-current={destination === item.key ? "page" : undefined}
          >
            <DestinationIcon kind={item.icon} />
            <span>{item.shortLabel}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

function StudentHomeOverview() {
  return (
    <section className="student-home" aria-labelledby="student-home-title">
      <div className="student-page-heading student-page-heading--home">
        <p className="eyebrow">مساحة التعلم</p>
        <h2 id="student-home-title">ماذا تريد أن تتعلم اليوم؟</h2>
        <p>اختر وجهتك، وسنُبقي كل مهمة في مكان واضح بدل جمع كل شيء في صفحة واحدة.</p>
      </div>

      <div className="student-home-grid" aria-label="وجهات التعلم">
        {learningDestinations
          .filter((item) => item.key !== "home")
          .map((item) => (
            <Link className="student-home-card" key={item.key} to={item.href}>
              <span className="student-home-card__icon" aria-hidden="true">
                <DestinationIcon kind={item.icon} />
              </span>
              <span className="student-home-card__copy">
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
              <span className="student-home-card__arrow" aria-hidden="true">←</span>
            </Link>
          ))}
      </div>
    </section>
  );
}

function DestinationHeading({ destination }: { destination: Exclude<StudentDestination, "home" | "account"> }) {
  const item = learningDestinations.find((candidate) => candidate.key === destination);
  if (!item) return null;
  return (
    <header className="student-page-heading">
      <p className="eyebrow">مساحة الطالب</p>
      <h1>{item.label}</h1>
      <p>{item.description}</p>
    </header>
  );
}

export function StudentAccessSection({
  online,
  onSessionExpired,
}: {
  online: boolean;
  onSessionExpired: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const destination = destinationFromPath(location.pathname);
  const focusedReader = isReaderPath(location.pathname);
  const atLearnRoot = location.pathname === "/app/learn" || location.pathname === "/app/learn/";
  const [access, setAccess] = useState<AccessState>({ status: "loading" });
  const [classCode, setClassCode] = useState("");
  const [redemptionKey, setRedemptionKey] = useState(createAccessRedemptionIdempotencyKey);
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [curriculumRefreshKey, setCurriculumRefreshKey] = useState(0);

  const normalizedClassCode = normalizeAccessCode(classCode).slice(0, 7);
  const entitlements = access.status === "ready" ? access.entitlements : [];
  const hasFullAccess = entitlements.some((entitlement) => entitlement.scope === "all_content");

  async function loadAccess() {
    if (!online) {
      setAccess({ status: "offline" });
      return;
    }

    setAccess({ status: "loading" });
    try {
      setAccess({ status: "ready", entitlements: await listStudentEntitlements() });
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setAccess({ status: "error", message: requestMessage(error) });
    }
  }

  useEffect(() => {
    const needsInitialAccess =
      destination === "home" ||
      ((atLearnRoot || destination === "account") && access.status === "loading");
    if (needsInitialAccess) void loadAccess();
  }, [online, destination, atLearnRoot]);

  useEffect(() => {
    if (destination !== "learn") setRedeemSuccess(null);
  }, [destination]);

  async function handleRedeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSevenDigitClassCode(normalizedClassCode) || redeemBusy || !online || hasFullAccess) return;

    setRedeemBusy(true);
    setRedeemError(null);
    setRedeemSuccess(null);
    try {
      await redeemStudentAccess(normalizedClassCode, redemptionKey);
      setClassCode("");
      setRedemptionKey(createAccessRedemptionIdempotencyKey());
      setRedeemSuccess("تم تفعيل وصول الصف بنجاح.");
      await loadAccess();
      setCurriculumRefreshKey((current) => current + 1);
      navigate("/app/learn");
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setRedeemError(requestMessage(error));
    } finally {
      setRedeemBusy(false);
    }
  }

  if (!destination) return <Navigate replace to="/app/home" />;

  const accessManagement = (
    <section className="access-section student-access-management" aria-labelledby="access-title" aria-label="صلاحياتك ورموز الصفوف">
      <div className="section-heading">
        <div>
          <p className="eyebrow">الوصول إلى المحتوى</p>
          <h2 id="access-title">صلاحياتك ورموز الصفوف</h2>
        </div>
        <button
          className="text-button"
          type="button"
          onClick={() => void loadAccess()}
          disabled={!online || access.status === "loading"}
        >
          تحديث
        </button>
      </div>

      {access.status === "loading" ? (
        <div className="access-skeleton" role="status" aria-live="polite" aria-busy="true">
          <span className="sr-only">جاري تحميل صلاحيات الوصول</span>
          <span />
          <span />
          <span />
        </div>
      ) : access.status === "offline" ? (
        <div className="form-alert is-warning" role="status">
          يتطلب تحديث الوصول أو إضافة رمز صف اتصالًا بالشبكة. ما سبق تنزيله يبقى متاحًا من قسم التنزيلات.
        </div>
      ) : access.status === "error" ? (
        <div className="access-error" role="alert">
          <div className="form-alert is-danger">{access.message}</div>
          <button className="secondary-button" type="button" onClick={() => void loadAccess()} disabled={!online}>
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <>
          {entitlements.length === 0 ? (
            <div className="empty-state">
              <strong>لا توجد صلاحيات فعالة الآن</strong>
              <p>إذا استلمت رمز صف من 7 أرقام، أضفه هنا ليظهر محتوى الصف المتاح لك.</p>
            </div>
          ) : (
            <ul className="entitlement-list" aria-label="صلاحيات الوصول الفعالة">
              {entitlements.map((entitlement) => (
                <li key={entitlement.id}>
                  <span className="entitlement-icon" aria-hidden="true">✓</span>
                  <div>
                    <strong>{entitlement.scope === "all_content" ? "وصول كامل" : "وصول إلى صف"}</strong>
                    <small>{expiryLabel(entitlement.expiresAt)}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="access-tools" aria-labelledby="class-code-title">
            <div className="access-tools-heading">
              <div>
                <h3 id="class-code-title">إضافة رمز صف</h3>
                <p>أدخل الرمز المكوّن من 7 أرقام كما استلمته، ثم فعّل الصف.</p>
              </div>
            </div>

            {hasFullAccess ? (
              <div className="form-alert is-info" role="status">
                لديك وصول كامل فعّال، لذلك لا تحتاج إلى استخدام رمز صف الآن.
              </div>
            ) : (
              <form className="access-redeem-form" onSubmit={handleRedeem} noValidate>
                {redeemError ? <div className="form-alert is-danger" role="alert">{redeemError}</div> : null}
                <div className="field-group">
                  <label htmlFor="class-access-code">رمز الصف</label>
                  <div className="access-code-row">
                    <input
                      id="class-access-code"
                      className="text-input class-code-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9٠-٩۰-۹]*"
                      maxLength={14}
                      value={normalizedClassCode}
                      onChange={(event) => {
                        setClassCode(event.target.value);
                        setRedemptionKey(createAccessRedemptionIdempotencyKey());
                        setRedeemError(null);
                        setRedeemSuccess(null);
                      }}
                      aria-describedby="class-access-code-hint"
                      placeholder="0000000"
                      dir="ltr"
                    />
                    <button
                      className="primary-button"
                      type="submit"
                      disabled={!isSevenDigitClassCode(normalizedClassCode) || redeemBusy || !online}
                    >
                      {redeemBusy ? "جاري التفعيل" : "تفعيل الصف"}
                    </button>
                  </div>
                  <p className="field-hint" id="class-access-code-hint">يمكنك استخدام الأرقام العربية أو الإنجليزية.</p>
                </div>
                {!online ? <div className="form-alert is-warning" role="status">يلزم اتصال بالشبكة لتفعيل رمز الصف.</div> : null}
              </form>
            )}
          </div>
        </>
      )}
    </section>
  );

  return (
    <div
      className={`student-shell student-destination--${destination}${focusedReader ? " is-focused-reader" : ""}`}
      data-student-destination={destination}
      data-reader-focused={focusedReader || undefined}
    >
      <StudentShellNavigation destination={destination} online={online} focused={focusedReader} />
      <div className="student-destination">
        {destination === "home" ? (
          <>
            <StudentHomeOverview />
            {accessManagement}
          </>
        ) : null}

        {destination === "learn" ? (
          <>
            {atLearnRoot ? <DestinationHeading destination="learn" /> : null}
            {atLearnRoot && redeemSuccess ? (
              <div className="form-alert is-success student-route-notice" role="status">
                <strong>{redeemSuccess}</strong>
              </div>
            ) : null}
            <StudentLearningExperience
              online={online}
              refreshKey={curriculumRefreshKey}
              onSessionExpired={onSessionExpired}
            />
            {atLearnRoot ? accessManagement : null}
          </>
        ) : null}

        {destination === "practice" ? (
          <>
            <DestinationHeading destination="practice" />
            <StudentAssessmentSection online={online} refreshKey={curriculumRefreshKey} onSessionExpired={onSessionExpired} />
          </>
        ) : null}

        {destination === "downloads" ? (
          <>
            <DestinationHeading destination="downloads" />
            <StudentOfflineDownloadsSection online={online} refreshKey={curriculumRefreshKey} onSessionExpired={onSessionExpired} />
          </>
        ) : null}

        {destination === "account" ? (
          <section className="student-account-destination" aria-labelledby="student-account-title">
            <header className="student-page-heading">
              <p className="eyebrow">حسابي</p>
              <h1 id="student-account-title">الحساب والوصول</h1>
              <p>راجع وصولك للصفوف، وأضف رمزًا جديدًا عندما تحتاج إليه.</p>
            </header>
            {accessManagement}
          </section>
        ) : null}
      </div>
    </div>
  );
}
