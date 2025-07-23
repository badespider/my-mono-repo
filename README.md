# My Mono Repo

A modern monorepo containing backend, web, and mobile applications with shared tooling and CI/CD pipeline.

## 📁 Project Structure

```
my-mono-repo/
├── packages/
│   ├── backend/          # Node.js/Express API server
│   ├── web/              # React/Vite web application
│   └── mobile/           # React Native/Expo mobile app
├── .github/
│   └── workflows/        # CI/CD pipelines
├── .husky/               # Git hooks
└── package.json          # Root workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd my-mono-repo

# Install dependencies for all packages
pnpm install
```

## 📦 Available Scripts

### Root Level Scripts

Run these from the root directory to operate on all packages:

```bash
# Development
pnpm dev          # Start all packages in development mode
pnpm dev:all      # Same as above (explicit alias)

# Building
pnpm build        # Build all packages
pnpm build:all    # Same as above (explicit alias)

# Code Quality
pnpm lint         # Lint all packages
pnpm lint:all     # Same as above (explicit alias)
pnpm test         # Test all packages
pnpm test:all     # Same as above (explicit alias)
pnpm format       # Format all code with Prettier

# Git Hooks
pnpm prepare      # Install Husky git hooks
```

### Package-Specific Scripts

Run these to target specific packages:

```bash
# Backend (@org/backend)
pnpm --filter @org/backend dev          # Start backend in dev mode
pnpm --filter @org/backend build        # Build backend
pnpm --filter @org/backend test         # Test backend
pnpm --filter @org/backend lint         # Lint backend

# Web (@org/web)
pnpm --filter @org/web dev              # Start web app in dev mode
pnpm --filter @org/web build            # Build web app
pnpm --filter @org/web test             # Test web app
pnpm --filter @org/web lint             # Lint web app

# Mobile (@org/mobile)
pnpm --filter @org/mobile dev           # Start Expo development server
pnpm --filter @org/mobile build         # Build mobile app
pnpm --filter @org/mobile test          # Test mobile app
pnpm --filter @org/mobile lint          # Lint mobile app
```

## 🏗️ Packages

### Backend (@org/backend)

- **Framework**: Node.js with Express
- **Language**: TypeScript
- **Features**: CORS, Helmet security, Compression
- **Dev Tools**: Nodemon, tsx for development

### Web (@org/web)

- **Framework**: React with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Features**: React Router DOM

### Mobile (@org/mobile)

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Testing**: Jest with React Native Testing Library

## 🔧 Development Workflow

1. **Start Development**: Run `pnpm dev:all` to start all packages
2. **Make Changes**: Edit code in any package
3. **Code Quality**: Pre-commit hooks will run lint and format automatically
4. **Testing**: Run `pnpm test:all` to test all packages
5. **Building**: Run `pnpm build:all` to build for production

## 🚀 CI/CD Pipeline

The project includes GitHub Actions workflows for:

### CI Pipeline (`.github/workflows/ci.yml`)

- **Triggers**: Push/PR to main/develop branches
- **Node Versions**: Tests on Node.js 18.x and 20.x
- **Steps**:
  1. Type checking across all packages
  2. Linting all packages
  3. Testing all packages
  4. Building all packages
  5. Security audit
  6. Package-specific checks

### Deployment Pipeline (`.github/workflows/deploy.yml`)

- **Triggers**: Push to main/develop or manual dispatch
- **Environment**: Automatically deploys to staging (develop) or production (main)
- **Jobs**:
  - Backend deployment
  - Web deployment
  - Mobile app building

## 🛠️ Shared Tooling

### Code Quality

- **ESLint**: TypeScript-aware linting with Prettier integration
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Run linters on staged files only

### TypeScript

- Shared base configuration in `tsconfig.base.json`
- Package-specific extensions
- Workspace references for optimal build performance

### Package Management

- **pnpm workspaces**: Efficient dependency management
- **Workspace protocol**: Shared dependencies between packages
- **Catalog**: Centralized version management for common dependencies

## 📝 Adding New Packages

1. Create a new directory in `packages/`
2. Add `package.json` with name following `@org/package-name` pattern
3. Include standard scripts: `dev`, `build`, `test`, `lint`
4. Add to workspace automatically (already configured with `packages/*`)
5. Update CI pipeline if needed

## 🔒 Environment Variables

Each package can have its own environment configuration:

```bash
# Backend
packages/backend/.env

# Web
packages/web/.env

# Mobile
packages/mobile/.env
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm lint:all` and `pnpm test:all`
5. Commit using conventional commits
6. Push and create a Pull Request

## 📄 License

This project is private and proprietary.
