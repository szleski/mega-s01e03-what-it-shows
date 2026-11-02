<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import tickets from '#lib/data/followup-tickets.json';
  import { groupByCause, uniqueById, causeOf, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  const all = uniqueById(reports as Report[]);
  const merged = all.filter(r => r.mergedInto === 4471);
  const groups = groupByCause(merged, tenantOf);
  const mismatches = merged.filter(r => causeOf(r, tenantOf(r)) !== r.meta.intakeTag);
  const oneDay = merged.filter(r => notes.oneDayMove.includes(r.id));
  const bulkDay = '2026-07-02';
  const bulk = merged.filter(r => r.mergedAt?.startsWith(bulkDay));
  const preBulk = merged.filter(r => r.receivedAt.slice(0, 10) < bulkDay);
  const labels = { parser: 'Shared parser assumes month first', hint: 'booking-v3 displays the wrong date hint', unplaced: 'Needs investigation' };
  const ticketFor = (cause: string): string | null => tickets[cause as keyof typeof tickets];
  const byMonth = [...new Set(merged.map(r => r.receivedAt.slice(0, 7)))].sort().map(month => ({
    month,
    received: merged.filter(r => r.receivedAt.startsWith(month)).length,
    merged: merged.filter(r => r.mergedAt?.startsWith(month)).length
  }));
</script>

<p><strong>{merged.length} distinct reports · {groups.length} causes.</strong>
  The export contains {reports.length} rows; {reports.length - all.length} overlapping rows are excluded by report ID.
  {mismatches.length} intake tags disagree with the tenant-based classification.</p>

<div class="scroll">
  <table>
    <thead><tr><th>Cause</th><th>Reports</th><th>Tenants</th><th>Received</th><th>Follow-up ticket</th></tr></thead>
    <tbody>
      {#each groups as g (g.cause)}
        <tr>
          <td><code>{g.cause}</code><br />{labels[g.cause]}</td>
          <td><strong>{g.reports.length}</strong></td>
          <td>{g.tenants}</td>
          <td>{g.firstSeen} → {g.lastSeen}</td>
          <td>{#if ticketFor(g.cause)}<a href={ticketFor(g.cause)}>Open issue</a>{:else}Draft prepared; publication pending{/if}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<h3>Intake labels are evidence of the old guess</h3>
<table>
  <thead><tr><th>Computed cause</th><th>Tagged parser</th><th>Tagged hint</th></tr></thead>
  <tbody>{#each groups as g (g.cause)}<tr><td>{g.cause}</td><td>{g.taggedAs.parser ?? 0}</td><td>{g.taggedAs.hint ?? 0}</td></tr>{/each}</tbody>
</table>

<h3>Received is different from merged</h3>
<p>The export records {preBulk.length} reports received before {bulkDay}, and {bulk.length} reports merged on that day.
  The merge spike records desk activity; it does not date the start of customer impact.</p>
<table>
  <thead><tr><th>Month</th><th>Received</th><th>Merged into #4471</th></tr></thead>
  <tbody>{#each byMonth as m (m.month)}<tr><td>{m.month}</td><td>{m.received}</td><td>{m.merged}</td></tr>{/each}</tbody>
</table>

<h3>One-day descriptions need a separate check</h3>
<p>{oneDay.length} reports are marked in <code>desk-notes.json</code>. They remain inside the parser total under the supplied rule.
  A tenant-based category does not prove the cause of each report. These descriptions do not establish a third cause or a timezone fix.</p>
<ul>{#each oneDay as r (r.id)}<li><code>{r.id}</code> · {r.tenant} · {r.channel}: “{r.body}”</li>{/each}</ul>

<style>
  .scroll { overflow-x: auto; }
</style>
