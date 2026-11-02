# Verification — 2 November 2026

Story: a support agent opens the incident review; Svelte components join exported report IDs to tenant configuration, compute cause membership and queue chronology, and render the evidence alongside corrected triage guidance and a derived author reference.

| Boundary | Result | Evidence |
| --- | --- | --- |
| Export → report membership | Pass | 427 raw rows; 412 unique IDs; all duplicate rows identical |
| Reports + tenant directory → causes | Pass | Supplied `causeOf` / `groupByCause`: parser 379, hint 33, unplaced 0 |
| Causes → reconciliation | Pass | 379 + 33 = 412, without subtracting one-day notes again |
| Queue timestamps → chronology | Pass | 183 reports received before 2 July; 184 merged on 2 July; original weekly timeline inspected |
| Source → production HTML | Pass | SvelteKit 3.1.1 + Svelte 5.57.3 + mdsvex 0.12.8; static build completed |
| Frontmatter → visible author reference | Pass | RenderStamp displayed DR-DKNG-7PPY |
| User selection → explorer verdict | Pass | Both alder.physio/form: same cause; changing A to app: different causes |
| New pages → KB navigation | Pass | KB index lists review and decision proposal |
| Historical accepted decision | Pass | Decision 0001 identical to ZIP entry |

The first browser interaction exposed a stale preview-server manifest after rebuilding: its old dynamic module URL returned an import error. Restarted the preview server and reloaded the page, then repeated the interactive checks successfully. The console record retains that earlier error; no new browser error was generated during the successful interactions.

The npm default cache was outside the permitted write area. Installation used a dedicated `/tmp/mega-npm-cache` instead; no permissions were changed. SvelteKit 3 requires inline Vite plugin configuration, so the initial older-style config was replaced before the successful builds. The retained `#lib` alias produces a deprecation notice but resolves the export's existing imports correctly.

This is a local evidence and rendering check. Actual scheduling-service fixes and external publication have not been performed.
