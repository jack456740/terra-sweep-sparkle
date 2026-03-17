# Terra Sweep Sparkle - Clean Bot Dashboard

Autonomous cleaning robot control dashboard for outdoor and semi-outdoor environments.

## Project Overview

Terra Sweep Sparkle is a web-based dashboard and control interface for an autonomous cleaning robot developed at Howard University (Amazon FTR 5). The application provides real-time robot status monitoring, deployment controls, and project information display.

**Problem Statement:** Maintaining clean and debris-free environments, such as yards, sidewalks, and public spaces, is a time-consuming task that often requires constant human effort. This dashboard enables users to control and monitor an autonomous cleaning robot capable of navigating designated outdoor or semi-outdoor areas, identifying and collecting trash or debris efficiently.

**Tech Stack:**
- React 18.3.1
- TypeScript
- Vite 5.4.19
- shadcn/ui (Radix UI primitives)
- Tailwind CSS 3.4.17
- React Router v6
- TanStack React Query

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd terra-sweep-sparkle

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Development

### Project Structure

```text
src/
├── components/     # React components
│   ├── ui/        # shadcn/ui components
│   └── ...        # Feature components
├── pages/         # Page components
├── lib/           # Utilities, constants, config
├── hooks/         # Custom React hooks
└── services/      # API services (to be implemented)
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Key Features

- **Real-time Robot Monitoring:** Track robot status, battery level, location, and cleaning progress
- **Deployment Controls:** Deploy and stop robot operations
- **Status Notifications:** Receive updates on robot operations
- **Responsive Design:** Works on desktop and mobile devices

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to deploy

Or connect your GitHub repository to Vercel for automatic deployments.

### Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Build the project: `npm run build`
3. Deploy: `netlify deploy --prod --dir=dist`

### Self-Hosted

Build the application and serve the `dist/` directory with any static file server (nginx, Apache, etc.).

```bash
npm run build
# Serve the dist/ directory
```

## Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
VITE_DEPLOY_TIMEOUT_MS=2000
VITE_RETURN_TIMEOUT_MS=3000
VITE_CLEANING_INTERVAL_MS=2000
VITE_BATTERY_LOW_THRESHOLD=20
```

See `src/lib/config.ts` for how these values are used and defaults if they are not set.

## Project Status

**Current Status:** Prototype/Demo

The application is currently a frontend prototype with simulated robot operations. The following features are planned:

- [ ] Backend API integration
- [ ] Real robot hardware communication
- [ ] Authentication and authorization
- [ ] State persistence
- [ ] Comprehensive testing
- [ ] Error handling and recovery

See `TECHNICAL-DEBT-ANALYSIS.md` for detailed technical debt and improvement plans.

## User Stories

The dashboard supports multiple user personas:

- **Busy Homeowner:** Automatically maintain a clean yard without manual effort
- **Beach Security Officer:** Maintain cleanliness along the shoreline with real-time monitoring
- **Environmentalist Group:** Efficiently collect debris without harming wildlife
- **Groundskeeper:** Handle debris collection autonomously across multiple tasks
- **University President:** Maintain campus cleanliness and showcase innovation

See `src/components/UserStoriesSection.tsx` for detailed user stories.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Add license information]

## Acknowledgments

- Developed at Howard University (Amazon FTR 5)
- Built with modern React and TypeScript best practices
- UI components from shadcn/ui

---

For technical debt analysis and development roadmap, see:
- `TECHNICAL-DEBT-ANALYSIS.md` - Comprehensive technical debt assessment
- `TASK-ASSIGNMENT-3-TEAM-MEMBERS.txt` - Team task breakdown
- `vercel.json` and `.env.example` - Deployment and environment configuration
