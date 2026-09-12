# Temporary Bootstrap Implementation Boundary

This branch intentionally wires the first bounded legacy import into API startup only as a temporary Production execution mechanism because Railway does not provide a native one-off exec against the already deployed API image with the same persistent media volume.

The runner is dormant when the explicit flag is absent. After a successful Production batch, the flag must be disabled and the startup wiring removed in a cleanup change so normal API startup remains free of content-import orchestration.
