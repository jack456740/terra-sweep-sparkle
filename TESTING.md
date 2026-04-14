# Testing Guide

## Test Commands

- Unit + integration: `npm run test:run`
- Interactive unit runner: `npm run test:ui`
- End-to-end tests: `npm run test:e2e`
- Full CI-equivalent local check:
  1. `npm run lint`
  2. `npm run test:run`
  3. `npm run test:e2e`

## Test Layout

- `tests/unit/` for pure unit/component tests
- `tests/integration/` for cross-module integration tests
- `tests/e2e/` for browser-level user journey checks

## Patterns

- Prefer deterministic tests with explicit props and expected text.
- Mock external boundaries (network/WebSocket) in integration tests.
- Keep test names behavior-focused (what should happen).

## Coverage Targets

- Critical UI controls and service layer behavior should remain covered.
- Add or update tests whenever deployment/status flows are changed.
