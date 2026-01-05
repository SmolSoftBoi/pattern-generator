# Quickstart: CI Workflows

**Feature**: 001-github-actions-ci  
**Date**: 2026-01-02

This quickstart explains how to run the same checks locally that CI will run, and what CI will do on GitHub.

## Local prerequisites

- Node.js (CI will prefer `.nvmrc`, else `package.json` `engines.node`, else default to the repo’s expected Node major version)
- Yarn (CI enables Corepack)

## Run the CI checks locally

From the repo root:

- Install dependencies:
  - `yarn install`

- Lint:
  - `yarn lint`

- Typecheck:
  - If `typecheck` script exists: `yarn typecheck`
  - Otherwise: `yarn tsc --noEmit`

- Tests:
  - If `test` script exists: `yarn test`
  - Otherwise: there are currently no tests configured; CI will log this and continue.

- Build:
  - `yarn build`

## What runs on GitHub

### `ci.yml`

Runs on:

- `pull_request`
- `push` to the default branch

Per run, CI will:

- Checkout the repo
- Set up Node.js (version selection rules above)
- Enable Corepack
- Install dependencies (Yarn Classic vs Berry is detected)
- Use caching to speed up installs
- Run lint, typecheck, tests (if present), and build

Concurrency cancels superseded runs for the same workflow + ref.

### `codeql.yml`

Runs CodeQL analysis for `javascript-typescript` on PRs, default-branch pushes, and a weekly schedule.

### `dependency-review.yml`

Runs dependency review on PRs to detect known vulnerable dependency changes and suspicious license changes.
