# Clean Bot - System Architecture Documentation

## Project Overview

Clean Bot is a web-based dashboard and control interface for an autonomous cleaning robot developed at Howard University (Amazon FTR 5). The application provides real-time robot status monitoring, deployment controls, and project information display.

**Tech Stack:**
- Frontend Framework: React 18.3.1
- Language: TypeScript
- Build Tool: Vite 5.4.19
- UI Component Library: shadcn/ui (Radix UI primitives)
- Styling: Tailwind CSS 3.4.17
- Routing: React Router v6
- State Management: React Hooks (local state) + React Query
- Form Handling: React Hook Form + Zod
- Charts: Recharts 2.15.4
- Notifications: Sonner + Radix Toast

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              App.tsx (Root Router)                    │   │
│  │   - QueryClientProvider (React Query)               │   │
│  │   - TooltipProvider (UI Context)                     │   │
│  │   - BrowserRouter (React Router)                     │   │
│  │   - Toast/Sonner Notification System                │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Index Page (Single Page App)               │   │
│  │  Composes all major sections in sequence            │   │
│  └──────────────────────────────────────────────────────┘   │
│      ↓          ↓          ↓          ↓          ↓           │
│  ┌────────┬──────────┬──────────┬──────────┬──────────────┐ │
│  │ Nav    │ Hero     │ Team     │ Problem  │ Project      │ │
│  │Section │ Section  │ Section  │ Section  │ Section      │ │
│  └────────┴──────────┴──────────┴──────────┴──────────────┘ │
│      ↓          ↓          ↓                                  │
│  ┌────────┬──────────┬──────────────────────────────────┐   │
│  │Dashboard Section  │  User Stories  │  Footer         │   │
│  └────────┬──────────┴──────────────────────────────────┘   │
│           ↓                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Dashboard Sub-Components (Robot Control)             │   │
│  │ - DeployButton        - RobotStatusCard              │   │
│  │ - BatteryIndicator    - CleaningProgress             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  UI Component Library (/src/components/ui)           │   │
│  │  - 40+ shadcn/ui components (Radix UI primitives)   │   │
│  │  - Custom hooks: use-toast, use-mobile               │   │
│  │  - Utilities: cn (classname merger)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

#### Top-Level Structure (Index.tsx)

```
Index (pages/Index.tsx)
├── Navigation
├── HeroSection
├── TeamSection
├── ProblemSection
├── ProjectSection
├── DashboardSection (Interactive Robot Control)
│   ├── DeployButton
│   ├── RobotStatusCard
│   ├── BatteryIndicator
│   └── CleaningProgress
├── UserStoriesSection
└── Footer
```

### Component Breakdown

#### Layout & Navigation Components
- **Navigation** (`Navigation.tsx`): Sticky header with logo, desktop nav menu, mobile hamburger menu
- **Header** (`Header.tsx`): Additional header UI component
- **Footer** (`Footer.tsx`): Application footer

#### Content Sections (Marketing/Information)
- **HeroSection** (`HeroSection.tsx`): Landing hero with CTA buttons, animated branding
- **TeamSection** (`TeamSection.tsx`): Team member profiles
- **ProblemSection** (`ProblemSection.tsx`): Problem statement / motivation
- **ProjectSection** (`ProjectSection.tsx`): Project details and technical info
- **UserStoriesSection** (`UserStoriesSection.tsx`): User stories and use cases

#### Interactive Dashboard Components
- **DashboardSection** (`DashboardSection.tsx`): Main stateful container managing robot state
  - Manages: `deployState`, `robotStatus`, `battery`, `location`, `cleaningProgress`
  - Handles deployment/stop logic with setTimeout-based state transitions
  - Integrates battery depletion simulation
  
- **DeployButton** (`DeployButton.tsx`): Visual control button
  - States: idle, deploying, deployed
  - Disabled when deploying
  - Visual feedback with gradient colors and animations
  
- **RobotStatusCard** (`RobotStatusCard.tsx`): Status display with connectivity indicator
  - Displays: current status, location, runtime, area cleaned
  - Shows connection status (Wifi/WifiOff icons)
  - Dynamic styling based on robot status (idle, cleaning, returning, charging, offline)
  
- **BatteryIndicator** (`BatteryIndicator.tsx`): Battery level visualization
  - Color-coded: red (<20%), orange (20-50%), green (50%+)
  - Shows charging state with pulse animation
  - Displays percentage and charging status
  
- **CleaningProgress** (`CleaningProgress.tsx`): Progress visualization
  - Shows percentage and area cleaned in m²
  - Completion badge when 100%
  - Active/inactive state indicator

#### UI Component Library (/src/components/ui)
40+ shadcn/ui components built on Radix UI:
- **Form Components**: form, input, textarea, select, checkbox, radio-group, toggle, switch
- **Display Components**: card, badge, alert, progress, skeleton, table
- **Dialog/Overlay**: dialog, alert-dialog, dropdown-menu, context-menu, popover, tooltip, hover-card
- **Navigation**: navigation-menu, menubar, pagination, tabs, breadcrumb
- **Layout**: sidebar, resizable, scroll-area, separator, sheet, drawer
- **Data Display**: carousel, chart, accordion, collapsible
- **Misc**: button, label, command, calendar, input-otp, aspect-ratio

#### Custom Hooks (/src/hooks)
- **use-toast** (`hooks/use-toast.ts`): Toast notification management
- **use-mobile** (`hooks/use-mobile.tsx`): Mobile responsiveness detection

#### Utilities (/src/lib)
- **utils.ts**: `cn()` function for merging Tailwind class names with class-variance-authority

---

## Data Flow & State Management

### State Architecture

**Local Component State (React Hooks)**
- All application state is managed locally within `DashboardSection` component
- Uses `useState` for managing multiple state variables

**State Variables in DashboardSection:**
```typescript
const [deployState, setDeployState] = useState<"idle" | "deploying" | "deployed">("idle")
const [robotStatus, setRobotStatus] = useState<"idle" | "cleaning" | "returning" | "charging" | "offline">("idle")
const [battery, setBattery] = useState(78)
const [location, setLocation] = useState("Home Base")
const [cleaningProgress, setCleaningProgress] = useState(0)
```

### Data Flow Diagram

```
User Action (Click Deploy Button)
        ↓
DeployButton.onDeploy() callback
        ↓
DashboardSection.handleDeploy()
        ↓
Update deployState → "deploying"
Show Toast Notification
        ↓
setTimeout (2000ms)
        ↓
setDeployState("deployed")
setRobotStatus("cleaning")
setLocation("Zone A - North Side")
Show Success Toast
        ↓
Child Components Re-render with new props
        ↓
UI Updates (button color, status badge, animations)
```

### Notification System
- **Sonner**: Toast notifications for user feedback (info, success)
- **Toast/Toaster**: Secondary notification system from shadcn/ui
- Centralized notification dispatching via toast callbacks

### State Transitions

**Deploy Flow:**
```
idle → deploying (2s) → deployed
              ↓
        robot: cleaning
```

**Stop Flow:**
```
deployed → idle
   ↓
returning (3s) → idle
   ↓
robot: idle
```

**Battery Management:**
- Simulated depletion during cleaning (every 100ms, -2% per tick)
- Auto-triggers return when battery ≤ 20%
- Shows "Returning (Low Battery)" location

---

## External Dependencies & Integrations

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | DOM rendering |
| react-router-dom | ^6.30.1 | Client-side routing |
| @tanstack/react-query | ^5.83.0 | Data fetching & caching |
| typescript | ^5.8.3 | Type safety |

### UI & Styling

| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | ^3.4.17 | Utility-first CSS |
| @radix-ui/* | Latest | Accessible UI primitives |
| shadcn/ui | - | Component library (bundled) |
| lucide-react | ^0.462.0 | Icon library |
| sonner | ^1.7.4 | Toast notifications |

### Form & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| react-hook-form | ^7.61.1 | Form state management |
| @hookform/resolvers | ^3.10.0 | Form validation resolvers |
| zod | ^3.25.76 | Schema validation |

### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| clsx | ^2.1.1 | Conditional classnames |
| tailwind-merge | ^2.6.0 | Merge Tailwind classes intelligently |
| class-variance-authority | ^0.7.1 | CSS-in-JS variants |
| date-fns | ^3.6.0 | Date manipulation |
| next-themes | ^0.3.0 | Theme management |

### Charts & Data Visualization

| Package | Version | Purpose |
|---------|---------|---------|
| recharts | ^2.15.4 | React charting library |
| embla-carousel-react | ^8.6.0 | Carousel component |

### Build Tools

| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^5.4.19 | Build tool & dev server |
| @vitejs/plugin-react-swc | ^3.11.0 | SWC compiler for React |
| eslint | ^9.32.0 | Code linting |
| lovable-tagger | ^1.1.11 | Component tagging (dev) |

---

## Technical Debt & Issues

### 🔴 Critical Issues

1. **No Backend Integration**
   - **Issue**: All robot state is simulated client-side with `setTimeout`
   - **Impact**: No real robot connectivity, state is lost on page refresh
   - **Risk Level**: Critical
   - **Mitigation**: Implement real WebSocket/REST API for robot commands

2. **Missing API Communication Layer**
   - **Issue**: No HTTP client setup (axios, fetch wrapper) or API service layer
   - **Impact**: Cannot connect to actual robot hardware or backend server
   - **Risk Level**: Critical
   - **Mitigation**: Implement REST API client + WebSocket for real-time updates

3. **No Error Handling**
   - **Issue**: Zero error boundaries, try-catch blocks, or error states for deployment failures
   - **Impact**: Silent failures, unrecoverable states, poor UX on errors
   - **Risk Level**: Critical
   - **Mitigation**: Add error boundaries, error states, and retry logic

4. **No Authentication/Authorization**
   - **Issue**: No user login, token management, or permission checking
   - **Impact**: Anyone can control the robot, no access control
   - **Risk Level**: High
   - **Mitigation**: Implement OAuth/JWT-based auth system

### 🟠 High Priority Issues

5. **Loose TypeScript Configuration**
   - **Issue**: `noImplicitAny: false`, `strictNullChecks: false`, `noUnusedLocals: false`
   - **Impact**: Type safety issues, potential runtime errors
   - **Risk Level**: High
   - **Location**: [tsconfig.json](tsconfig.json)
   - **Mitigation**: Enable strict mode for better type safety

6. **All State in DashboardSection Component**
   - **Issue**: No state management library (Redux, Zustand, Jotai); everything in one component
   - **Impact**: Hard to scale, difficult testing, prop drilling pain points
   - **Risk Level**: High
   - **Mitigation**: Implement global state management or context API

7. **No Persistent State**
   - **Issue**: State not saved to localStorage, lost on refresh
   - **Impact**: User experience degradation, no recovery from crashes
   - **Risk Level**: Medium
   - **Mitigation**: Implement localStorage persistence or server-side sessions

8. **Hardcoded Values & Magic Strings**
   - **Issue**: Robot statuses, locations, timing delays hardcoded in components
   - **Impact**: Difficult to maintain and test
   - **Locations**: DashboardSection, RobotStatusCard
   - **Mitigation**: Extract to constants/config file

### 🟡 Medium Priority Issues

9. **No Loading States**
   - **Issue**: Deployment shows "Deploying..." but network requests (if any) not tracked
   - **Impact**: Users don't know real status of operations
   - **Risk Level**: Medium
   - **Mitigation**: Implement proper loading states with cancel mechanisms

10. **Missing Accessibility Features**
    - **Issue**: Limited ARIA labels, keyboard navigation not tested
    - **Impact**: App not accessible to users with disabilities
    - **Risk Level**: Medium
    - **Mitigation**: Audit and enhance accessibility compliance

11. **No Performance Optimization**
    - **Issue**: No code splitting, lazy loading, or memoization strategies
    - **Impact**: Large initial bundle size, unnecessary re-renders
    - **Risk Level**: Low-Medium
    - **Mitigation**: Add React.memo, lazy imports, bundle analysis

12. **Unused Dependencies**
    - **Issue**: Many UI components imported but never used
    - **Impact**: Larger bundle size, maintenance burden
    - **Locations**: /src/components/ui (40+ components, most unused)
    - **Mitigation**: Remove unused components or document intent to use

13. **No Testing**
    - **Issue**: No unit tests, integration tests, or E2E tests
    - **Impact**: Changes risk breaking functionality, regression bugs
    - **Risk Level**: Medium
    - **Mitigation**: Implement Jest + React Testing Library

14. **No Documentation**
    - **Issue**: Components lack JSDoc comments, no API docs
    - **Impact**: Difficult for new developers to understand code
    - **Risk Level**: Low
    - **Mitigation**: Add TSDoc comments and API documentation

---

## Technical Risks & Unknowns

### 🔴 Unknowns - Missing Information

1. **Robot Hardware Integration**
   - How does the frontend communicate with the actual robot?
   - What is the protocol (ROS, HTTP, MQTT, custom)?
   - What is the expected latency and reliability?
   - **Impact**: Critical blocker for production deployment

2. **Backend Architecture**
   - Does a backend server exist? What framework (Node, Python, etc.)?
   - How are commands sent to the robot?
   - Where is robot state managed?
   - **Impact**: Architecture design decisions depend on this

3. **Real-time Data Requirements**
   - What is the update frequency for battery, location, progress?
   - Does robot send periodic status updates?
   - Are WebSockets or polling needed?
   - **Impact**: Performance and scalability implications

4. **Deployment Environment**
   - Where will this be deployed? (Cloud, on-premise, edge?)
   - What are the infrastructure requirements?
   - Is HTTPS/WSS required?
   - **Impact**: Security and deployment considerations

5. **Multi-Robot Support**
   - Current UI assumes single robot
   - Will system need to control multiple robots?
   - Need robot selection/management UI?
   - **Impact**: Major architecture changes if needed

6. **Data Persistence Strategy**
   - Should robot state be stored in database?
   - What historical data needs to be tracked?
   - Retention policies?
   - **Impact**: Storage and query performance

7. **Security Requirements**
   - Is field-level authorization needed?
   - CORS policy requirements?
   - Rate limiting for API?
   - **Impact**: API design and infrastructure setup

### 🟠 Risks - Known Issues

1. **State Loss on Refresh**
   - **Risk**: Simulated deployment state is lost on page reload
   - **Mitigation**: Implement localStorage persistence or backend session

2. **No Graceful Degradation**
   - **Risk**: If backend is unavailable, entire app fails
   - **Mitigation**: Implement fallback UI and offline mode

3. **Battery Simulation Unrealistic**
   - **Risk**: Linear battery drain (-2% per tick) doesn't match real hardware
   - **Impact**: Poor testing/demo with actual robot
   - **Mitigation**: Update simulation to match real robot metrics

4. **Hardcoded Timing**
   - **Risk**: 2s deploy, 3s return, 100ms battery tick - not based on real robot
   - **Impact**: Demo timing mismatch with production
   - **Mitigation**: Make timing configurable

5. **No Concurrency Control**
   - **Risk**: User can spam deploy/stop buttons, creating race conditions
   - **Impact**: Inconsistent state, duplicate commands
   - **Mitigation**: Implement command queue and debouncing

6. **Toast Notifications Missing Close**
   - **Risk**: Sonner toasts may stack and clutter UI
   - **Impact**: Poor UX if many notifications triggered
   - **Mitigation**: Limit toast count, add dismissal controls

7. **No Timeout Handling**
   - **Risk**: Long-running operations (deployment, charging) have no timeout
   - **Impact**: Robot could be stuck "deploying" indefinitely
   - **Mitigation**: Implement operation timeouts with error states

---

## System Limitations & Constraints

### Architectural Limitations

1. **Single Page App Structure**
   - Only one route (`/`) besides 404
   - No multi-page flows or navigation patterns
   - Limited to single-robot dashboard

2. **Client-Side Only**
   - No server-side rendering
   - No backend API
   - No real data persistence

3. **State Management Scalability**
   - React local state won't scale to multiple robots or features
   - Need global state solution for larger app

4. **Performance**
   - 40+ unused UI components in bundle
   - No code splitting or lazy loading
   - No performance monitoring

5. **Testing Limitations**
   - Client-side simulation can't test actual robot behavior
   - No E2E testing with real hardware

### Known Constraints

- **No Mobile Optimization**: UI components present, but not fully tested on mobile
- **No Offline Support**: App requires internet (no service worker)
- **No Dark Mode**: next-themes present but not implemented
- **No Internationalization**: English-only UI
- **No Analytics**: No user tracking or metrics

---

## Recommendations for Future Development

### Phase 1: Foundation (Critical)
- [ ] Implement backend API integration layer
- [ ] Add real robot WebSocket/REST communication
- [ ] Implement proper error handling and error boundaries
- [ ] Add authentication/authorization system
- [ ] Enable strict TypeScript configuration

### Phase 2: Infrastructure
- [ ] Set up state management (Zustand or Context API)
- [ ] Implement localStorage persistence or server sessions
- [ ] Add comprehensive testing (Jest + React Testing Library)
- [ ] Remove unused UI components or document intent
- [ ] Set up CI/CD pipeline with linting and testing

### Phase 3: Features
- [ ] Multi-robot support and management UI
- [ ] Historical data tracking and analytics dashboard
- [ ] Real-time WebSocket communication for live updates
- [ ] Scheduled cleaning/automation features
- [ ] User preferences and settings

### Phase 4: Polish
- [ ] Comprehensive accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Mobile-first responsive design review
- [ ] Dark mode implementation
- [ ] Internationalization (i18n) setup
- [ ] Documentation and API reference

---

## File Structure Reference

```
src/
├── App.tsx                          # Root router setup
├── main.tsx                         # Entry point
├── App.css                          # Global styles
├── index.css                        # Tailwind imports
├── vite-env.d.ts                   # Vite type definitions
│
├── pages/
│   ├── Index.tsx                   # Main page composing all sections
│   └── NotFound.tsx                # 404 page
│
├── components/
│   ├── Navigation.tsx              # Sticky header nav
│   ├── Header.tsx                  # Additional header component
│   ├── HeroSection.tsx             # Landing hero
│   ├── TeamSection.tsx             # Team profiles
│   ├── ProblemSection.tsx          # Problem statement
│   ├── ProjectSection.tsx          # Project details
│   ├── UserStoriesSection.tsx      # User stories
│   ├── Footer.tsx                  # Footer section
│   │
│   ├── DashboardSection.tsx        # Main robot control container
│   ├── DeployButton.tsx            # Robot deploy/stop button
│   ├── RobotStatusCard.tsx         # Robot status display
│   ├── BatteryIndicator.tsx        # Battery level display
│   ├── CleaningProgress.tsx        # Progress visualization
│   │
│   ├── NavLink.tsx                 # Navigation link component
│   │
│   └── ui/                         # shadcn/ui component library (40+ components)
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── ... (30+ more UI components)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── select.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── tooltip.tsx
│       ├── use-toast.ts
│       └── ... (additional UI exports)
│
├── hooks/
│   ├── use-toast.ts                # Toast notification hook
│   └── use-mobile.tsx              # Mobile detection hook
│
├── lib/
│   └── utils.ts                    # cn() classname merger utility
│
public/
└── robots.txt

Configuration Files:
├── vite.config.ts                  # Vite build configuration
├── tsconfig.json                   # TypeScript base config
├── tsconfig.app.json               # App TypeScript config
├── tsconfig.node.json              # Node TypeScript config
├── tailwind.config.ts              # Tailwind CSS config
├── postcss.config.js               # PostCSS config
├── eslint.config.js                # ESLint configuration
├── components.json                 # shadcn/ui config
├── package.json                    # Dependencies
└── bun.lockb                        # Lock file (using Bun package manager)
```

---

## Conclusion

The Clean Bot frontend is a well-designed, component-based React application with a modern tech stack. However, it is **currently a prototype/demo** lacking critical production features:

**Key Strengths:**
- ✅ Modern React with TypeScript
- ✅ Comprehensive UI component library
- ✅ Clean component architecture
- ✅ Professional styling with Tailwind CSS

**Critical Gaps:**
- ❌ No real backend/robot integration
- ❌ No error handling
- ❌ No authentication
- ❌ No persistence
- ❌ No testing

**Next Steps:**
1. Clarify robot communication protocol
2. Implement backend API integration
3. Add error handling and validation
4. Set up proper state management
5. Add comprehensive testing

---

*Documentation Generated: January 22, 2026*
*Last Updated: January 22, 2026*
