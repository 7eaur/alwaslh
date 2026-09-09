BEGIN;

CREATE TYPE ai_output_review_action AS ENUM ('edit', 'approve', 'reject');

CREATE TABLE ai_output_review_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_output_id uuid NOT NULL REFERENCES ai_outputs(id) ON DELETE CASCADE,
  revision integer NOT NULL CHECK (revision > 0),
  action ai_output_review_action NOT NULL,
  actor_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  reviewed_output jsonb,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_output_review_events_output_revision_unique UNIQUE (ai_output_id, revision),
  CONSTRAINT ai_output_review_events_payload_shape CHECK (
    (action IN ('edit', 'approve') AND reviewed_output IS NOT NULL)
    OR
    (action = 'reject' AND reviewed_output IS NULL)
  ),
  CONSTRAINT ai_output_review_events_note_length CHECK (
    note IS NULL OR length(note) <= 4000
  ),
  CONSTRAINT ai_output_review_events_reject_note_required CHECK (
    action <> 'reject' OR (note IS NOT NULL AND length(btrim(note)) > 0)
  )
);

-- The UNIQUE (ai_output_id, revision) btree already serves
-- latest-revision lookups with a backward index scan; do not duplicate it.
CREATE INDEX idx_ai_output_review_events_actor_created
  ON ai_output_review_events(actor_profile_id, created_at DESC);

COMMIT;
