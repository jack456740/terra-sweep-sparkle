# Sprint Plan: Secure Hardware Comm & Traceability

> [!NOTE]
> This sprint transitions the dashboard toward secure hardware communication and automated documentation. Scope and dependencies have been strictly optimized to prevent bottlenecks and ensure a balanced workload across the 4-person team.

## 🎯 Sprint Goal
**Establish secure hardware communications by implementing the backend API service layer, enforcing component traceability via automated documentation, and introducing role-based authentication for safe remote robot operations.**

## 📋 Sprint Backlog (Optimized Tasks)

### 1. Hardware Integration & Contracts
*Focus: Establishing data schemas first, followed by the mockable network layer.*

- [ ] **API-01: Define Data Contracts with Zod**
  - **Task:** Define Zod schemas for the expected hardware payloads (e.g., `BatteryPayloadSchema`, `LocationPayloadSchema`) inside `src/lib/schemas.ts`.
  - **Dependency:** None. *Must be completed first to define the REST contract.*
- [ ] **API-02: Setup API Client & Control Endpoints**
  - **Task:** Create `src/lib/apiClient.ts` configured with `axios`. Implement `deployRobot()` and `stopRobot()` endpoints, wrapping the incoming and outgoing data with the schemas defined in `API-01`.
  - **Dependency:** Requires `API-01`.
- [ ] **API-03: Implement Telemetry Mock Server (MSW)**
  - **Task:** Setup Mock Service Worker (MSW) to intercept the new commands and return 200 OK responses to unblock UI interaction testing while hardware is offline.
  - **Dependency:** Requires `API-02`.
- [ ] **API-04: Connect Zustand Store to Endpoints**
  - **Task:** Refactor the existing `useRobotStore.ts` to call the new API endpoints rather than relying on local `setTimeout` functions.
  - **Dependency:** Requires `API-03`.

### 2. Traceability & Automated Documentation (CI/CD)
*Focus: Replacing brittle custom AST parsing with standard, foolproof linting.*

- [ ] **DOC-01: Configure ESLint JSDoc Rules**
  - **Task:** Instead of a custom AST parser, configure `eslint-plugin-jsdoc` to enforce that all critical components in `src/components` contain valid TSDoc tags (specifically looking for `@see SR-UI-XX`).
  - **Dependency:** None.
- [ ] **DOC-02: Integrate Linting into GitHub Actions**
  - **Task:** Add the new linting check to `.github/workflows/ci.yml`. Configure it to fail the build on pull requests if a developer adds a component without standard documentation traceability.
  - **Dependency:** Requires `DOC-01`.

### 3. Security & Validation (Auth UI & Routing)
*Focus: Concurrent development of the Auth state, routing limits, and visual Login interfaces.*

- [ ] **SEC-01: Configure Identity Provider & Auth Store**
  - **Task:** Set up a lightweight authentication provider (e.g., Supabase Auth). Initialize a simple `useAuthStore` to track `isAuthenticated` state. Provide mocked tokens for local developer environments.
  - **Dependency:** None.
- [ ] **SEC-02: Implement Protected Routes**
  - **Task:** Create a `<ProtectedRoute>` component in `App.tsx` that reads the boolean from `SEC-01`. Redirect unauthenticated users away from `/dashboard` (temporarily to a blank screen or `/login` route).
  - **Dependency:** Requires `SEC-01`.
- [ ] **SEC-03: Create Login Component UI**
  - **Task:** Build a high-fidelity `Login.tsx` functional view using shadcn-ui forms (Email/Password). Hook it up to the Auth Store so it can flip the boolean.
  - **Dependency:** None. Can be built concurrently with `SEC-01` by mocking the login submit handler.

## 👥 Suggested Task Ownership (Balanced 4-Person Team)

To eliminate workflow bottlenecks, Core Frontend resources have been shifted to assist with the UI portions of Authentication, while Zod schemas have been front-loaded to prevent API reworking.

| Team Member | Role Focus | Granular Task Ownership |
| :--- | :--- | :--- |
| **Engineer A** | **Backend/Integration Lead** | `API-02`, `API-03` (Heavy networking and MSW logic) |
| **Engineer B** | **Frontend Tooling/DevOps** | `DOC-01`, `DOC-02` (Standardizing CI/CD and ESLint configs) |
| **Engineer C** | **Security/Auth Lead** | `SEC-01`, `SEC-02` (Provider setup and routing protections) |
| **Engineer D** | **Core Frontend / SDET** | `API-01`, `API-04`, `SEC-03` (Data schemas, Zustand refactoring, and UI views) |
