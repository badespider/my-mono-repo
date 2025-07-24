# Environment Configuration

This document outlines the environment setup for the AI Portfolio Tracker monorepo.

## Environment Variables

### Required Variables

The following environment variables are required for the application to function properly:

#### Frontend (Web Package)
- `VITE_API_URL` - Backend API URL (e.g., `http://localhost:3001` for development)
- `VITE_SOLANA_RPC_URL` - Solana RPC endpoint (e.g., `https://api.devnet.solana.com`)

#### Backend Package
- `DATABASE_URL` - PostgreSQL database connection string
- `REDIS_URL` - Redis cache connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `SOLANA_RPC_URL` - Solana RPC endpoint for backend operations

### Setup Instructions

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the values in `.env`** according to your environment:
   - For development, you can use the default values
   - For production, ensure all secrets are properly configured

3. **Package-specific environment files:**
   - Each package (`packages/web`, `packages/backend`) has its own `.env.example`
   - Copy and configure these as needed: `cp packages/web/.env.example packages/web/.env`

### Environment Hierarchy

The environment variables are loaded in the following order of precedence:

1. Package-specific `.env` files (highest priority)
2. Root `.env` file
3. System environment variables
4. Default values from `.env.example` files (lowest priority)

### CI/CD Configuration

The GitHub Actions workflow automatically:

- Caches pnpm dependencies for faster builds
- Uses environment-specific values for production builds
- Uploads build artifacts with retention policies
- Supports configurable environment variables via GitHub secrets

#### GitHub Secrets Configuration

Set the following secrets in your GitHub repository settings:

- `VITE_API_URL` - Production API URL
- `VITE_SOLANA_RPC_URL` - Production Solana RPC URL
- `VITE_SOLANA_NETWORK` - Production Solana network (mainnet-beta)

### Security Considerations

- Never commit `.env` files to version control
- Use strong, unique secrets for production environments
- Rotate secrets regularly
- Use environment-specific RPC endpoints
- Enable rate limiting and monitoring in production

### Troubleshooting

#### Common Issues

1. **Missing environment variables:**
   - Check that all required variables are set
   - Verify variable names match exactly (case-sensitive)

2. **Build failures:**
   - Ensure VITE_ prefixed variables are available at build time
   - Check that the pnpm lockfile is up to date

3. **RPC connection issues:**
   - Verify Solana RPC endpoint is accessible
   - Check network configuration (devnet vs mainnet-beta)

For more help, see the individual package README files or contact the development team.
