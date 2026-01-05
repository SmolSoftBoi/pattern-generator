# Feature Specification: GitHub Actions CI Workflows

**Feature Branch**: `001-github-actions-ci`  
**Created**: 2026-01-02  
**Status**: Draft  
**Input**: User description: "Add GitHub Actions workflows for this repo so every PR and push gets reliable CI: install deps, lint, typecheck, test, and build. Keep runs fast via caching and avoid duplicate runs via concurrency."

## Clarifications

### Session 2026-01-02

- Q: What should CI do if there are no tests configured / no tests found? → A: Pass, but clearly log "no tests found/configured".
- Q: For push events, which branches should trigger CI? → A: Run CI on pushes to the default branch.
- Q: Which package manager should CI use for installs? → A: Yarn.
- Q: What Node.js version strategy should CI use? → A: Validate against a Node.js version matrix defined in CI (single authoritative source).
- Q: How should concurrency and deduplication work across push and pull_request triggers? → A: Use concurrency group `${{ github.workflow }}-${{ github.event_name }}-${{ github.ref }}` with `cancel-in-progress: true`.
  - Expected cancellation: newer PR commits cancel older PR runs for that PR ref; newer default-branch pushes cancel older push runs for that branch ref.
  - Not expected: PR runs do not cancel push runs (and vice versa), enforced by including `${{ github.event_name }}`.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->
### User Story 1 - PRs are reliably validated (Priority: P1)

As a contributor, I want every pull request to be automatically checked for code quality and build correctness, so I can confidently merge changes without breaking the project.

**Why this priority**: PR validation is the main quality gate and the most common path for changes entering the default branch.

**Independent Test**: Open a PR that introduces (a) a lint issue, (b) a type error, (c) a failing test (if tests exist), and (d) a build break, and confirm the CI run fails in each case with clear logs; then fix each issue and confirm the run passes.

**Acceptance Scenarios**:

1. **Given** a pull request is opened, **When** CI runs, **Then** the run reports a clear pass/fail result for dependency install, lint, typecheck, tests, and build.
2. **Given** a pull request contains a lint/type/build error, **When** CI runs, **Then** the overall CI status is failing and the logs clearly indicate which phase failed.
3. **Given** multiple commits are pushed to the same pull request branch, **When** CI starts for newer commits, **Then** superseded in-progress runs are cancelled so only the latest commit is being validated.

---

### User Story 2 - Pushes are validated too (Priority: P2)

As a maintainer, I want pushes to the default branch to run the same validation checks, so that changes merged into the mainline are always verified.

**Why this priority**: It catches breakages early and keeps branches healthy during development.

**Independent Test**: Push a commit to a non-default branch and confirm CI does not run; push to the default branch and confirm CI runs and reports results.

**Acceptance Scenarios**:

1. **Given** a commit is pushed to the default branch, **When** CI runs, **Then** the same validation phases execute and produce an overall pass/fail status.

---

### User Story 3 - CI runs are fast and not wasteful (Priority: P3)

As a contributor, I want CI runs to finish quickly and avoid redundant work, so I can iterate without waiting and without burning unnecessary CI minutes.

**Why this priority**: Fast feedback increases iteration speed; avoiding duplicate runs reduces noise and CI cost.

**Independent Test**: Run CI twice on the same branch with no dependency changes and compare total runtime; push multiple commits in quick succession and confirm older runs are cancelled.

**Acceptance Scenarios**:

1. **Given** dependencies and inputs have not changed, **When** CI runs repeatedly, **Then** subsequent runs complete faster due to reuse of cached work.
2. **Given** multiple CI runs are triggered for the same branch close together, **When** a newer run is queued or started, **Then** older in-progress runs are cancelled.

---

### Edge Cases

- Dependency inputs change (e.g., lockfile updated) and cached data must be safely invalidated.
- A push to the default branch and a pull request event both trigger runs for related commits; the system should avoid redundant in-progress work.
- Pull requests from forks run with reduced permissions; CI must still be safe and provide meaningful validation.
- Network/transient registry failures during dependency installation; the failure should be clear and actionable.
- The repository has no automated tests yet; CI should still include a test phase and clearly communicate the current test coverage expectations.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: CI MUST run automatically for every push to the default branch.
- **FR-002**: CI MUST run automatically for every pull request targeting the repository.
- **FR-003**: Each CI run MUST execute the following validation phases and report their outcomes: dependency installation, linting, type checking, automated tests, and a production build.
- **FR-004**: The overall CI status MUST be failing if any required phase fails.
- **FR-005**: CI MUST provide clear, human-readable logs that identify which phase failed and why.
- **FR-006**: CI MUST use caching to reduce runtime on repeated runs when inputs have not changed.
- **FR-007**: CI MUST use concurrency controls to avoid wasting work on superseded runs for the same branch/PR within the same trigger type (e.g., cancelling in-progress runs when a newer commit is pushed).
- **FR-008**: CI MUST be safe for contributions from forks and MUST NOT require access to repository secrets for basic verification.
- **FR-009**: CI MUST follow least-privilege access (read-only permissions unless a clear need is documented).
- **FR-010**: CI MUST produce a single, consistent overall status that can be used as a merge gate in branch protection rules.
- **FR-011**: If no tests are configured/found, the CI “tests” phase MUST still run and MUST pass while clearly logging that no tests were executed.
- **FR-012a**: CI MUST validate the project across a Node.js version matrix that is defined in CI and used as the single authoritative source of Node.js versions for all CI jobs.
- **FR-012b**: The Node.js version matrix MUST meet all of the following criteria:
  - It MUST include at least two supported LTS lines plus the current stable release line at any given time. This is the minimum steady-state requirement, not a cap.
  - It MAY temporarily include additional supported LTS lines during overlap periods (for example, when a new LTS line is introduced and the previous LTS line has not yet reached EOL).
  - Once an older LTS line reaches EOL and is removed, the matrix is not required to maintain more than this minimum. Specifically, you MUST NOT add non-LTS or otherwise unsupported majors solely to keep the number of lines above the minimum.
  - For this specification, a `supported LTS line` is a Node.js major version that is in either Active LTS or Maintenance LTS according to the official Node.js release schedule.
- **FR-012c**: The team MUST monitor the official Node.js release schedule, and any Node.js version that reaches End-of-Life (EOL) according to that schedule MUST be removed from the CI version matrix within 30 days of its published EOL date.
- **FR-012d**: After removing any EOL versions from the CI version matrix, the resulting matrix MUST still satisfy FR-012a–FR-012c. In particular, if the matrix previously contained more than two supported LTS lines during an overlap period, it is acceptable for it to drop back to the minimum described in FR-012b, and additional non-LTS or otherwise unsupported majors MUST NOT be added solely to backfill removed EOL lines.
- **FR-013**: Push-triggered CI runs MUST NOT cancel pull request-triggered CI runs (and vice versa). The concurrency key MUST include `${{ github.event_name }}` to enforce this.
- **FR-014**: CodeQL scanning MUST run for pull requests and pushes to the default branch, and on a weekly schedule; it MUST analyze `javascript-typescript` and follow least-privilege permissions.
- **FR-015**: Dependency Review MUST run for pull requests and MUST fail on newly introduced vulnerable dependency changes (at or above a configured severity threshold) and newly introduced dependencies with denied licenses. It MUST follow least-privilege permissions; PR comment summaries are allowed as an intentional exception and may require `pull-requests: write` (which MUST be documented).
- **FR-016**: GitHub Actions workflow definitions SHOULD be statically validated (e.g., with `actionlint`) to catch YAML/syntax errors before merge.

### Assumptions

- Dependency installation is deterministic via the repository’s lockfile and current package manager tooling (Yarn).
- The project has (or will have) standard local commands for linting, type checking, running automated tests, and building.
- If automated tests are not yet implemented, the CI “tests” phase will still run, pass, and clearly log that no tests are currently configured, rather than silently omitting the phase.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 (Target)**: For 100% of pull requests and pushes to the default branch, CI should start within 2 minutes and complete with a clear pass/fail status.
- **SC-002 (Target)**: When at least 3 commits are pushed to the same branch within 10 minutes, aim for only the latest CI run per trigger type to remain in progress; earlier runs of the same trigger type should be cancelled within 1 minute.
- **SC-003 (Aspirational)**: With unchanged dependency inputs, subsequent CI runs should be faster than a cold run due to caching; target at least 30% faster median runtime (measured across 5 consecutive runs).
- **SC-004**: Maintainers can enforce a merge gate using CI status such that merges are blocked when lint, typecheck, tests, or build fail.
