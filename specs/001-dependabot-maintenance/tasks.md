---

description: "Tasks for Dependabot maintenance"
---

# Tasks: Dependabot Maintenance

**Input**: Design documents from `specs/001-dependabot-maintenance/`

**Available docs**:
- `specs/001-dependabot-maintenance/spec.md`
- `specs/001-dependabot-maintenance/plan.md`

**Tests**: This maintenance change relies on configuration validation rather than unit tests. CI MUST include a lightweight check that fails on invalid `.github/dependabot.yml` (see T015) to satisfy the project's quality gate expectations.

## Format

Each task follows:

- [ ] `T###` optional `[P]` optional `[US#]` then description with exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure the repo has the prerequisites and clarity needed for predictable dependency updates.

- [x] T001 Confirm the canonical package manager is Yarn and document it in `README.md`
- [x] T002 Capture the final Dependabot conventions (labels + commit prefixes + schedule) in `specs/001-dependabot-maintenance/spec.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Baseline checks before changing automation.

- [x] T003 Audit existing dependency automation and workflows and record findings in `specs/001-dependabot-maintenance/spec.md`:
	- Inspect `.github/dependabot.yml` for enabled ecosystems, schedule, labels, commit prefixes, grouping
	- Inspect `.github/workflows/*.yml` for package manager assumptions (Yarn vs npm), and any `package-lock.json` references
	- Inspect root lockfiles (`yarn.lock`, `package-lock.json`) and confirm which is canonical
	- Output: add a short **"Audit notes"** subsection under `spec.md` → `## Clarifications` listing any mismatches and the intended resolution

**Checkpoint**: Repository dependency maintenance baseline documented.

---

## Phase 3: User Story 1 — Predictable weekly Dependabot PRs (Priority: P1) 🎯 MVP

**Goal**: As a maintainer, I get a small, predictable set of weekly PRs for JS deps and GitHub Actions with consistent metadata.

**Independent Test**: Open `.github/dependabot.yml` and verify it includes exactly two update configs (npm + github-actions) matching schedule, grouping, labels, and commit message prefixes.

### Implementation for User Story 1

- [x] T004 [US1] Update JavaScript dependency settings in `.github/dependabot.yml` (npm ecosystem, `/`, weekly Mon 07:30 Europe/London, PR limit 5)
- [x] T005 [US1] Add grouping for JS non-major updates in `.github/dependabot.yml` (`js-prod-non-major`, `js-dev-non-major`)
- [x] T006 [US1] Set JS labels + commit message conventions in `.github/dependabot.yml` (labels: `["dependencies"]`, commit prefix `deps`)
- [x] T007 [US1] Update GitHub Actions settings in `.github/dependabot.yml` (github-actions ecosystem, `/`, weekly Mon 07:30 Europe/London, PR limit 5)
- [x] T008 [US1] Set Actions labels + commit message conventions in `.github/dependabot.yml` (labels: `["dependencies"]`, commit prefix `ci`)
- [x] T009 [US1] Keep `.github/dependabot.yml` tidy and commented; remove unsupported/unused keys and ensure YAML remains valid

**Checkpoint**: Dependabot config matches the MVP requirements exactly.

---

## Phase 4: User Story 2 — Reduce noise and ambiguity from lockfiles (Priority: P2)

**Goal**: As a maintainer, I don’t get redundant/conflicting dependency PRs caused by multiple lockfiles.

**Independent Test**: Only one lockfile is treated as canonical (Yarn). CI/workflows don’t reference the removed lockfile.

### Implementation for User Story 2

- [x] T010 [P] [US2] Remove `package-lock.json` from the repository root (standardize on Yarn per `yarn.lock`)
- [x] T011 [US2] Update `.github/workflows/nextjs.yml` to stop hashing/using `package-lock.json` in cache keys (keep Yarn-only hashing)
- [x] T012 [US2] Verify README install/run instructions use Yarn and do not mention npm lockfiles (`README.md`)

**Checkpoint**: Lockfile policy is consistent and repo automation is aligned.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Make the maintenance approach easy to understand and evolve.

- [x] T013 [P] Final documentation pass: ensure `specs/001-dependabot-maintenance/spec.md` contains no template boilerplate and matches `.github/dependabot.yml`
- [x] T014 Add a short "Dependency maintenance" section to `README.md` describing labels/prefixes/schedule and where to change them (`.github/dependabot.yml`)
- [x] T015 Add CI validation for `.github/dependabot.yml` using a dedicated workflow:
	- Create `.github/workflows/validate-dependabot.yml`
	- Trigger on `pull_request` when `.github/dependabot.yml` changes
	- Steps: checkout → `actions/setup-python@v5` (Python 3.12) → `pip install yamllint==1.35.1` → `yamllint .github/dependabot.yml`
	- Add repo-root `.yamllint.yml` with a minimal ruleset (no style bikeshedding) so the check is stable:
	  - enable: `yaml` (syntax), `document-start` (allow absence), `indentation` (consistent)
	  - disable: `trailing-spaces`
	  - disable: `line-length`


---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** → blocks nothing but clarifies intent
- **Phase 2 (Foundational)** → should be done before changing automation
- **US1 (Phase 3)** → depends on Phases 1–2
- **US2 (Phase 4)** → MUST be completed before this feature is considered done (required by spec)
- **Polish (Phase 5)** → after desired stories are complete

### User Story Dependencies

- **US1 (P1)**: Independent; delivers the MVP
- **US2 (P2)**: Independent from a feature perspective, but improves predictability of US1 by removing lockfile ambiguity

---

## Parallel execution examples

### US1 parallel opportunities

- None recommended (single shared file `.github/dependabot.yml` is a merge hotspot)

### US2 parallel opportunities

- T010 can be done in parallel with documentation updates, but should land before workflow cache key changes.

---

## Implementation Strategy

### MVP first

1. Complete Phases 1–2 quickly (document decisions)
2. Implement US1 (Dependabot config) and validate file contents
3. Complete US2 (lockfile simplification) to meet the canonical lockfile requirement (required)

### Incremental delivery

- Land US1 first so Dependabot behavior is improved immediately.
- Land US2 next to prevent conflicting lockfile updates over time.
