# Research: GitHub Actions CI Workflows

**Feature**: 001-github-actions-ci  
**Date**: 2026-01-02  
**Spec**: [spec.md](./spec.md)

This document records planning decisions for implementing reliable GitHub Actions CI for a Next.js + TypeScript + Yarn repository.

## Decision: Workflow set

**Chosen**: Create three workflows under `.github/workflows/`:

- `ci.yml`: installs deps, lint, typecheck, test (if present), build
- `codeql.yml`: CodeQL analysis for `javascript-typescript`
- `dependency-review.yml`: dependency review on pull requests

**Rationale**: Separates concerns (CI correctness vs security scanning vs supply-chain review). Keeps permissions scoped per workflow.

**Alternatives considered**:

- Extending the existing `nextjs.yml` deployment workflow to do all checks (rejected: deployment permissions are broader and the workflow goal differs).

## Decision: Triggers

**Chosen**:

- `ci.yml`: `pull_request` + `push` to default branch
- `codeql.yml`: `pull_request`, `push` to default branch, weekly schedule
- `dependency-review.yml`: `pull_request`

**Rationale**: PRs are the main quality gate; default-branch pushes validate what actually landed. Security workflows match standard GitHub recommendations.

**Alternatives considered**:

- Running CI on pushes to all branches (rejected: higher CI usage and more duplicate work; PR validation remains primary).

## Decision: Node.js version selection

**Chosen**: Validate the project against a Node.js version matrix defined in CI (single authoritative source).

**Initial matrix**: `20.x`, `22.x`, `current`.

**Rationale**: Cover the practical support envelope across Node release lines:

- **20.x**: older Maintenance LTS line, kept temporarily in the matrix primarily for backward-compatibility coverage while it remains within its upstream support period (see the official [Node.js release schedule](https://nodejs.org/en/about/previous-releases); Node.js 20.x is currently scheduled to reach EOL on 2026-04-30); per FR-012c, remove this line from the matrix within 30 days after that EOL date, updating this document if the upstream schedule changes
- **22.x**: current primary maintenance LTS line (expected default for most users)
- **current**: latest/current dist release line (early signal for upcoming changes)

**Note**: `current` resolves to the latest Node dist version.

**Implementation note**: the `current` entry is treated as a non-blocking canary in `ci.yml`. Some native modules (e.g., `canvas` pulled transitively via trianglify/react-trianglify) may lag behind new Node/V8 ABIs and fail to install/build even when system dependencies are present. Keeping `current` as canary preserves early warning without breaking required CI gates.

**Notes**:

- The matrix values are owned by `.github/workflows/ci.yml` and should be adjusted as Node support expectations change.

## Decision: Yarn mode + installs

**Chosen**:

- Enable Corepack to ensure Yarn availability.
- Detect Yarn Berry vs Classic:
  - Berry: `.yarnrc.yml` or `.yarn/` exists, or `package.json` has `packageManager: "yarn@..."`
  - Classic: otherwise
- Install:
  - Berry: `yarn install --immutable`
  - Classic: `yarn install`

**Rationale**: Aligns with the repo’s canonical package manager and lockfile and avoids lockfile drift in Berry.

**Alternatives considered**:

- Using `npm ci` (rejected: repo uses Yarn + `yarn.lock`).

## Decision: Caching

**Chosen**:

- Use `actions/setup-node@v4` built-in caching for Yarn.
- For Yarn Berry, also cache `.yarn/cache` (if applicable) for maximum impact.

**Rationale**: Built-in caching is minimal and reliable; Berry’s offline cache can significantly speed up installs.

**Alternatives considered**:

- Custom cache keys for `node_modules` (rejected: more brittle across platforms and package manager modes).

## Decision: Running lint/typecheck/test/build without inventing commands

**Chosen**:

- Run `yarn lint` and `yarn build` (these scripts exist in `package.json`).
- Typecheck:
  - If `package.json` has a `typecheck` script, run `yarn typecheck`.
  - Else run `yarn tsc --noEmit` (TypeScript is in dev dependencies).
- Tests:
  - If `package.json` has a `test` script, run `yarn test`.
  - Else run a no-op step that logs "no tests found/configured" and succeeds.

**Rationale**: Uses existing scripts where present; otherwise relies on standard tooling already in the dependency tree.

## Decision: Concurrency

**Chosen**: Use concurrency grouping by workflow + event + git ref, with `cancel-in-progress: true`.

**Key**: `${{ github.workflow }}-${{ github.event_name }}-${{ github.ref }}`

**Rationale**: Cancels superseded runs for the same PR ref or default-branch ref within the same trigger type, while ensuring PR-triggered runs do not cancel push-triggered runs (and vice versa).

## Decision: Least-privilege permissions

**Chosen**:

- Default `permissions: contents: read` at workflow level for `ci.yml`.
- CodeQL uses the minimum required permissions (`security-events: write`, plus read permissions as required by CodeQL).
- Dependency review will **keep PR commenting** enabled (comment summaries in the PR). This requires an explicit least-privilege exception: `pull-requests: write` for `dependency-review.yml`.

**Rationale**: Matches repository security posture (Principle IX) and the user requirement for least privilege.

## Follow-up: Workflow static validation (FR-016)

**Chosen**: Add a small `workflow-lint.yml` workflow that runs `actionlint` on PRs and default-branch pushes.

**Rationale**: Catches broken workflow syntax and common mistakes early with least-privilege permissions (`contents: read`). Keeps the main `ci.yml` focused on app validation.
