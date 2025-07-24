# 🚀 Deployment Guide

This guide covers deployment configurations for the AI Portfolio Tracker, including local development setup, preview environments, and production deployments.

## 📋 Prerequisites

Before deploying, ensure you have:

- [Node.js 18.x or 20.x](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- A Vercel or Netlify account
- Required API keys (see Environment Variables section)

## 🌍 Environment Configuration

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ai-portfolio-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm ci
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure `.env.local` with your values:**
   ```env
   # Core API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_WS_URL=ws://localhost:3001
   
   # Solana Configuration
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
   
   # Virtuals Protocol
   NEXT_PUBLIC_VIRTUALS_API_KEY=your_virtuals_api_key_here
   NEXT_PUBLIC_VIRTUALS_ENDPOINT=https://api.virtuals.io
   
   # Add other required API keys...
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

### Required Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes | `http://localhost:3001/api` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for real-time data | Yes | `ws://localhost:3001` |
| `NEXT_PUBLIC_SOLANA_NETWORK` | Solana network (devnet/testnet/mainnet-beta) | Yes | `devnet` |
| `NEXT_PUBLIC_SOLANA_RPC_ENDPOINT` | Solana RPC endpoint | Yes | `https://api.devnet.solana.com` |
| `NEXT_PUBLIC_VIRTUALS_API_KEY` | Virtuals Protocol API key | Yes | - |
| `NEXT_PUBLIC_VIRTUALS_ENDPOINT` | Virtuals Protocol API endpoint | Yes | `https://api.virtuals.io` |
| `COINGECKO_API_KEY` | CoinGecko API key for price data | No | - |
| `BIRDEYE_API_KEY` | Birdeye API key for Solana analytics | No | - |
| `OPENAI_API_KEY` | OpenAI API key for AI analysis | No | - |
| `DATABASE_URL` | PostgreSQL database URL | No | - |
| `NEXTAUTH_SECRET` | NextAuth.js secret (32+ characters) | No | - |
| `SENTRY_DSN` | Sentry DSN for error tracking | No | - |

## 🔄 CI/CD Pipeline

Our GitHub Actions workflows provide automated testing and deployment:

### Quality Gates

Every PR and push triggers:
- **Linting**: ESLint and Prettier checks
- **Unit Tests**: Vitest-based component and logic tests
- **Integration Tests**: API and service integration tests
- **Build Tests**: Production build verification
- **E2E Tests**: Playwright-based end-to-end tests (PRs only)
- **Security Scans**: Vulnerability and dependency checks

### Deployment Environments

| Environment | Trigger | URL Pattern | Purpose |
|-------------|---------|-------------|---------|
| **Preview** | Pull Request | `https://<branch>-ai-portfolio-tracker.vercel.app` | Feature review |
| **Staging** | Push to `develop` | `https://staging-ai-portfolio-tracker.vercel.app` | Pre-production testing |
| **Production** | Push to `main` | `https://ai-portfolio-tracker.vercel.app` | Live application |

## 🏗️ Vercel Deployment

### Initial Setup

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Link your project:**
   ```bash
   vercel link
   ```

3. **Configure environment variables in Vercel:**
   - Go to your project dashboard
   - Navigate to Settings → Environment Variables
   - Add all required variables from `.env.example`

### Required Secrets

Configure these in your GitHub repository settings:

```
VERCEL_TOKEN=<your_vercel_token>
VERCEL_ORG_ID=<your_vercel_org_id>
VERCEL_PROJECT_ID=<your_vercel_project_id>
```

### Manual Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Automatic Deployment

Deployments are automated via GitHub Actions:
- **PRs** → Preview deployments with unique URLs
- **Develop branch** → Staging environment
- **Main branch** → Production deployment

## 🌐 Netlify Deployment

### Initial Setup

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Initialize your site:**
   ```bash
   netlify init
   ```

3. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `.netlify/functions`

### Environment Variables

Add these in Netlify's dashboard under Site settings → Environment variables:
- All variables from `.env.example`
- Set `NODE_ENV=production`
- Set `NEXT_PUBLIC_APP_ENV=production`

### Deploy Commands

```bash
# Deploy to draft
netlify deploy

# Deploy to production
netlify deploy --prod
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t ai-portfolio-tracker .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-api.com/api \
  -e NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta \
  -e NEXT_PUBLIC_VIRTUALS_API_KEY=your_key \
  ai-portfolio-tracker
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://your-api.com/api
      - NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## 🔒 Security Configuration

### Environment-Specific Settings

#### Development
```env
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### Production
```env
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
CORS_ORIGINS=https://your-domain.com
SENTRY_DSN=your_sentry_dsn
```

### Security Headers

Both `vercel.json` and `netlify.toml` include security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: origin-when-cross-origin`

## 📊 Monitoring & Analytics

### Error Tracking

Configure Sentry for error monitoring:
```env
SENTRY_DSN=your_sentry_dsn_here
NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn_here
```

### Performance Monitoring

Enable performance monitoring:
```env
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check all environment variables are set
   - Verify Node.js version (18.x or 20.x)
   - Clear `.next` cache: `rm -rf .next`

2. **API Connection Issues**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS settings for your domain
   - Ensure WebSocket URL uses `wss://` in production

3. **Solana Connection Problems**
   - Verify RPC endpoint is accessible
   - Check network setting (devnet/testnet/mainnet-beta)
   - Test commitment level settings

4. **Environment Variable Issues**
   - Public variables must start with `NEXT_PUBLIC_`
   - Restart development server after changes
   - Check Vercel/Netlify dashboard for missing variables

### Debug Commands

```bash
# Check build output
npm run build

# Analyze bundle size
npx @next/bundle-analyzer

# Test production build locally
npm run build && npm start

# Run health checks
curl http://localhost:3000/api/health
```

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)

## 🆘 Support

If you encounter deployment issues:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review GitHub Actions logs for CI/CD issues
3. Check Vercel/Netlify deployment logs
4. Open an issue with detailed error information

---

**Happy Deploying! 🚀**
