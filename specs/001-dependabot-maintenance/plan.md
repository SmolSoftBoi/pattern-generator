# Implementation Plan: Dependabot Maintenance

## Goal

Keep dependency updates predictable and low-noise by configuring Dependabot to:

- Open PRs for **JavaScript dependencies** (repo root) and **GitHub Actions**
- Run on a **weekly** cadence (Monday 07:30, Europe/London)
- **Group** JS non-major updates to reduce PR spam
- Apply consistent **labels** and **commit message prefixes**

## Tech Stack / Context

- App: Next.js (TypeScript)
- Package manager: Yarn (repo contains `yarn.lock`)
- CI: GitHub Actions workflows in `.github/workflows/`
- Dependency automation: GitHub Dependabot using `.github/dependabot.yml`

## Scope

### In scope

- Update `.github/dependabot.yml` (Dependabot v2)
  - `package-ecosystem: npm`, `directory: /`
  - Grouping for JS non-major updates
  - Labels + commit message conventions
  - Weekly schedule + PR limit
- Update `.github/dependabot.yml` for `github-actions`
  - Weekly schedule + PR limit
  - Labels + commit message conventions
- Align repository docs/spec notes about maintenance conventions

### Optional / follow-ups

- Add CI validation for `.github/dependabot.yml` (optional hardening) to catch malformed YAML earlier.

## Project Structure (relevant paths)

- Dependabot config: `.github/dependabot.yml`
- Workflows: `.github/workflows/*.yml`
- Node deps: `package.json`, `yarn.lock` (and potentially `package-lock.json`)
- Feature docs: `specs/001-dependabot-maintenance/*`

## Validation

- `.github/dependabot.yml` is valid YAML and uses supported Dependabot keys
- Config matches the feature requirements for schedule, grouping, and conventions
- (Manual) Dependabot UI shows updates enabled for npm + GitHub Actions

Note: Existing CI already covers lint/tests for the application; this feature focuses on dependency maintenance automation.

Additionally:

- The repository uses a single canonical lockfile (`yarn.lock`); `package-lock.json` is not present or referenced
