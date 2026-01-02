# Feature Specification: Dependabot Maintenance

**Feature Branch**: `001-dependabot-maintenance`  
**Created**: 2026-01-02  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## Clarifications

### Session 2026-01-02

- Q: Lockfile & package manager policy → A: Standardize on Yarn (keep `yarn.lock`; remove/ignore `package-lock.json`).
- Q: Weekly schedule timing → A: Mondays 07:30 Europe/London.
- Q: Update grouping strategy → A: Group JavaScript **non-major** updates into two PRs (prod vs dev). Major updates are **not grouped**.
- Q: Labels → A: Apply `dependencies` label to all Dependabot PRs.
- Q: Commit message prefixes → A: Use `deps` for JavaScript dependency updates and `ci` for GitHub Actions updates (include scope).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Predictable weekly dependency PRs (Priority: P1)

As a maintainer, I want Dependabot to open a small and predictable set of weekly PRs for JavaScript dependencies and GitHub Actions so dependency upkeep is routine and low-noise.

**Why this priority**: This is the core value of the feature: predictable maintenance without PR spam.

**Independent Test**: Validate that `.github/dependabot.yml` contains the expected ecosystems, schedule, grouping, labels, and commit message conventions.

**Acceptance Scenarios**:

1. **Given** the repository has `.github/dependabot.yml`, **When** I inspect the `updates` config, **Then** it contains exactly two entries: `package-ecosystem: "npm"` and `package-ecosystem: "github-actions"`, both with `directory: "/"`.
2. **Given** the Dependabot config, **When** I inspect the schedule, **Then** both ecosystems run `weekly` on `monday` at `07:30` with timezone `Europe/London` and `open-pull-requests-limit: 5`.
3. **Given** the JavaScript (`npm`) config, **When** I inspect grouping, **Then** it defines two groups `js-prod-non-major` and `js-dev-non-major` that include only `minor` and `patch` updates.
4. **Given** the config, **When** I inspect metadata conventions, **Then** both ecosystems apply label `dependencies` and use commit prefixes `deps` (npm) and `ci` (github-actions) with `include: scope`.

---

### User Story 2 - Canonical lockfile to avoid conflicting updates (Priority: P2)

As a maintainer, I want the repo to use a single canonical lockfile so dependency automation doesn’t create conflicting PRs or unpredictable install behavior.

**Why this priority**: Multiple lockfiles commonly cause conflicting update PRs and non-deterministic installs.

**Independent Test**: Confirm the repo uses Yarn and `package-lock.json` is not present/referenced.

**Acceptance Scenarios**:

1. **Given** the repository root, **When** I check for lockfiles, **Then** `yarn.lock` exists and `package-lock.json` does not.
2. **Given** CI workflows, **When** I inspect `.github/workflows/nextjs.yml`, **Then** caching/hash keys do not reference `package-lock.json`.

---

### User Story 3 - Prevent config drift with CI validation (Priority: P3)

As a maintainer, I want CI to catch invalid or malformed Dependabot configuration so automation stays reliable.

**Why this priority**: This is a low-cost quality gate that prevents silent breakage.

**Independent Test**: Introduce an invalid YAML change to `.github/dependabot.yml` in a branch and confirm CI fails.

**Acceptance Scenarios**:

1. **Given** a pull request changes `.github/dependabot.yml`, **When** the CI check runs, **Then** it fails if the YAML is invalid.

---

### Edge Cases

- Multiple lockfiles present (e.g., `yarn.lock` + `package-lock.json`) causing conflicting updates.
- Major version updates producing more PRs than expected (acceptable; non-major updates are grouped to reduce noise).
- Invalid YAML/unsupported keys in `.github/dependabot.yml` preventing Dependabot from running.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-DB-001**: Repository MUST standardize on **Yarn** for dependency installs (canonical lockfile: `yarn.lock`).
- **FR-DB-002**: Repository MUST remove `package-lock.json` and MUST NOT reference it in CI/workflows.
- **FR-DB-003**: Dependabot MUST manage JavaScript dependencies via `package-ecosystem: "npm"` in directory `/`.
- **FR-DB-004**: Dependabot MUST manage GitHub Actions via `package-ecosystem: "github-actions"` in directory `/`.
- **FR-DB-005**: Dependabot MUST run weekly on Mondays at 07:30 in timezone `Europe/London` for both ecosystems.
- **FR-DB-006**: Dependabot MUST set `open-pull-requests-limit: 5` for both ecosystems.
- **FR-DB-007**: Dependabot MUST group JavaScript non-major updates into:
  - `js-prod-non-major` (`dependency-type: production`, `patterns: ["*"]`, `update-types: ["minor", "patch"]`)
  - `js-dev-non-major` (`dependency-type: development`, `patterns: ["*"]`, `update-types: ["minor", "patch"]`)
- **FR-DB-008**: Dependabot PRs MUST be labeled `dependencies`.
- **FR-DB-009**: Dependabot commit messages MUST use:
  - prefix `deps` for JavaScript dependency updates
  - prefix `ci` for GitHub Actions updates
  - and MUST include scope.
- **FR-DB-010**: CI MUST validate `.github/dependabot.yml` on pull requests and fail on invalid YAML.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-DB-001**: Dependabot creates no more than 5 open update PRs per ecosystem at any time (enforced by config).
- **SC-DB-002**: All Dependabot PRs carry the `dependencies` label.
- **SC-DB-003**: JavaScript non-major dependency updates are reduced to at most two PRs per update run (prod vs dev groups).
- **SC-DB-004**: Invalid `.github/dependabot.yml` changes are caught by CI (workflow fails on malformed YAML).
