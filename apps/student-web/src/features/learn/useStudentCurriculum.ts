import { useEffect, useState } from "react";
import { isMissingSessionError, type StudentCurriculumCatalog } from "../../auth-api";
import {
  getCachedStudentCurriculum,
  peekCachedStudentCurriculum,
} from "../../shared/data/student-runtime-cache";
import { studentErrorMessage } from "../../student-error-copy";

export type CurriculumState =
  | { status: "loading"; catalog: StudentCurriculumCatalog | null }
  | { status: "ready"; catalog: StudentCurriculumCatalog }
  | { status: "offline"; catalog: StudentCurriculumCatalog | null }
  | { status: "error"; catalog: StudentCurriculumCatalog | null; message: string };

export function useStudentCurriculum({ profileId, online, refreshKey, onSessionExpired }: {
  profileId: string;
  online: boolean;
  refreshKey: number;
  onSessionExpired: () => void;
}) {
  const initial = peekCachedStudentCurriculum(profileId);
  const [state, setState] = useState<CurriculumState>(initial ? { status: "ready", catalog: initial } : { status: online ? "loading" : "offline", catalog: initial });

  async function reload(force = false) {
    const cached = peekCachedStudentCurriculum(profileId);
    if (!online) {
      setState({ status: "offline", catalog: cached });
      return;
    }
    if (!cached) setState({ status: "loading", catalog: null });
    try {
      const catalog = await getCachedStudentCurriculum(profileId, { force });
      setState({ status: "ready", catalog });
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setState({ status: "error", catalog: cached, message: studentErrorMessage(error, "curriculum") });
    }
  }

  useEffect(() => { void reload(refreshKey > 0); }, [online, profileId, refreshKey]);

  return { state, reload };
}
