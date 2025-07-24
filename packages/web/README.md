# AI Portfolio Tracker - Web Application

The web frontend for the AI Portfolio Tracker, a multi-agent Solana portfolio management application.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Phantom Wallet or similar Solana wallet browser extension

### Development Setup

```bash
# From the root of the monorepo
cd packages/web

# Install dependencies (or run from root: pnpm install)
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
pnpm dev

# Or start from monorepo root:
# pnpm --filter @org/web dev
```

### Environment Configuration

```bash
# .env
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3002
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
```

## 🎨 Features

### 📋 Dashboard
- Real-time portfolio overview
- Live performance metrics
- Asset allocation charts
- P&L tracking

### 🤖 Agent Management
- Configure and control AI agents
- Monitor agent status and performance
- Set automation rules and triggers
- View agent activity logs

### 📊 Portfolio Analytics
- Historical performance charts
- Risk analysis
- Asset correlations
- Performance attribution

### 🔔 Alerts & Notifications
- Custom price alerts
- Portfolio rebalancing notifications
- Agent status updates
- Real-time toast notifications

### 🐛 Wallet Integration
- Connect Phantom, Solflare, and other Solana wallets
- Real-time balance updates
- Transaction history
- Multi-wallet support

## 🏢️ Tech Stack

- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: React Query for server state
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Wallet Integration**: Solana Wallet Adapter
- **Real-time**: WebSocket connection

## 📜 Available Scripts

```bash
# Development
pnpm dev          # Start development server (http://localhost:5173)
pnpm dev:host     # Start with network access

# Building
pnpm build        # Build for production
pnpm preview      # Preview production build

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm type-check   # Run TypeScript checks

# Testing
pnpm test         # Run tests
pnpm test:ui      # Run tests with UI
pnpm test:coverage # Run tests with coverage
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Netlify

```bash
# Build the project
pnpm build

# Deploy dist folder to Netlify
# Or connect your Git repository for automatic deployments
```

### Docker

```bash
# Build Docker image
docker build -t portfolio-web .

# Run container
docker run -p 3000:3000 portfolio-web
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AgentStatusGrid.tsx
│   ├── DashboardLayout.tsx
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
│   ├── api/            # API client functions
│   ├── types.ts        # TypeScript type definitions
│   └── utils.ts        # Helper functions
├── pages/              # Page components
│   ├── Index.tsx       # Dashboard page
│   ├── Agents.tsx      # Agent management
│   ├── Portfolio.tsx   # Portfolio analytics
│   └── ...
└── providers/          # React context providers
    ├── QueryProvider.tsx
    └── WalletProvider.tsx
```
