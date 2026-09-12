# First Production Batch Source Preflight

Read-only source verification performed before Production mutation.

Legacy subject: `1794eea5-4772-4c94-bd2b-b08e5815e733`

Observed source facts:

- Page rows: `69`
- Rows with image: `69`
- Raw AI question rows: `104`
- Missing `page_number`: `0`
- Distinct page numbers: `69`
- Logical lessons under the current importer grouping rule (normalized title + contiguous page number): `62`

These values are enforced by the temporary startup runner before any Production mutation. Any drift aborts the batch before reset/import.
