import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { StudentAppBar } from "./StudentAppBar";
import { StudentAppBarTitleProvider } from "./StudentAppBarContext";
import { StudentBottomNav } from "./StudentBottomNav";
import { StudentDesktopNav } from "./StudentDesktopNav";
import type { StudentDestination } from "./student-navigation";

export function StudentAppShell({
  destination,
  online,
  focused,
  children,
}: {
  destination: StudentDestination;
  online: boolean;
  focused: boolean;
  children: ReactNode;
}) {
  const [title, setTitle] = useState<string | null>(null);
  const appBarContext = useMemo(() => ({ setTitle }), []);

  return (
    <StudentAppBarTitleProvider value={appBarContext}>
      <div
        className={`student-shell student-destination--${destination}${focused ? " is-focused-reader" : ""}`}
        data-student-destination={destination}
        data-reader-focused={focused || undefined}
      >
        {focused ? (
          !online ? (
            <div className="student-focused-offline" role="status">
              <span>أنت غير متصل</span>
              <Link to="/app/library/downloads">فتح التنزيلات</Link>
            </div>
          ) : null
        ) : (
          <>
            <StudentAppBar destination={destination} online={online} title={title} />
            <StudentDesktopNav destination={destination} />
            <StudentBottomNav destination={destination} />
          </>
        )}

        <div className="student-destination">{children}</div>
      </div>
    </StudentAppBarTitleProvider>
  );
}
