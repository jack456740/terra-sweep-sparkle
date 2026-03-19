# Technical Debt Remediation - Task Assignment
## 3-Person Team Breakdown

**Project:** Terra Sweep Sparkle (Clean Bot Dashboard)  
**Date:** January 22, 2026  
**Total Technical Debt Items:** 9  
**Distribution Strategy:** Parallel workstreams with minimal dependencies

---

## Team Member Assignments

### 👤 **Person 1: Backend Integration & Error Handling Specialist**
**Focus:** API Layer, Error Handling, Authentication Foundation

#### Task 1.0: Remove Lovable.dev Platform Dependencies (Platform Independence) 🔴 CRITICAL
**Priority:** 🔴 **CRITICAL - Highest Priority**  
**Estimated Effort:** 3-4 hours  
**Dependencies:** None  
**Goal:** Make application independent and run as a "real" standalone app

**Context:** The application is currently dependent on Lovable.dev platform. The goal is to completely decouple from Lovable and make this a production-ready, independent application that can be deployed anywhere without vendor lock-in.

**Deliverables:**
1. Remove Lovable dependencies from codebase
   - Remove `lovable-tagger` from `package.json` devDependencies
   - Remove `componentTagger()` import and usage from `vite.config.ts`
   - Verify build works without Lovable dependencies

2. Update package metadata
   - Change package name from "vite_react_shadcn_ts" to "terra-sweep-sparkle"
   - Add proper description, version (0.1.0), and project metadata
   - Update package.json with project information

3. Rewrite README.md
   - Remove all Lovable.dev references and instructions
   - Add standard npm/yarn installation instructions
   - Add independent deployment instructions (Vercel, Netlify, AWS, etc.)
   - Add project-specific documentation and getting started guide
   - Document development workflow without Lovable

4. Update branding and meta tags
   - Update `index.html` meta tags (remove Lovable OpenGraph images)
   - Remove Lovable Twitter references
   - Add project-specific branding

5. Set up independent CI/CD pipeline
   - Create `.github/workflows/ci.yml` for automated testing
   - Create `.github/workflows/deploy.yml` for automated deployment
   - Configure build and test steps

6. Create deployment configuration
   - `vercel.json` or `netlify.toml` (choose platform)
   - `.env.example` for environment variables
   - Deployment documentation

7. Verify independence
   - Test build without Lovable dependencies
   - Test deployment to independent platform (Vercel/Netlify)
   - Verify all functionality works post-decoupling
   - Confirm no Lovable references remain in codebase

**Acceptance Criteria:**
- [ ] `lovable-tagger` completely removed from package.json
- [ ] `vite.config.ts` has no Lovable imports or references
- [ ] Package.json has proper project name and metadata
- [ ] README.md has no Lovable references, includes independent deployment instructions
- [ ] index.html meta tags updated (no Lovable branding)
- [ ] GitHub Actions CI/CD pipeline configured
- [ ] Application builds successfully without Lovable dependencies
- [ ] Application deploys to independent platform (Vercel/Netlify)
- [ ] All functionality works post-decoupling
- [ ] Application functions as standalone "real" application

**Files to Create/Modify:**
- `package.json` (remove lovable-tagger, update metadata)
- `vite.config.ts` (remove componentTagger import and usage)
- `README.md` (complete rewrite - remove Lovable references)
- `index.html` (update meta tags)
- `.github/workflows/ci.yml` (new)
- `.github/workflows/deploy.yml` (new)
- `vercel.json` or `netlify.toml` (new)
- `.env.example` (new)

**Success Criteria:**
- Application is completely independent of Lovable.dev
- Application can be deployed to any platform (Vercel, Netlify, AWS, etc.)
- No vendor lock-in
- Application functions as production-ready standalone system

---

#### Task 1.1: Implement Backend API Integration Layer
**Priority:** 🔴 Critical  
**Estimated Effort:** 8-10 hours  
**Dependencies:** None (foundational work)

**Deliverables:**
1. Create API client module (`src/lib/api/client.ts`)
   - HTTP client wrapper (axios or fetch-based)
   - Request/response interceptors
   - Error handling middleware
   - TypeScript types for API responses

2. Implement API service layer (`src/services/robotService.ts`)
   - `deployRobot()` method
   - `stopRobot()` method
   - `getRobotStatus()` method
   - `subscribeToRobotUpdates()` WebSocket method

3. Create environment configuration
   - `.env.example` with API endpoint variables
   - `src/lib/config.ts` for environment-based config
   - Support for development/staging/production environments

4. Replace setTimeout simulations
   - Update `DashboardSection.tsx` to use API calls
   - Remove hardcoded delays
   - Implement proper async/await patterns

**Acceptance Criteria:**
- [ ] API client handles network errors gracefully
- [ ] All robot operations use real API calls (no setTimeout)
- [ ] WebSocket connection established for real-time updates
- [ ] Environment variables properly configured
- [ ] API service methods have TypeScript types
- [ ] Code passes linting and type checking

**Files to Create/Modify:**
- `src/lib/api/client.ts` (new)
- `src/lib/api/types.ts` (new)
- `src/services/robotService.ts` (new)
- `src/lib/config.ts` (new)
- `.env.example` (new)
- `src/components/DashboardSection.tsx` (modify)

---

#### Task 1.2: Implement Error Handling and Error Boundaries
**Priority:** 🔴 Critical  
**Estimated Effort:** 4-6 hours  
**Dependencies:** Task 1.1 (needs API layer to handle errors)

**Deliverables:**
1. Create React Error Boundary component
   - `src/components/ErrorBoundary.tsx`
   - Fallback UI for component errors
   - Error logging mechanism

2. Add error handling to async operations
   - Try-catch blocks in all API calls
   - Error states in components
   - User-friendly error messages

3. Implement error recovery mechanisms
   - Retry logic with exponential backoff
   - Error state management
   - Recovery actions for users

4. Create error handler utility
   - `src/lib/errorHandler.ts`
   - Centralized error processing
   - Error logging service integration (optional: Sentry)

**Acceptance Criteria:**
- [ ] Error Boundary catches all React component errors
- [ ] All API calls have try-catch error handling
- [ ] Error states displayed to users with recovery options
- [ ] Retry logic implemented for transient failures
- [ ] Error messages are user-friendly (no technical jargon)
- [ ] Errors are logged for debugging

**Files to Create/Modify:**
- `src/components/ErrorBoundary.tsx` (new)
- `src/lib/errorHandler.ts` (new)
- `src/components/DashboardSection.tsx` (modify - add error handling)
- `src/App.tsx` (modify - wrap with ErrorBoundary)

---

#### Task 1.3: Extract Constants and Configuration
**Priority:** 🟡 Medium  
**Estimated Effort:** 2-3 hours  
**Dependencies:** None

**Deliverables:**
1. Create constants file
   - `src/lib/constants.ts`
   - Robot status enums/constants
   - Location strings
   - Battery thresholds

2. Create configuration file
   - `src/lib/config.ts` (extend from Task 1.1)
   - Timing delays (configurable)
   - Progress increments
   - Business logic thresholds

3. Add documentation to constants
   - JSDoc comments explaining each constant
   - Link to user stories where applicable
   - Business logic explanations

**Acceptance Criteria:**
- [ ] All magic strings extracted to constants
- [ ] All hardcoded values moved to config
- [ ] Constants have JSDoc documentation
- [ ] Configuration values can be overridden via environment variables
- [ ] No magic numbers/strings in component code

**Files to Create/Modify:**
- `src/lib/constants.ts` (new)
- `src/lib/config.ts` (modify/extend)
- `src/components/DashboardSection.tsx` (modify - use constants)
- `src/components/RobotStatusCard.tsx` (modify - use constants)

---

**Person 1 Total Estimated Time:** 17-23 hours (includes Task 1.0)

---

### 👤 **Person 2: State Management & Type Safety Specialist**
**Focus:** Architecture Refactoring, Type Safety, Code Quality

#### Task 2.1: Refactor Monolithic State Management
**Priority:** 🔴 Critical  
**Estimated Effort:** 6-8 hours  
**Dependencies:** Task 1.1 (will use API service layer)

**Deliverables:**
1. Set up global state management
   - Install Zustand (or chosen state management library)
   - Create `src/store/robotStore.ts`
   - Define store structure and actions

2. Extract state logic from DashboardSection
   - Move robot state to Zustand store
   - Create actions: `deployRobot`, `stopRobot`, `updateStatus`
   - Implement state selectors

3. Refactor DashboardSection component
   - Use Zustand hooks instead of local state
   - Separate UI logic from business logic
   - Maintain component functionality

4. Add state persistence
   - localStorage integration for state persistence
   - State recovery on page refresh
   - Session management

**Acceptance Criteria:**
- [ ] All robot state managed in Zustand store
- [ ] DashboardSection uses store hooks (no local useState for robot data)
- [ ] State persists across page refreshes
- [ ] No prop drilling for robot state
- [ ] Store actions are testable in isolation
- [ ] Component re-renders only when relevant state changes

**Files to Create/Modify:**
- `src/store/robotStore.ts` (new)
- `src/store/types.ts` (new)
- `src/components/DashboardSection.tsx` (refactor)
- `package.json` (add Zustand dependency)

---

#### Task 2.2: Enable Strict TypeScript Configuration
**Priority:** 🟠 High  
**Estimated Effort:** 4-6 hours  
**Dependencies:** None (can be done in parallel)

**Deliverables:**
1. Update TypeScript configuration
   - Enable `strict: true` in `tsconfig.json`
   - Enable `noImplicitAny: true`
   - Enable `strictNullChecks: true`
   - Enable `noUnusedLocals: true`
   - Enable `noUnusedParameters: true`

2. Fix type errors incrementally
   - Fix implicit any types
   - Add proper null/undefined handling
   - Remove unused variables and parameters
   - Add explicit type annotations where needed

3. Enhance type definitions
   - Create proper interfaces for all data structures
   - Add generic types where appropriate
   - Improve function return types

4. Configure ESLint for TypeScript
   - Add TypeScript-specific ESLint rules
   - Catch type issues in linting

**Acceptance Criteria:**
- [ ] TypeScript compiles with strict mode enabled
- [ ] No implicit any types in codebase
- [ ] All null/undefined cases properly handled
- [ ] No unused variables or parameters
- [ ] ESLint passes with TypeScript rules
- [ ] All functions have explicit return types

**Files to Create/Modify:**
- `tsconfig.json` (modify)
- `eslint.config.js` (modify - add TypeScript rules)
- All TypeScript files in `src/` (fix type errors)

---

#### Task 2.3: Component Documentation and Traceability
**Priority:** 🟡 Medium  
**Estimated Effort:** 3-4 hours  
**Dependencies:** None

**Deliverables:**
1. Add TSDoc comments to all components
   - Document component purpose
   - Document all props with `@param`
   - Document return types
   - Add usage examples where helpful

2. Link components to requirements
   - Add `@see` tags linking to user stories
   - Reference PROJECT-RESET-REPORT.md where applicable
   - Document business logic decisions

3. Create component documentation structure
   - Add README.md for complex components
   - Document component dependencies
   - Explain non-obvious logic

**Acceptance Criteria:**
- [ ] All exported components have TSDoc comments
- [ ] All props are documented with types and descriptions
- [ ] Components link to user stories/requirements
- [ ] Complex logic has inline comments
- [ ] Documentation is clear for new developers

**Files to Create/Modify:**
- All component files in `src/components/` (add TSDoc)
- `src/components/DashboardSection/README.md` (new - if needed)

---

**Person 2 Total Estimated Time:** 13-18 hours

---

### 👤 **Person 3: Testing & Verification Specialist**
**Focus:** Test Coverage, Quality Assurance, CI/CD

#### Task 3.1: Set Up Testing Infrastructure
**Priority:** 🔴 Critical  
**Estimated Effort:** 3-4 hours  
**Dependencies:** None (foundational)

**Deliverables:**
1. Install and configure testing framework
   - Install Vitest (recommended for Vite) or Jest
   - Install React Testing Library
   - Install testing utilities (user-event, etc.)

2. Create test configuration
   - `vitest.config.ts` or `jest.config.js`
   - Configure test environment
   - Set up test utilities and helpers

3. Create test file structure
   - Set up `src/__tests__/` or co-located `.test.tsx` files
   - Create test utilities (`test-utils.tsx`)
   - Set up mock data factories

4. Configure CI/CD for testing
   - GitHub Actions workflow (or chosen CI)
   - Run tests on every commit
   - Set up coverage reporting

**Acceptance Criteria:**
- [ ] Testing framework installed and configured
- [ ] Test configuration file created
- [ ] Test utilities and helpers available
- [ ] CI/CD pipeline runs tests automatically
- [ ] Coverage reporting configured
- [ ] Tests can be run with `npm test`

**Files to Create/Modify:**
- `vitest.config.ts` or `jest.config.js` (new)
- `src/test-utils.tsx` (new)
- `.github/workflows/test.yml` (new)
- `package.json` (add test scripts and dependencies)

---

#### Task 3.2: Write Unit Tests for Components
**Priority:** 🔴 Critical  
**Estimated Effort:** 6-8 hours  
**Dependencies:** Task 3.1, Task 2.1 (state management)

**Deliverables:**
1. Test utility functions
   - `src/lib/utils.ts` tests
   - Custom hooks tests (`use-toast.ts`, `use-mobile.tsx`)
   - Helper function tests

2. Test UI components
   - `DashboardSection.test.tsx` (critical)
   - `DeployButton.test.tsx`
   - `RobotStatusCard.test.tsx`
   - `BatteryIndicator.test.tsx`
   - `CleaningProgress.test.tsx`

3. Test state management
   - Zustand store tests (if Person 2 completes Task 2.1)
   - State transition tests
   - Action tests

4. Achieve minimum coverage
   - Target: 80% code coverage
   - Focus on critical paths first
   - Test edge cases and error states

**Acceptance Criteria:**
- [ ] All critical components have unit tests
- [ ] Utility functions have 100% test coverage
- [ ] State management logic is tested
- [ ] Error states are tested
- [ ] Edge cases are covered
- [ ] Minimum 80% code coverage achieved
- [ ] All tests pass consistently

**Files to Create:**
- `src/lib/utils.test.ts` (new)
- `src/hooks/use-toast.test.ts` (new)
- `src/components/DashboardSection.test.tsx` (new)
- `src/components/DeployButton.test.tsx` (new)
- `src/components/RobotStatusCard.test.tsx` (new)
- `src/components/BatteryIndicator.test.tsx` (new)
- `src/components/CleaningProgress.test.tsx` (new)
- `src/store/robotStore.test.ts` (new - if store exists)

---

#### Task 3.3: Write Integration and E2E Tests
**Priority:** 🟠 High  
**Estimated Effort:** 4-6 hours  
**Dependencies:** Task 3.1, Task 1.1 (API layer), Task 2.1 (state management)

**Deliverables:**
1. Integration tests for robot deployment flow
   - Test complete deploy → cleaning → return flow
   - Test error scenarios (API failures)
   - Test state persistence

2. API service integration tests
   - Mock API responses
   - Test error handling
   - Test WebSocket connections

3. E2E tests (optional but recommended)
   - Set up Playwright or Cypress
   - Test critical user journeys
   - Test across browsers

4. Test documentation
   - Document testing patterns
   - Create test data guidelines
   - Document how to run tests

**Acceptance Criteria:**
- [ ] Integration tests cover robot deployment flow
- [ ] API service layer is tested with mocks
- [ ] E2E tests cover critical user journeys (if implemented)
- [ ] Tests are maintainable and well-documented
- [ ] Test data is reusable and consistent

**Files to Create:**
- `src/__tests__/integration/robotFlow.test.tsx` (new)
- `src/services/__tests__/robotService.test.ts` (new)
- `e2e/deploy-robot.spec.ts` (new - if E2E setup)
- `TESTING.md` (new - documentation)

---

#### Task 3.4: Audit and Clean Up Unused Components
**Priority:** 🟡 Medium  
**Estimated Effort:** 2-3 hours  
**Dependencies:** None

**Deliverables:**
1. Audit UI component usage
   - Scan codebase for component imports
   - Identify unused components in `src/components/ui/`
   - Document components that are intentionally unused

2. Remove or tree-shake unused components
   - Remove truly unused components
   - Configure bundler to tree-shake unused code
   - Update component exports

3. Bundle analysis
   - Run bundle size analysis
   - Identify large dependencies
   - Document bundle optimization opportunities

**Acceptance Criteria:**
- [ ] All unused components identified
- [ ] Unused components removed or documented
- [ ] Bundle size analyzed and optimized
- [ ] No dead code in production bundle

**Files to Create/Modify:**
- `UNUSED-COMPONENTS.md` (new - documentation)
- `src/components/ui/` (remove unused files)
- Bundle analysis report

---

**Person 3 Total Estimated Time:** 15-21 hours

---

## Task Dependencies & Timeline

```
Week 1:
├── Person 1: Lovable Decoupling (Task 1.0) ─────┐ (CRITICAL - do first)
├── Person 1: API Layer (Task 1.1) ──────────────┤
├── Person 2: State Management (Task 2.1) ────────┤ (depends on 1.1)
└── Person 3: Test Setup (Task 3.1) ─────────────┘

Week 2:
├── Person 1: Error Handling (Task 1.2) ─────────┐
├── Person 2: TypeScript Strict (Task 2.2) ──────┤ (parallel)
├── Person 3: Unit Tests (Task 3.2) ─────────────┤ (depends on 2.1, 3.1)
└── Person 1: Constants (Task 1.3) ──────────────┘

Week 3:
├── Person 2: Documentation (Task 2.3) ──────────┐
├── Person 3: Integration Tests (Task 3.3) ───────┤ (depends on 1.1, 2.1)
└── Person 3: Component Audit (Task 3.4) ─────────┘
```

## Collaboration Points

1. **Person 1 ↔ Person 2:** 
   - Person 2 needs API service interface from Person 1 for state management
   - Coordinate on error handling patterns

2. **Person 2 ↔ Person 3:**
   - Person 3 needs Zustand store structure from Person 2 for testing
   - Coordinate on test data structures

3. **Person 1 ↔ Person 3:**
   - Person 3 needs API mocks matching Person 1's API structure
   - Coordinate on error scenarios for testing

## Success Metrics

- ✅ All 9 technical debt items addressed
- ✅ **Application completely independent of Lovable.dev (CRITICAL)**
- ✅ Application deployable to any platform (Vercel, Netlify, AWS, etc.)
- ✅ Minimum 80% test coverage achieved
- ✅ TypeScript strict mode enabled
- ✅ API integration layer functional
- ✅ State management refactored
- ✅ Error handling implemented
- ✅ Documentation complete

## GitHub Issues to Create

Each person should create GitHub issues for their assigned tasks:

**Person 1 Issues:**
1. **"Remove Lovable.dev Platform Dependencies" (technical-debt, critical, highest-priority)** ⚡
2. "Implement Backend API Integration Layer" (technical-debt, critical)
3. "Add Error Handling and Error Boundaries" (technical-debt, critical)
4. "Extract Constants and Configuration" (refactor, medium)

**Person 2 Issues:**
1. "Refactor Monolithic State Management" (technical-debt, critical)
2. "Enable Strict TypeScript Configuration" (technical-debt, high)
3. "Add Component Documentation" (documentation-debt, medium)

**Person 3 Issues:**
1. "Set Up Testing Infrastructure" (test-debt, critical)
2. "Write Unit Tests for Components" (test-debt, critical)
3. "Write Integration and E2E Tests" (test-debt, high)
4. "Audit and Clean Up Unused Components" (refactor, medium)

---

*Task assignment created: January 22, 2026*  
*Updated: January 22, 2026 (added Lovable decoupling as critical priority)*  
*Estimated completion: 3 weeks*  
*Total team effort: 45-62 hours (includes Lovable decoupling)*
