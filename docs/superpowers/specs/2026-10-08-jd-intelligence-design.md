# JD Intelligence System Design

## Goal

Upgrade the one-way JD list into an auditable JD intelligence loop. The system should preserve raw material, extract structured fields, grade evidence, track source health, calculate capability frequency, and expose a coverage matrix that links hiring demand to the AI and robotics learning maps.

## Design

1. **Data layer**: add `app/assets/data-jd-intelligence.js`. It owns evidence grades, source status definitions, source registry, structured JD corpus, search leads, capability taxonomy, and the AI/robotics coverage matrix. Domain files continue to own learning content.
2. **Intelligence view**: add a `岗位情报` page that shows source health, evidence policy, capability frequency, structured corpus, coverage matrix, and linked knowledge nodes for the current domain.
3. **Structured collection**: extend the JD inbox draft with city, salary, source URL, evidence type/grade, requirements, skills, tools, scenarios, and metrics. Save normalized structured records and export Markdown containing both evidence metadata and extracted fields.
4. **Health persistence**: add `/api/source-health` to the local server and persist future source checks in `inbox/source-health.json`. The UI reads this file when available and otherwise falls back to the bundled registry.
5. **Validation**: add `tools/validate-learning-system.js` to validate JS syntax, node/module/quiz/interview/glossary references, JD source references, evidence grades, corpus domains, and source metadata uniqueness.
6. **Automation contract**: update the scheduled maintenance prompt to process structured fields, compare capability frequency across rounds, and record source access results without bypassing login walls or CAPTCHAs.

## Error Handling

The UI must tolerate missing optional structured fields from older inbox records. The server returns an empty source-health object if the file is absent. External source records distinguish `available`, `manual`, `captcha`, `login`, `timeout`, `deprecated`, and `unknown`; unverified URLs remain `manual` or `unknown` rather than being marked available.

## Verification

Run `node --check` on every JavaScript asset, run `node tools/validate-learning-system.js`, verify the intelligence view in a browser for both domains, save and export one structured draft, and confirm the source-health API round-trip.
