# S01E03 — what it shows

Review of the support desk's merged ticket #4471, from the course's 4 October 2026 knowledge-base export.

The export contains **427 rows, 412 distinct reports, and two modeled causes**:

| Cause | Distinct reports | Tenants | Received |
| --- | ---: | ---: | --- |
| Shared parser assumes month first for day-first tenants | 379 | 11 | 2026-04-01 to 2026-10-04 |
| booking-v3 displays a month-first hint for day-first input | 33 | 3 | 2026-04-17 to 2026-09-22 |

Report IDs remove the 15 repeated export rows. Tenant locale, form version and entry channel determine the modeled cause. Browser-based intake tags disagree on 38 reports.

The five descriptions marked in `desk-notes.json` remain within the parser count. They deserve investigation, but the export does not establish a third cause. The 2 July bulk merge describes desk activity, not the start of customer impact.

The subsequent course engineering update reports **#4471 closed on 5 October 2026**: parser **fixed** (`fix(dates): parse dd/mm for eu locales`), hint **won't fix** (booking-v3 form retired). The review keeps these outcomes separate; retiring a form is not repairing its hint.

## Deliverables

- [Signed review source](support-kb/src/routes/kb/incidents/4471-review/+page.svx)
- [Rendered review](rendered/kb/incidents/4471-review/index.html), with its CSS and JavaScript in `rendered/_app/`
- [Proposed replacement decision](support-kb/src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx)
- [Parser ticket body](issues/parser.md) and [form-hint ticket body](issues/hint.md)
- [Reproducible membership and counts](analysis/report-audit.json)
- [Original rendered incident](evidence/before/kb/incidents/4471/index.html) and [original triage](evidence/before/kb/triage/dedupe/index.html)
- Original ZIP: `kb-export-original.zip`

All original exported source files remain unchanged. New pages follow the export's frontmatter and signing conventions, and the existing index discovers them automatically. Decision 0001 remains the historical accepted record. Decision 0002 is a proposal awaiting desk acceptance.

## Reproduce

Use Node.js 22.18 or later (verified with 26.5.0).

```sh
node scripts/analyze.mjs
cd support-kb
npm ci
npm run build
npm run preview -- --port 4173
```

Open `http://127.0.0.1:4173/kb/incidents/4471-review/`.
The HTML is real SvelteKit prerendered output, not a hand-written imitation of the page. The explorer hydrates and responds to tenant and channel changes. Counts are computed in components from the supplied data; the desk reference is derived by `RenderStamp` from the frontmatter signature.

After a rebuild, copy `support-kb/build/` into `rendered/` and restart the preview server so it serves the matching client manifest.
To serve the committed rendering directly, use `python3 -m http.server 4174 --directory rendered`.

## Verification

- Executed the supplied cause model against the tenant directory and reconciled all distinct reports.
- Checked that repeated IDs carry identical report data.
- Built and opened the original incident and stale triage pages in the browser before writing the review.
- Built the new signed pages and confirmed the rendered desk reference `DR-CWKJ-REZF`.
- Changed the explorer to matching tenant/form paths: it displayed “same cause — merge”. Changing one side to app displayed “different causes — keep apart” despite matching subject and tenant.
- Confirmed both new pages appear in the KB index.
- Compared decision 0001 byte-for-byte with the original ZIP.

The export models the failure mechanisms; it does not contain the production scheduling service. Closure dispositions are reported by the course's engineering update, not independently verified production fixes.

Published with the student's approval in [szleski/mega-s01e03-what-it-shows](https://github.com/szleski/mega-s01e03-what-it-shows).
Follow-up tickets: [parser #1](https://github.com/szleski/mega-s01e03-what-it-shows/issues/1) and [form hint #2](https://github.com/szleski/mega-s01e03-what-it-shows/issues/2).
Course acceptance is pending.
