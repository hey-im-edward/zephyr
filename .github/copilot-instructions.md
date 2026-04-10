# Copilot Project Instructions

## Response Language Policy
- Always respond to the user in Vietnamese for all explanations, plans, status updates, and final answers.
- Keep code snippets, shell commands, API names, class names, and error messages in their original language when needed for accuracy.
- If the user explicitly asks for another language, follow the user's request for that response.

## Communication Style
- Use clear, concise Vietnamese that is easy for non-technical users to understand.
- Prefer practical guidance and concrete next steps over abstract discussion.

## Skill Auto-Activation Policy
- The agent must automatically select and apply relevant project skills from `.github/skills/**` based on user intent, without requiring explicit trigger commands.
- Skill selection must be intent-first and keyword-assisted; if multiple skills match, the agent should combine them in the same workflow.
- For prompts related to design, UI/UX, frontend, Figma, visual direction, hero, glassmorphism, liquid glass, typography, motion, Storybook, the agent must prioritize these skills automatically:
	- `frontend-competition-polish`
	- `hero-banner-art-direction`
	- `glassmorphism-ui-system`
	- `liquid-glass-motion-effects`
	- `typography-and-font-pairing`
	- `frontend-data-flow-guard`
- For prompts related to API contracts, order/stock consistency, security, CI/CD, DB migration, and release checks, the agent must automatically route to the matching engineering skills.
- The agent should not wait for slash commands when intent is already clear from the prompt.
- During execution updates, the agent should mention which skills were auto-selected when the task is medium/high complexity.

## Documentation Creation Policy
- Before creating any new documentation file (for example: README, design notes, migration report, architecture docs, runbook), the agent must ask for and receive user approval first.
- If user approval is not granted, the agent must not create the documentation file.
- All newly created documentation files must be written in Vietnamese by default.
- If a documentation file must contain code snippets, commands, API names, class names, or error messages, those technical elements can remain in their original language for accuracy.

## AI-First Engineering Rules
- The agent is expected to implement changes end-to-end, but humans remain responsible for final approval on medium/high-risk changes.
- Every pull request generated or assisted by AI must include: scope, risk level, test evidence, rollback note, and AI assistance note.
- AI must never introduce or keep hardcoded secrets, tokens, credentials, or sensitive personal data.
- The agent must prefer small, dependency-safe batches of changes over broad refactors in one step.
- The agent must not modify architecture-critical modules (auth, payment, inventory consistency, migration scripts) without explicit risk notes and validation evidence.

## API Contract Synchronization Rule
- Any backend API contract change must update corresponding frontend types and API client calls in the same change set.
- Any frontend request/response schema update must be verified against backend controllers/services before completion.
- For this repository, sort values and query parameters in catalog/search flows must remain consistent across backend and frontend.

## Security Baseline Rule
- Use explicit allowlists for public endpoints and avoid broad open rules for newly added routes.
- Any new endpoint must be reviewed for authentication and authorization requirements before completion.
- Do not weaken security filters, CORS safeguards, or password/token handling to make tests pass.

## Secrets and Environment Rule
- No fallback production-like secrets are allowed in code paths intended for staging/production.
- Security-sensitive environment variables must be validated and documented at usage points.
- If required secrets are missing for secure execution, fail safely and report the missing configuration.

## Inventory and Concurrency Rule
- For order and stock updates, the agent must preserve data consistency under concurrent requests.
- Any stock deduction/restock logic change must include concurrency-safe handling and validation tests.
- Never bypass inventory checks for convenience in development changes.

## Testing and Quality Gates Rule
- All non-trivial changes must pass lint, typecheck, build, and relevant automated tests before completion.
- For medium/high-risk changes, add or update tests that prove expected behavior.
- Bug fixes must include regression tests whenever feasible.

## CI/CD and Release Rule
- Do not treat placeholder deployment steps as successful production readiness.
- CI workflows must fail clearly when required deploy inputs are missing.
- Any change affecting runtime behavior must include a short rollback approach in the PR summary.

## Risk-Based Review Rule
- Low-risk changes may use reduced review when all gates pass.
- Medium-risk changes require at least one human reviewer.
- High-risk changes (auth, payment, order state, stock, database migrations, security config) require at least two reviewers or explicit owner approval.

## AI Usage Safety Rule
- Never send secrets, private keys, tokens, customer data, or internal confidential data to AI prompts.
- When AI proposes third-party dependencies, verify license compatibility and known vulnerabilities before adoption.
- If AI output is ambiguous, inconsistent, or unverifiable, stop and request clarification or add validation first.

## PR Completion Checklist Rule
- The agent must provide a concise completion summary covering: what changed, why, risks, validation executed, and any follow-up.
- The agent must explicitly mention unverified assumptions or validation gaps if any step could not be completed.

## GitNexus Code Intelligence (MCP)

This project is indexed by GitNexus (1904 nodes, 5237 edges, 109 clusters, 146 execution flows). The GitNexus MCP server is configured in `.vscode/mcp.json` and provides deep codebase intelligence tools.

### Always Do
- **Before editing any function, class, or method**: run `gitnexus_impact` to check blast radius and risk level. Report HIGH/CRITICAL risks before proceeding.
- **Before committing**: run `gitnexus_detect_changes` to verify changes only affect expected symbols and flows.
- **When exploring unfamiliar code**: use `gitnexus_query` to find execution flows instead of plain text search.
- **When needing full context on a symbol**: use `gitnexus_context` to see all callers, callees, and process participation.
- **When renaming symbols**: use `gitnexus_rename` with `dry_run: true` first, then apply.

### Tools Quick Reference
| Tool | When to use |
|------|-------------|
| `gitnexus_query({query: "..."})` | Find code by concept or keyword |
| `gitnexus_context({name: "symbolName"})` | 360-degree view of a symbol |
| `gitnexus_impact({target: "symbolName", direction: "upstream"})` | Blast radius before editing |
| `gitnexus_detect_changes({scope: "staged"})` | Pre-commit scope check |
| `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` | Safe multi-file rename |
| `gitnexus_cypher({query: "MATCH ..."})` | Custom graph queries |

### Never Do
- Never edit a function/class without running `gitnexus_impact` first.
- Never ignore HIGH or CRITICAL risk warnings.
- Never rename symbols with find-and-replace — use `gitnexus_rename`.
- Never commit without running `gitnexus_detect_changes`.
