import { createContext, useContext } from "react";

type StudentAppBarContextValue = {
  setTitle: (title: string | null) => void;
};

const StudentAppBarContext = createContext<StudentAppBarContextValue | null>(null);

export const StudentAppBarTitleProvider = StudentAppBarContext.Provider;

export function useStudentAppBarTitle(): StudentAppBarContextValue {
  const value = useContext(StudentAppBarContext);
  if (!value) throw new Error("useStudentAppBarTitle must be used inside StudentAppShell");
  return value;
}
