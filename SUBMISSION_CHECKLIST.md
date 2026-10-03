# Submission checklist

Event page (swarmchasing.com): **submissions due Sunday Oct 4, 2026, 5:00 PM PT** (= Oct 5, 01:00 in Lagos). `docs/HOURS.md` and `brief.json` say 9:00 PM PT; plan for the earlier time.

- [x] GitHub repo exists and is public, with an MIT license: https://github.com/ayodejiades/traceturn
- [x] Written explanation: docs/FINDINGS.md (plus README and SUBMISSION.md)
- [x] SUBMISSION.md describes the current product and its limits
- [ ] Production deploy is current: https://traceturn.vercel.app must show "Acts on the gap" on `/proof`, the incident pages, and no "Summarize with" links (deploys are manual; the Vercel CLI is not installed here)
- [ ] Demo video rendered (`/Users/mac/Hackathons/traceturn-demo/out/demo.mp4`, 180 s max), uploaded, and its URL pasted below
- [ ] `pnpm test`, `pnpm claim:verify`, `pnpm verify:design`, `npx tsc --noEmit` all pass on the commit being submitted
- [ ] Submit on the event platform (https://swarmchasing.com/) before the deadline
- [ ] Optional: a second annotator labels `evidence/act-audit-labelsheet.csv` (docs/LABELLING.md) and the result goes into the docs

Video URL: _paste here_
