import type { ReactNode } from "react";
import { StudentAppBar } from "./StudentAppBar";
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
  return (
    <div
      className={`student-shell student-destination--${destination}${focused ? " is-focused-reader" : ""}`}
      data-student-destination={destination}
      data-reader-focused={focused || undefined}
    >
      {focused ? (
        !online ? <div className="student-focused-offline" role="status">غير متصل</div> : null
      ) : (
        <>
          <StudentAppBar destination={destination} online={online} />
          <StudentDesktopNav destination={destination} />
          <StudentBottomNav destination={destination} />
        </>
      )}

      <div className="student-destination">{children}</div>
    </div>
  );
}
