## Problem and scope

**Cause:** `hint`  
**Reports covered:** **33 distinct reports** merged into source ticket **#4471**.  
**Tenants:** 3. **Received:** 2026-04-17 through 2026-09-22.

For day-first tenants using booking-v3, the date field prints MM/DD/YYYY while the form reads the value using the tenant's day-first convention. Only reports arriving through that form take this cause. The shared parser is a separate workstream.

Example: R-41230, copper.studio (es-ES), form: the report describes 6 January becoming 1 June, despite intake labelling it parser. R-41241 (alder.physio, de-DE) and R-41251 (pale.harbour, pt-PT) corroborate the affected form configuration.

Acceptance criteria:
- Make the booking-v3 date hint agree with the tenant's input convention and the form's actual parsing and validation.
- Verify de-DE, es-ES and pt-PT with ambiguous month/day examples, and include a month-first control.
- Check that entering the example shown by the hint retains the intended date through submission and invite rendering.
- Verify against the real form: the export supplies DATE_HINT and tenant configuration, not the production form implementation.

## Counting and evidence

The export has 427 rows and 412 distinct report IDs. Remove overlapping export rows with `uniqueById`, filter `mergedInto === 4471`, join the tenant directory, and run `groupByCause` / `causeOf` from `support-kb/src/lib/kb/causes.ts`. Neither subject matching nor browser intake tags determine cause.

Intake labels within this cause: parser: 15; hint: 18. Channels: form: 33.

The two tickets partition the source reports without overlap. The one-day descriptions are footnotes within the model's parser count; they are not an independently established third cause.

Full membership is recorded in `analysis/report-audit.json`; regenerate with `node scripts/analyze.mjs` (Node 22.18+).

Source files: `support-kb/src/lib/data/reports-4471.json`, `support-kb/src/lib/data/tenants/`, `support-kb/src/lib/kb/causes.ts`, and `support-kb/src/lib/data/desk-notes.json`.

Rendered desk review: `rendered/kb/incidents/4471-review/index.html`. Signed source: `support-kb/src/routes/kb/incidents/4471-review/+page.svx`.

## Report IDs

R-41230, R-41241, R-41251, R-41259, R-41262, R-41275, R-41294, R-41305, R-41308, R-41366, R-41372, R-41384, R-41387, R-41396, R-41400, R-41406, R-41415, R-41416, R-41418, R-41428, R-41439, R-41441, R-41449, R-41453, R-41456, R-41460, R-41472, R-41485, R-41493, R-41539, R-41572, R-41582, R-41584
