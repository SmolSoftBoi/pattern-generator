# Implementation Plan: GitHub Actions CI Workflows

**Branch**: `001-github-actions-ci` | **Date**: 2026-01-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-github-actions-ci/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add and/or adjust GitHub Actions workflows so that pull requests and default-branch pushes get reliable CI: dependency install (Yarn), lint, typecheck, test (if present), and build, with caching for speed and concurrency cancellation to avoid duplicate runs.

Technical approach is documented in [research.md](./research.md): create/standardize `ci.yml`, keep CodeQL analysis (`codeql.yml`), and enforce dependency review (`dependency-review.yml`) with least-privilege permissions.
## Technical Context

**Language/Version**: TypeScript (strict), Node.js (validated via a CI-defined Node.js version matrix)  
**Primary Dependencies**: Next.js 14, React 18, ESLint (Next lint), TypeScript 5, Yarn  
**Storage**: N/A  
**Testing**: Currently no `test` script in `package.json`; CI will run tests if present and otherwise log “no tests found/configured”  
**Target Platform**: GitHub Actions runners (ubuntu-latest)  
**Project Type**: Next.js web application  
**Performance Goals**: Fast CI feedback; minimize redundant runs via caching + concurrency cancellation  
**Constraints**: Least-privilege permissions; safe for fork PRs; align with existing scripts (do not invent bespoke commands)  
**Scale/Scope**: CI workflows only (no app runtime behavior changes)
## Constitution Check

Relevant gates from `.specify/memory/constitution.md` and how the plan satisfies them:

- **VIII. Quality Gates & CI**: `ci.yml` enforces lint/typecheck/build (and tests when present). CI becomes a reliable merge signal.
- **VII. Testing Discipline**: CI will execute tests when configured; if no tests exist, it will explicitly log that state. Follow-up work (outside this feature) is to add unit tests for core deterministic generation.
- **IX. Security & Safety**: Workflows use least-privilege permissions (`contents: read` by default) and avoid secrets for basic verification; fork PRs remain safe.
- **XI. Dependency Hygiene**: No new runtime dependencies are introduced; dependency-review stays enabled to detect known-vulnerable changes.

No principle violations are required for this feature.
## Project Structure

### Documentation (this feature)

```text
specs/001-github-actions-ci/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```
### Source Code (repository root)

```text
.github/
└── workflows/
  ├── ci.yml                  # New/standardized CI workflow (this feature)
  ├── codeql.yml               # Security scanning (already present; may be adjusted)
  ├── dependency-review.yml    # Supply-chain checks (already present; adjust to least privilege)
  └── nextjs.yml               # Pages deploy workflow (exists; out of scope unless it conflicts)

src/
└── app/                         # Next.js app router

package.json
yarn.lock
tsconfig.json
next.config.mjs
```
**Structure Decision**: This is a Next.js web app. CI changes live exclusively under `.github/workflows/`.

## Phased Delivery Outline

### Phase 0 (Research)

Completed in [research.md](./research.md): confirms triggers, Node selection strategy, Yarn install mode, caching, concurrency, and permissions.

### Phase 1 (Design)

Artifacts produced:

- [data-model.md](./data-model.md): N/A (no domain data)
- [contracts/](./contracts/README.md): N/A (no API contracts)
- [quickstart.md](./quickstart.md): how to run CI checks locally

### Phase 2 (Implementation Plan)

Implementation work (to be broken down further by `/speckit.tasks`):

1. Add `ci.yml` with:
  - triggers: `pull_request` and `push` to default branch
  - concurrency: `${{ github.workflow }}-${{ github.event_name }}-${{ github.ref }}` and `cancel-in-progress: true`
  - least-privilege permissions: `contents: read`
  - Node strategy: validate against a CI-defined Node.js version matrix (single authoritative source)
  - Yarn + Corepack: `corepack enable`
  - install: Berry `--immutable`, Classic normal
  - cache: `actions/setup-node` Yarn cache (and `.yarn/cache` if Berry)
  - commands: `yarn lint`, typecheck via script or `yarn tsc --noEmit`, tests if script exists, `yarn build`
2. Adjust existing `dependency-review.yml` to align with “fail on vuln/license changes” behavior, while **keeping PR comment summaries enabled** (and therefore keeping `pull-requests: write` as an intentional least-privilege exception).
3. Confirm `codeql.yml` triggers and language remain `javascript-typescript`, with required minimal permissions.
4. Ensure overall workflow naming yields a stable status suitable for branch protection.
## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ----------------------------------- |
| N/A | N/A | N/A |
