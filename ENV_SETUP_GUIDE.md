# Environment Configuration Guide

This guide explains how to set up environment variables for the Portfolio Tracker multi-agent AI system on Solana.

## Overview

The project consists of multiple packages that require different environment configurations:

- **Backend** (`packages/backend`): Node.js/Express server with Solana integration
- **Web** (`packages/web`): React/Vite frontend application  
- **Mobile** (`packages/mobile`): Expo/React Native mobile app
- **Shared** (`packages/shared`): Common utilities and types

## Backend Environment (packages/backend/.env)

### Required Configuration

Copy `packages/backend/.env.example` to `packages/backend/.env` and update the following:

#### Core Server Settings
```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

#### Solana Configuration (Required)
```env
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WS_URL=wss://api.devnet.solana.com
SOLANA_NETWORK=devnet
```

#### Multi-Agent System Settings
```env
MONITORING_AGENT_INTERVAL=60000     # 1 minute
ANALYSIS_AGENT_INTERVAL=300000      # 5 minutes  
REBALANCING_AGENT_INTERVAL=900000   # 15 minutes
ALERT_AGENT_INTERVAL=30000          # 30 seconds
```

#### AI/LLM Configuration (Required for Agents)
```env
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

#### External APIs (Required)
```env
VIRTUALS_API_KEY=your-virtuals-api-key
COINGECKO_API_KEY=your-coingecko-api-key
```

#### Database (Required)
```env
DATABASE_URL=mongodb://localhost:27017/portfolio-tracker
REDIS_URL=redis://localhost:6379
```

#### Security (Required - Change These!)
```env
JWT_SECRET=your-jwt-secret-key-change-this-in-production
SESSION_SECRET=your-session-secret-change-this-in-production
```

## Frontend Environment (packages/web/.env)

Copy `packages/web/.env.example` to `packages/web/.env` and configure:

### Required Settings
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001/ws
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_SOLANA_NETWORK=devnet
```

### Feature Flags
```env
VITE_ENABLE_MOCK_DATA=true          # Use mock data for development
VITE_ENABLE_REAL_WALLET=false       # Enable real wallet connections
VITE_ENABLE_NOTIFICATIONS=true      # Enable push notifications
```

## Getting API Keys

### OpenAI API Key
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `OPENAI_API_KEY` in backend `.env`

### Anthropic API Key  
1. Visit https://console.anthropic.com/
2. Create an API key
3. Add to `ANTHROPIC_API_KEY` in backend `.env`

### CoinGecko API Key
1. Visit https://www.coingecko.com/en/api
2. Sign up for Pro API (free tier available)
3. Add to `COINGECKO_API_KEY` in backend `.env`

### Virtuals Protocol API Key
1. Visit https://virtuals.io/
2. Follow their documentation to get API access
3. Add to `VIRTUALS_API_KEY` in backend `.env`

## Database Setup

### MongoDB
1. Install MongoDB locally or use MongoDB Atlas
2. Update `DATABASE_URL` in backend `.env`
3. Database will be created automatically on first run

### Redis (Optional but Recommended)
1. Install Redis locally or use Redis Cloud
2. Update `REDIS_URL` in backend `.env`
3. Used for caching and agent coordination

## Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment files:**
   ```bash
   # Backend
   cp packages/backend/.env.example packages/backend/.env
   # Edit packages/backend/.env with your values
   
   # Frontend  
   cp packages/web/.env.example packages/web/.env
   # Edit packages/web/.env with your values
   ```

3. **Start services:**
   ```bash
   # Start backend (port 3001)
   cd packages/backend
   npm run dev
   
   # Start frontend (port 3000)
   cd packages/web  
   npm run dev
   ```

## Production Considerations

### Security
- Change all default secrets and keys
- Use secure random strings for JWT_SECRET and SESSION_SECRET
- Enable HTTPS in production
- Restrict CORS_ORIGIN to your production domain

### Solana Network
- Switch to mainnet-beta for production:
  ```env
  SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
  SOLANA_NETWORK=mainnet-beta
  ```

### Environment Variables
- Use environment variable management (AWS Secrets Manager, etc.)
- Never commit API keys to version control
- Use different configurations for staging/production

## Agent Configuration

The multi-agent system uses these intervals (in milliseconds):

- **Monitoring Agent**: Checks prices and portfolio status every minute
- **Analysis Agent**: Performs trend analysis every 5 minutes  
- **Rebalancing Agent**: Evaluates rebalancing needs every 15 minutes
- **Alert Agent**: Checks for alert conditions every 30 seconds

Adjust these intervals based on your needs and API rate limits.

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 (frontend) and 3001 (backend) are available
2. **API rate limits**: Reduce agent intervals if hitting rate limits
3. **MongoDB connection**: Verify DATABASE_URL and MongoDB is running
4. **CORS errors**: Check CORS_ORIGIN matches frontend URL
5. **WebSocket issues**: Verify WS_URL configuration matches backend

### Environment Variable Loading

- Backend uses `dotenv` to load `.env` files
- Frontend (Vite) only loads variables prefixed with `VITE_`
- Restart servers after changing environment variables
