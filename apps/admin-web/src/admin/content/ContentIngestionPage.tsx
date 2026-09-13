import { ContentIngestionWorkspace } from "./ContentIngestionWorkspace";

export function ContentIngestionPage({ onSessionExpired }: { onSessionExpired: () => void }) {
  return <ContentIngestionWorkspace onSessionExpired={onSessionExpired} />;
}
