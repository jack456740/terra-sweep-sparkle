# Unused Components Audit

Date: 2026-04-14

## Scope

- Reviewed component usage in `src/components/` and key route entry points.
- Focused on removal candidates that are safe and low-risk.

## Findings

- `src/components/Header.tsx`
  - Not referenced by current route/page composition.
  - Candidate for removal if not needed for future layout experiments.

- `src/components/NavLink.tsx`
  - Lightly used in tests/integration scenarios.
  - Keep for now unless routing layer is simplified further.

## Decision

- No component files removed in this pass to avoid accidental breakage.
- Recommended next cleanup:
  1. Remove `Header.tsx` if product confirms no re-use.
  2. Re-run tests and verify no import regressions.
