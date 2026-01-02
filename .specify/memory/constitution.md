<!--
Sync Impact Report

- Version change: [CONSTITUTION_VERSION] → 1.0.0
- Modified principles:
  - [PRINCIPLE_1_NAME] → I. User Value First
  - [PRINCIPLE_2_NAME] → II. Deterministic Generation
  - [PRINCIPLE_3_NAME] → III. Separate Concerns (Pure Core)
  - [PRINCIPLE_4_NAME] → IV. Type Safety & Input Validation
  - [PRINCIPLE_5_NAME] → V. Accessibility
  - (added) VI. Performance
  - (added) VII. Testing Discipline
  - (added) VIII. Quality Gates & CI
  - (added) IX. Security & Safety
  - (added) X. Docs & Maintainability
  - (added) XI. Dependency Hygiene
- Added sections:
  - Engineering Standards
  - Workflow & Review
- Removed sections: none
- Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - ✅ no changes needed: .specify/templates/spec-template.md
  - ⚠ pending / not present: .specify/templates/commands/*.md (directory not found in this repo)
- Deferred TODOs: none
-->

# Pattern Generator Constitution

## Core Principles

### I. User Value First

The app MUST provide a fast, predictable real-time preview with sensible defaults and a
"it just works" UX. The primary flow (adjust settings → preview updates → download PNG/SVG)
MUST remain smooth, understandable, and resilient to bad inputs.

Rationale: The product is a pattern generator; speed + predictability are the product.

### II. Deterministic Generation

Given the same explicit inputs (including size, palette/colors, gradients, cell size,
variance, and seed), the app MUST produce the same pattern output.

- If a "random" option exists, it MUST be explicitly selected by the user and clearly
  surfaced in the UI.
- When randomness is used, the effective seed MUST be visible and copyable, and users MUST
  be able to lock/pin it.
- Any change that affects determinism (e.g., trianglify version upgrades, algorithm changes,
  parameter reinterpretation) MUST be treated as a potential breaking change and documented.

Rationale: Determinism enables sharing, reproducibility, debugging, and stable downloads.

### III. Separate Concerns (Pure Core)

Pattern-generation logic MUST remain pure and testable.

- Core generation and color/gradient utilities MUST NOT depend on React, the DOM, browser
  globals, or side-effects.
- UI components MUST stay thin: compose state, call pure functions, render results.
- Export/download rendering SHOULD be isolated behind small adapter functions/modules.

Rationale: Purity keeps logic correct, testable, and portable; UI stays maintainable.

### IV. Type Safety & Input Validation

TypeScript MUST remain strict and the codebase MUST avoid `any`.

- User-provided inputs (sizes, colors, gradient settings, seeds, etc.) MUST be validated,
  sanitized, and clamped to safe ranges before use.
- Prefer explicit types, exhaustive unions, and `unknown` + narrowing over weakening types.
- `// @ts-ignore` MUST NOT be used. `// @ts-expect-error` is allowed only with a clear
  comment explaining why, and it MUST be removed once the underlying issue is resolved.

Rationale: This app is configuration-heavy; type safety prevents subtle UI and rendering bugs.

### V. Accessibility

The UI MUST be usable with keyboard and assistive technologies.

- All controls MUST be keyboard reachable with clear focus states.
- Inputs MUST have readable labels (and appropriate ARIA where necessary).
- Color choices SHOULD respect contrast where possible; if contrast cannot be guaranteed,
  the UI SHOULD provide guidance or warnings rather than silently failing.

Rationale: Customization tools are only useful if everyone can use them.

### VI. Performance

The app MUST keep the UI responsive.

- Expensive recalculations MUST be debounced/throttled where appropriate.
- The preview SHOULD update at interactive speeds; avoid blocking the main thread.
- Minimize re-renders and keep bundle size disciplined.

Rationale: Real-time preview is the core experience; jank erodes trust.

### VII. Testing Discipline

Core logic MUST have unit tests.

- Add unit tests for pattern generation determinism and color/gradient utilities.
- Add lightweight component tests for critical flows (e.g., changing settings updates
  preview, download actions available/triggered).
- Any bug fix MUST include a regression test when feasible.

Rationale: The app has many parameter combinations; tests prevent silent breakage.

### VIII. Quality Gates & CI

Quality gates MUST be enforced automatically.

- ESLint/formatting MUST run in CI.
- Tests MUST run in CI.
- Warnings MUST NOT be ignored without a written reason in the PR (or an inline comment
  where the warning is addressed).

Rationale: If quality is optional, it won’t happen (and the preview will eventually lie).

### IX. Security & Safety

The app MUST avoid unsafe patterns.

- No unsafe HTML injection (no `dangerouslySetInnerHTML` unless reviewed and justified).
- Downloads MUST be generated safely client-side.
- Avoid introducing unnecessary external calls/services; keep the app offline-capable unless
  a clear user value requires otherwise.

Rationale: A generator should not surprise users with network calls or unsafe rendering.

### X. Docs & Maintainability

Documentation MUST stay accurate and the codebase MUST stay understandable.

- Update `README.md` when behavior, configuration, or UX changes.
- Prefer small, well-named modules with stable public APIs.
- Refactors MUST preserve behavior or clearly document intentional behavior changes.

Rationale: Maintainability keeps iteration fast and lowers the cost of correctness.

### XI. Dependency Hygiene

Dependencies MUST remain minimal and intentional.

- Prefer existing stack conventions (Next.js + TypeScript + current UI/libs).
- Any new dependency MUST be justified (why needed vs existing capabilities) and its role
  documented (e.g., in PR description and/or `README.md` when user-visible).

Rationale: Small dependency graphs reduce bundle size, risk, and upgrade pain.

## Engineering Standards

- **Deterministic settings model**: There MUST be a single canonical settings object/type
  that represents the full pattern configuration used for generation and downloads.
- **Serialization**: Settings SHOULD be serializable (e.g., to query params or JSON) so
  users can share and reproduce patterns.
- **Client-side safety**: Clamp sizes/complexity so users cannot accidentally request
  pathological renders that freeze the page.
- **No hidden side-effects**: Any operation that triggers regeneration MUST be explicit in
  code, easy to trace, and (when user-facing) understandable in the UI.

## Workflow & Review

- All changes MUST keep preview behavior predictable and deterministic per Principle II.
- PRs SHOULD include:
  - a short note on user impact,
  - any determinism implications (seed/version),
  - and test coverage changes.
- If a principle must be violated temporarily, the PR MUST include:
  - a clear justification,
  - a safer alternative considered,
  - and a follow-up task/issue to restore compliance.

## Governance

This constitution supersedes local conventions, ad-hoc decisions, and template defaults.

- **Amendments**: Changes MUST be made via PR, with the motivation and impact described.
- **Review**: Amendments SHOULD be reviewed by at least one maintainer/reviewer.
- **Versioning policy**: This document uses semantic versioning (MAJOR.MINOR.PATCH).
  - MAJOR: Principle removed/redefined in a backward-incompatible way.
  - MINOR: New principle/section added or materially expanded.
  - PATCH: Clarifications, wording, typo fixes, non-semantic refinements.
- **Compliance checks**: Reviews MUST check changes against these principles. Feature plans
  SHOULD include a "Constitution Check" section enumerating relevant gates.

**Version**: 1.0.0 | **Ratified**: 2026-01-02 | **Last Amended**: 2026-01-02
