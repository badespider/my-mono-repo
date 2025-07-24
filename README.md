# AI Portfolio Tracker

A multi-agent AI portfolio tracker micro SaaS app on Solana using Virtuals Protocol. Features agents for monitoring, analysis, rebalancing, and alerts with live Solana wallet integration.

## 📁 Project Structure

```
ai-portfolio-tracker/
├── packages/
│   ├── backend/          # Node.js/Express API server with WebSocket support
│   ├── web/              # React/Vite web application with shadcn/ui
│   ├── shared/           # Shared utilities and types
│   └── mobile/           # React Native/Expo mobile app (future)
├── ai-portfolio-tracker/ # Next.js alternative frontend implementation
├── .github/
│   └── workflows/        # CI/CD pipelines
├── .husky/               # Git hooks
└── package.json          # Root workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Solana CLI (for Solana testnet integration)
- Phantom Wallet or similar Solana wallet

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-portfolio-tracker

# Install dependencies for all packages
pnpm install

# Set up environment variables
cp .env.example .env
cp packages/backend/.env.example packages/backend/.env
cp packages/web/.env.example packages/web/.env

# Configure your environment variables in the .env files
# See ENVIRONMENT.md for detailed setup instructions
```

### Quick Start

```bash
# Start all services in development mode
pnpm dev

# This will start:
# - Backend API server on http://localhost:3001
# - Web application on http://localhost:5173
# - WebSocket server for real-time updates
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

## 🤖 AI Agents

The application features four specialized AI agents:

### 🔍 Monitoring Agent
- Real-time portfolio tracking
- Price alerts and notifications
- Performance monitoring
- Risk assessment

### 📊 Analysis Agent
- Market analysis and insights
- Technical indicators
- Sentiment analysis
- Performance reporting

### ⚖️ Rebalancing Agent
- Automated portfolio rebalancing
- Risk-based allocation adjustments
- Dollar-cost averaging strategies
- Smart order execution

### 🚨 Alerts Agent
- Custom alert conditions
- Multi-channel notifications
- Smart filtering
- Historical alert tracking

## 🏢️ Architecture

### Backend (@org/backend)
- **Framework**: Node.js with Express
- **Language**: TypeScript
- **Features**: WebSocket real-time data, Solana integration, Agent orchestration
- **APIs**: Portfolio management, Agent control, WebSocket endpoints

### Web (@org/web)
- **Framework**: React with Vite
- **Language**: TypeScript
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Features**: Wallet integration, Real-time updates, Agent management

### Shared (@org/shared)
- **Utilities**: Solana helpers, UI utilities, Type definitions
- **Common Types**: Agent interfaces, Portfolio types, API contracts

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

Each package requires specific environment configuration:

### Backend Environment
```bash
# packages/backend/.env
PORT=3001
SOLANA_RPC_URL=https://api.devnet.solana.com
VIRTUALS_API_KEY=your-virtuals-api-key
WEBSOCKET_PORT=3002
```

### Web Environment
```bash
# packages/web/.env
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3002
VITE_SOLANA_NETWORK=devnet
```

See `ENVIRONMENT.md` for complete environment setup guide.

## 🚀 Deployment

### Production Deployment

```bash
# Build all packages
pnpm build:all

# Deploy backend (example using PM2)
cd packages/backend
pm2 start dist/index.js --name "portfolio-backend"

# Deploy web (example using Vercel)
cd packages/web
vercel --prod
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual services
docker build -t portfolio-backend ./packages/backend
docker build -t portfolio-web ./packages/web
```

### Environment-Specific Configurations

- **Development**: Uses Solana devnet, local services
- **Staging**: Uses Solana testnet, cloud services with test data
- **Production**: Uses Solana mainnet, full cloud infrastructure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm lint:all` and `pnpm test:all`
5. Commit using conventional commits
6. Push and create a Pull Request

## 📄 License

This project is private and proprietary.
