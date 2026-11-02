import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { uniqueById, groupByCause, causeOf } from '../support-kb/src/lib/kb/causes.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = path.join(root, 'support-kb/src/lib/data');
const raw = JSON.parse(fs.readFileSync(path.join(data, 'reports-4471.json'), 'utf8'));
const all = uniqueById(raw);
const tenants = new Map(fs.readdirSync(path.join(data, 'tenants')).map(name => {
  const t = JSON.parse(fs.readFileSync(path.join(data, 'tenants', name), 'utf8'));
  return [t.handle, t];
}));
const reportTenant = r => tenants.get(r.tenant);
const reports = all.filter(r => r.mergedInto === 4471);
const groups = groupByCause(reports, reportTenant);
const notes = JSON.parse(fs.readFileSync(path.join(data, 'desk-notes.json'), 'utf8'));
assert.equal(groups.reduce((n, g) => n + g.reports.length, 0), reports.length, 'Every report must reconcile');
assert(!groups.some(g => g.cause === 'unplaced'), 'Review reports that the supplied model cannot place');
for (const r of raw) assert.deepEqual(r, all.find(x => x.id === r.id), 'Overlapping rows must agree');
const audit = {
  source: 'kb-export-267efc5e.zip, exported 2026-10-04',
  rawRows: raw.length,
  uniqueReports: all.length,
  overlappingRows: raw.length - all.length,
  sourceTicket: 4471,
  mergedReports: reports.length,
  intakeDisagreements: reports.filter(r => r.meta.intakeTag !== causeOf(r, reportTenant(r))).length,
  groups: groups.map(g => ({
    cause: g.cause,
    count: g.reports.length,
    taggedAs: g.taggedAs,
    tenants: g.tenants,
    firstSeen: g.firstSeen,
    lastSeen: g.lastSeen,
    channels: g.reports.reduce((counts, r) => ({ ...counts, [r.channel]: (counts[r.channel] ?? 0) + 1 }), {}),
    tenantCounts: [...new Set(g.reports.map(r => r.tenant))].sort().map(tenant => ({ tenant, count: g.reports.filter(r => r.tenant === tenant).length })),
    reportIds: g.reports.map(r => r.id)
  })),
  oneDayDescriptions: notes.oneDayMove.map(id => {
    const r = reports.find(r => r.id === id);
    assert(r, `Desk note ${id} must refer to a report`);
    return { id, classifiedAs: causeOf(r, reportTenant(r)), body: r.body };
  })
};
fs.mkdirSync(path.join(root, 'analysis'), { recursive: true });
fs.writeFileSync(path.join(root, 'analysis/report-audit.json'), JSON.stringify(audit, null, 2) + '\n');
fs.mkdirSync(path.join(root, 'issues'), { recursive: true });
for (const g of groups) {
  const parser = g.cause === 'parser';
  const title = parser
    ? `[parser] Shared date parser assumes MM/DD for day-first tenants — ${g.reports.length} reports from #4471`
    : `[hint] booking-v3 shows MM/DD/YYYY to day-first tenants — ${g.reports.length} reports from #4471`;
  const detail = parser ? `The shared parser reads dates month first although these tenants write day first. The supplied model assigns app and email reports, plus booking-v2 form reports, to this cause. Fixing the booking-v3 hint does not resolve this path.

Example: R-41200, harbour.dental (en-GB), app: 7 April becomes 4 July. R-41205 is also parser: morrow.tax uses fr-FR and booking-v2; its browser locale en-US and intake label hint are misleading.

Acceptance criteria:
- Interpret ambiguous numeric dates using an explicit input contract aligned with the tenant's convention; 07/04/2026 in en-GB must retain 7 April rather than become 4 July.
- Exercise app, email and booking-v2 form paths; verify invalid dates and month-first controls.
- Verify against the real service: the export contains a cause model, not the production parser.
- Collect original input, timezone, event timestamp and rendered invite for the desk's one-day descriptions before asserting a timezone cause. These reports remain included in this ticket's count.`
    : `For day-first tenants using booking-v3, the date field prints MM/DD/YYYY while the form reads the value using the tenant's day-first convention. Only reports arriving through that form take this cause. The shared parser is a separate workstream.

Example: R-41230, copper.studio (es-ES), form: the report describes 6 January becoming 1 June, despite intake labelling it parser. R-41241 (alder.physio, de-DE) and R-41251 (pale.harbour, pt-PT) corroborate the affected form configuration.

Acceptance criteria:
- Make the booking-v3 date hint agree with the tenant's input convention and the form's actual parsing and validation.
- Verify de-DE, es-ES and pt-PT with ambiguous month/day examples, and include a month-first control.
- Check that entering the example shown by the hint retains the intended date through submission and invite rendering.
- Verify against the real form: the export supplies DATE_HINT and tenant configuration, not the production form implementation.`;
  const body = `## Problem and scope

**Cause:** \`${g.cause}\`  
**Reports covered:** **${g.reports.length} distinct reports** merged into source ticket **#4471**.  
**Tenants:** ${g.tenants}. **Received:** ${g.firstSeen} through ${g.lastSeen}.

${detail}

## Counting and evidence

The export has ${raw.length} rows and ${all.length} distinct report IDs. Remove overlapping export rows with \`uniqueById\`, filter \`mergedInto === 4471\`, join the tenant directory, and run \`groupByCause\` / \`causeOf\` from \`support-kb/src/lib/kb/causes.ts\`. Neither subject matching nor browser intake tags determine cause.

Intake labels within this cause: ${Object.entries(g.taggedAs).map(([tag, n]) => `${tag}: ${n}`).join('; ')}. Channels: ${Object.entries(audit.groups.find(x => x.cause === g.cause).channels).map(([channel, n]) => `${channel}: ${n}`).join('; ')}.

The two tickets partition the source reports without overlap. The one-day descriptions are footnotes within the model's parser count; they are not an independently established third cause.

Full membership is recorded in \`analysis/report-audit.json\`; regenerate with \`node scripts/analyze.mjs\` (Node 22.18+).

Source files: \`support-kb/src/lib/data/reports-4471.json\`, \`support-kb/src/lib/data/tenants/\`, \`support-kb/src/lib/kb/causes.ts\`, and \`support-kb/src/lib/data/desk-notes.json\`.

Rendered desk review: \`rendered/kb/incidents/4471-review/index.html\`. Signed source: \`support-kb/src/routes/kb/incidents/4471-review/+page.svx\`.

## Report IDs

${g.reports.map(r => r.id).join(', ')}
`;
  fs.writeFileSync(path.join(root, `issues/${g.cause}.md`), body);
  fs.writeFileSync(path.join(root, `issues/${g.cause}.title.txt`), title + '\n');
}
console.log(JSON.stringify({ rawRows: audit.rawRows, uniqueReports: audit.uniqueReports, overlappingRows: audit.overlappingRows, groups: audit.groups.map(({cause,count}) => ({cause,count})), intakeDisagreements: audit.intakeDisagreements, reconciliation: 'ok' }, null, 2));
