---

description: "Task list for feature implementation"

---

# Tasks: GitHub Actions CI Workflows

**Input**: Design documents from `/specs/001-github-actions-ci/`

**Prerequisites**:

- `specs/001-github-actions-ci/spec.md`
- `specs/001-github-actions-ci/plan.md`
- Optional context: `specs/001-github-actions-ci/research.md`, `specs/001-github-actions-ci/quickstart.md`


**Tests**: No automated tests are added for GitHub Actions workflow behavior in this feature.

- **Justification**: Workflow execution occurs in GitHub Actions; adding a full local runner harness would add significant tooling and maintenance.
- **Follow-up**: Add lightweight static validation (e.g., `actionlint`) for `.github/workflows/*.yml` in a later task (see Polish phase).

**Organization**: Tasks are grouped by user story to enable incremental delivery.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish a minimal CI workflow skeleton and shared decision logic (Node/Yarn detection) without yet requiring full validation.

- [x] T001 Create `.github/workflows/ci.yml` with workflow name, triggers (PR + default-branch push), `permissions: contents: read`, and a single `ci` job scaffold
- [x] T002 Implement a Node.js version matrix in `.github/workflows/ci.yml` (single authoritative source) and run CI across it (initial proposal: `20.x`, `22.x`, `24.x`, `current`).
  - Note:
    - The proposed matrix is chosen to cover a range of supported Node.js LTS releases plus the current release.
    - Per FR-012c, each Node.js version in the matrix (e.g., `20.x`, `22.x`, `24.x`) must be removed from the matrix within 30 days of its EOL date.
    - The authoritative EOL source is the official [Node.js release schedule](https://github.com/nodejs/release#release-schedule). `specs/001-github-actions-ci/research.md` may summarize this information but must treat the official schedule as the source of truth. Update the matrix whenever EOL dates are announced or changed in the official schedule.
  - Update:
    - The implemented matrix keeps `20.x` and `22.x` as required merge gates, and runs `current` as a non-blocking canary.
    - Rationale: some transitive dependencies include native modules (e.g., `canvas`) that may not be compatible with the newest Node/V8 ABI immediately.
- [x] T003 Enable Corepack in `.github/workflows/ci.yml` before any Yarn commands
- [x] T004 Implement Yarn mode detection in `.github/workflows/ci.yml` (Berry vs Classic) and set install args accordingly (`--immutable` for Berry)
- [x] T005 Align `specs/001-github-actions-ci/spec.md` with plan decisions (Node matrix, concurrency key semantics, and security workflow requirements)
- [x] T006 Document workflow assumptions in `specs/001-github-actions-ci/quickstart.md` if any local command expectations change

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Make CI reliable and aligned with existing repo scripts (do not invent commands).

**⚠️ CRITICAL**: No user story verification is meaningful until CI actually runs lint/typecheck/build correctly.

- [x] T007 Add dependency install step to `.github/workflows/ci.yml` using Yarn and the detected Yarn mode (Berry `yarn install --immutable`, Classic `yarn install`)
- [x] T008 Add lint step to `.github/workflows/ci.yml` using `yarn lint` (must match `package.json` scripts)
- [x] T009 Add typecheck step to `.github/workflows/ci.yml`: run `yarn typecheck` if script exists, else run `yarn tsc --noEmit`
- [x] T010 Add tests step to `.github/workflows/ci.yml`: run `yarn test` if script exists, else log "no tests found/configured" and succeed
- [x] T011 Add build step to `.github/workflows/ci.yml` using `yarn build`
- [x] T012 Ensure CI logs clearly label each phase (install/lint/typecheck/test/build) in `.github/workflows/ci.yml` step names

**Checkpoint**: CI job executes end-to-end in GitHub Actions for PRs, failing fast on lint/typecheck/build errors.

---

## Phase 3: User Story 1 - PRs are reliably validated (Priority: P1) 🎯 MVP

**Goal**: Every PR gets a clear pass/fail gate covering install, lint, typecheck, tests (if present), and build.

**Independent Test**: Open a PR that introduces a lint or type error and confirm `ci.yml` fails with a clear step failure; fix the error and confirm it passes.

- [x] T013 [US1] Confirm fork-safety in `.github/workflows/ci.yml`: use `pull_request` (not `pull_request_target`), do not use repository secrets, and keep least-privilege permissions
- [x] T014 [US1] Confirm least-privilege permissions in `.github/workflows/ci.yml` (default read-only)
- [x] T015 [US1] Validate that the workflow name/job name in `.github/workflows/ci.yml` produces a stable status check name suitable for branch protection

**Checkpoint**: US1 is complete when PRs reliably pass/fail with actionable logs.

---

## Phase 4: User Story 2 - Pushes are validated too (Priority: P2)

**Goal**: Pushes to the default branch also run the same CI validation.

**Independent Test**: Push to a non-default branch (no run expected) and push to `main` (run expected).

- [x] T016 [US2] Restrict `push` trigger branches in `.github/workflows/ci.yml` to the default branch only (e.g., `main`)
- [x] T017 [US2] Add a short note to `specs/001-github-actions-ci/quickstart.md` clarifying that CI runs on PRs and default-branch pushes (not all branches)

**Checkpoint**: US2 is complete when `main` pushes run CI and non-default branches do not.

---

## Phase 5: User Story 3 - CI runs are fast and not wasteful (Priority: P3)

**Goal**: Reduce CI runtime via caching and cancel superseded runs.

**Independent Test**: Push multiple commits to the same PR branch and confirm old runs cancel; re-run CI with unchanged lockfile and confirm faster dependency restore.

- [x] T018 [US3] Add concurrency to `.github/workflows/ci.yml` using group `${{ github.workflow }}-${{ github.event_name }}-${{ github.ref }}` with `cancel-in-progress: true`
- [x] T019 [US3] Enable Yarn dependency caching in `.github/workflows/ci.yml` using `actions/setup-node@v4` built-in `cache: yarn`
- [x] T020 [US3] If Yarn Berry is detected, add cache for `.yarn/cache` in `.github/workflows/ci.yml` (keyed on `yarn.lock` + `.yarnrc.yml` when present)

**Checkpoint**: US3 is complete when redundant in-progress runs cancel and caching meaningfully reduces repeated-run install time.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Security/scanning workflows and tidy-up to align with least privilege and the user’s requested workflow set.

- [x] T021 [P] Confirm `.github/workflows/dependency-review.yml` permissions are least privilege **given PR commenting is enabled** (keep `pull-requests: write` and document the exception)
- [x] T022 [P] Configure `.github/workflows/dependency-review.yml` to fail PRs on known-vulnerable dependency changes and suspicious licenses (set `fail-on-severity` and `deny-licenses` per maintainer policy)
- [x] T023 [P] Confirm `.github/workflows/codeql.yml` triggers match requirements (PR + default-branch push + weekly schedule) and keep language `javascript-typescript`
- [x] T024 [P] Ensure `.github/workflows/codeql.yml` uses only required permissions for CodeQL (do not grant broad write permissions)
- [x] T025 Implement optional workflow static validation per **FR-016** (e.g., adopt `actionlint` or similar) and document the approach in `specs/001-github-actions-ci/research.md`
- [x] T026 Run through the acceptance scenarios in `specs/001-github-actions-ci/spec.md` and update wording if implementation details drifted

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Phase 1
- **US1 (Phase 3)**: Depends on Phase 2
- **US2 (Phase 4)**: Depends on Phase 3 (same `ci.yml` file; small incremental change)
- **US3 (Phase 5)**: Depends on Phase 3 (can follow immediately after US1)
- **Polish (Phase 6)**: Can run after Phase 3; tasks touching different workflows may be parallelized

### User Story Dependencies

- **US1 (P1)** is the MVP and should ship first.
- **US2 (P2)** and **US3 (P3)** extend the same workflow but do not require app code changes.

## Parallel Opportunities

- [P] tasks in Phase 6 can be done in parallel because they primarily touch different files:
  - `.github/workflows/dependency-review.yml`
  - `.github/workflows/codeql.yml`
  - `specs/001-github-actions-ci/research.md`

## Parallel Example

- Dependency review hardening (`.github/workflows/dependency-review.yml`) can be done in parallel with CodeQL confirmation (`.github/workflows/codeql.yml`).
